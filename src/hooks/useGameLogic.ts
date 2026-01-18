import { useCallback, useEffect, useMemo, useState } from 'react';

import { SCENARIO } from '@/data/alphaScenario';
import { CHARACTERS } from '@/data/characters';
import { useGameEffects } from '@/hooks/useGameEffects';
import { useGameSync } from '@/hooks/useGameSync';
import { DialogueLine } from '@/types/dialogue';
import { GameLogEntry, LogType } from '@/types/game';
import { say } from '@/utils/dialogueUtils';

export const createLog = (type: LogType, message: string, details?: string): GameLogEntry => ({
    id: crypto.randomUUID(),
    timestamp: Date.now(),
    type,
    message,
    details,
});

const toMs = (timestamp: number | string | undefined) => {
    if (!timestamp) return 0;
    const num = Number(timestamp);
    return isNaN(num) ? 0 : num < 100000000000 ? num * 1000 : num;
};

export const useGameLogic = (
    gameCode: string | null,
    initialIsHost: boolean,
    playerId: string,
    pseudo: string
) => {
    const { gameState, updateState, error } = useGameSync(gameCode, initialIsHost);

    // calcul dynamique du statut 'hôte' en checkant la liste des joueurs actuelle
    const isHost = useMemo(() => {
        if (!gameState?.players) return initialIsHost;
        const me = gameState.players.find((p) => p.id === playerId);
        return me ? me.isGM : initialIsHost;
    }, [gameState?.players, playerId, initialIsHost]);

    const [isLeavingState, setIsLeavingState] = useState(false);

    const [adminDialogueOpen, setAdminDialogueOpen] = useState(false);
    const [adminScript, setAdminScript] = useState<DialogueLine[]>([]);
    const [activeChallenge, setActiveChallenge] = useState<{ type: string; id: number } | null>(
        null
    );
    const [currentTime, setCurrentTime] = useState(() => Date.now());

    // si le playerId change (login ou logout), on déverrouille le state 'Leaving'
    useEffect(() => {
        setIsLeavingState(false);
    }, [playerId, gameCode]);

    // init auto (création de session)
    useEffect(() => {
        if (initialIsHost && gameState && (!gameState.step || gameState.step === 0)) {
            const now = Date.now();
            updateState({
                ...gameState,
                step: 1,
                message: 'Protocole Alpha Initié',
                startTime: now,
                timestamp: now,
                lastStepTime: now,
                players: [{ id: playerId, name: pseudo || 'Hôte', isGM: true, joinedAt: now }],
                history: [],
                pendingProposal: null,
                validationRequest: null,
                lastUpdate: now,
                lastModuleAction: null,
                logs: [createLog('INFO', 'Session initialisée', `Créée par ${pseudo}`)],
            });
        }
    }, [initialIsHost, gameState, updateState, playerId, pseudo]);

    // gestion de départ
    const leaveGame = async () => {
        setIsLeavingState(true);
        if (!gameState || !gameState.players) return;

        const currentPlayers = gameState.players;
        const remainingPlayers = currentPlayers.filter((p) => p.id !== playerId);

        // si j'étais le GM et qu'il reste quelqu'un
        if (isHost && remainingPlayers.length > 0) {
            // promeut le premier de la liste restante
            const updatedPlayers = remainingPlayers.map((p, index) =>
                index === 0 ? { ...p, isGM: true } : p
            );

            await updateState({
                ...gameState,
                players: updatedPlayers,
                message: 'Changement de commandement...',
                logs: [
                    ...(gameState.logs || []),
                    createLog('WARNING', `Départ de l'hôte (${pseudo})`),
                    createLog('INFO', 'Nouveau leadership', `Hôte : ${updatedPlayers[0].name}`),
                ],
            });
        } else {
            // sinon je pars juste
            await updateState({
                ...gameState,
                players: remainingPlayers,
                logs: [
                    ...(gameState.logs || []),
                    createLog('PLAYER', 'Déconnexion agent', `${pseudo} a quitté la session`),
                ],
            });
        }
    };

    // si l'hôte a crashé sans appeler leaveGame
    useEffect(() => {
        if (!gameState || !gameState.players || gameState.players.length === 0) return;

        const hasGM = gameState.players.some((p) => p.isGM);

        if (!hasGM) {
            // joueur à l'index 0 devient le nouveau chef
            const firstPlayer = gameState.players[0];
            const amIFirst = firstPlayer.id === playerId;

            if (amIFirst) {
                console.log('[AUTO-PROMOTION] Je prends le lead');

                const updatedPlayers = gameState.players.map((p) =>
                    p.id === playerId ? { ...p, isGM: true } : p
                );

                // force update
                updateState({
                    ...gameState,
                    players: updatedPlayers,
                    message: 'Signal perdu. Nouveau chef désigné.',
                    logs: [
                        ...(gameState.logs || []),
                        createLog(
                            'WARNING',
                            'Signal hôte perdu',
                            'Protocole de récupération activé'
                        ),
                        createLog(
                            'INFO',
                            'Auto-promotion',
                            `${firstPlayer.name} est maintenant Hôte`
                        ),
                    ],
                });
            }
        }
    }, [gameState, playerId, updateState]);

    // auto join (nouveau joueur)
    useEffect(() => {
        if (!isLeavingState && playerId && !initialIsHost && gameState && gameState.players) {
            const amIInList = gameState.players.find((p) => p.id === playerId);
            if (!amIInList) {
                const now = Date.now();
                updateState({
                    ...gameState,
                    players: [
                        ...gameState.players,
                        { id: playerId, name: pseudo || 'Agent', isGM: false, joinedAt: now },
                    ],
                    logs: [
                        ...(gameState.logs || []),
                        createLog('PLAYER', 'Nouvelle connexion', `Agent ${pseudo} a rejoint`),
                    ],
                });
            }
        }
    }, [initialIsHost, gameState, updateState, playerId, pseudo, isLeavingState]);

    // timer
    useEffect(() => {
        const i = setInterval(() => setCurrentTime(Date.now()), 1000);
        return () => clearInterval(i);
    }, []);

    // transition auto si tout le monde est prêt
    useEffect(() => {
        if (gameState?.validationRequest) {
            const totalPlayers = gameState.players.length;
            const readyPlayers = gameState.validationRequest.readyPlayers.length;

            if (totalPlayers > 0 && readyPlayers >= totalPlayers) {
                confirmNextStep();
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [gameState?.validationRequest?.readyPlayers, gameState?.players]);

    // ACTIONS DE JEU

    // action technique d'un module => ne notifie pas l'hôte, met juste à jour l'état pour les puzzles
    const submitModuleAction = async (moduleId: string, payload: Record<string, unknown>) => {
        if (!gameState) return;

        await updateState({
            ...gameState,
            lastModuleAction: {
                id: moduleId,
                payload: JSON.stringify(payload),
                playerId,
                timestamp: Date.now(),
            },
            lastUpdate: Date.now(),
            logs: [
                ...(gameState.logs || []),
                createLog('PLAYER', `Module: ${moduleId}`, `Activé par ${pseudo}`),
            ],
        });
    };

    // soumettre proposition => notifie l'hôte ou valide direct
    const submitProposal = async (playerName: string, label: string) => {
        if (!gameState) return;

        const isPlayingSolo = gameState.players.length === 1;

        if (initialIsHost || isPlayingSolo) {
            await initiateNextStep();
        } else {
            await updateState({
                ...gameState,
                pendingProposal: {
                    playerId,
                    playerName,
                    actionLabel: label, // stocke juste le texte (ex: "Code 1234")
                    timestamp: Date.now(),
                },
                lastUpdate: Date.now(),
                logs: [
                    ...(gameState.logs || []),
                    createLog('PLAYER', 'Proposition de solution', `${playerName}: ${label}`),
                ],
            });
        }
    };

    // rejeter proposition
    const rejectProposal = async () => {
        if (!gameState) return;
        await updateState({
            ...gameState,
            pendingProposal: null,
            lastUpdate: Date.now(),
            logs: [
                ...(gameState.logs || []),
                createLog('PLAYER', 'Proposition rejetée', 'Par le commandement'),
            ],
        });
    };

    // lancer le vôte (hôte accepte ou force)
    const initiateNextStep = async () => {
        if (!gameState) return;
        const nextStep = Math.min(Math.max(1, gameState.step || 1) + 1, SCENARIO.steps.length);

        await updateState({
            ...gameState,
            pendingProposal: null,
            validationRequest: {
                nextStep,
                triggeredBy: playerId,
                // hôte considéré comme prêt immédiatement
                readyPlayers: [playerId],
                timestamp: Date.now(),
            },
            lastUpdate: Date.now(),
            logs: [
                ...(gameState.logs || []),
                createLog('INFO', 'Validation de niveau lancée', `Vers étape ${nextStep}`),
            ],
        });
    };

    // voter prêt
    const voteReady = async () => {
        if (!gameState || !gameState.validationRequest) return;
        const currentReady = gameState.validationRequest.readyPlayers || [];
        if (currentReady.includes(playerId)) return;

        await updateState({
            ...gameState,
            validationRequest: {
                ...gameState.validationRequest,
                readyPlayers: [...currentReady, playerId],
            },
            lastUpdate: Date.now(),
            logs: [
                ...(gameState.logs || []),
                createLog('PLAYER', 'Confirmation', `${pseudo} est prêt`),
            ],
        });
    };

    // confirmer transition
    const confirmNextStep = async () => {
        if (!gameState || !gameState.validationRequest) return;

        const now = Date.now();
        const startOfStep = toMs(gameState.lastStepTime || effectiveStartTime);

        const historyEntry = {
            step: gameState.step,
            solverName: gameState.pendingProposal?.playerName || 'Commandement',
            solvedAt: now,
            duration: (now - startOfStep) / 1000,
        };

        const completedStep = gameState.step;
        const nextStep = gameState.validationRequest.nextStep;

        await updateState({
            ...gameState,
            step: nextStep,
            message: `Étape ${nextStep}`,
            history: [historyEntry, ...(gameState.history || [])],
            lastStepTime: now,
            lastUpdate: now,
            validationRequest: null,
            pendingProposal: null,
            lastModuleAction: null,
            logs: [
                ...(gameState.logs || []),
                createLog(
                    'SUCCESS',
                    `ÉTAPE ${completedStep} TERMINÉE`,
                    `Résolu par: ${historyEntry.solverName} (${historyEntry.duration.toFixed(0)}s)`
                ),
            ],
        });
    };

    // calculs temps, effets...
    const handleMessage = useCallback((text: string) => {
        setAdminScript([say(CHARACTERS.system, text)]);
        setAdminDialogueOpen(true);
    }, []);

    const handleChallenge = useCallback((type: string, id: number) => {
        setActiveChallenge({ type, id });
    }, []);

    const handleChallengeClear = useCallback(() => {
        setActiveChallenge(null);
    }, []);

    const callbacks = useMemo(
        () => ({
            onMessage: handleMessage,
            onChallenge: handleChallenge,
            onChallengeClear: handleChallengeClear,
        }),
        [handleMessage, handleChallenge, handleChallengeClear]
    );

    const { resolveChallenge } = useGameEffects(gameState, callbacks);

    // perturbation résolue
    const handleChallengeResolved = useCallback(async () => {
        if (activeChallenge && gameState) {
            resolveChallenge(activeChallenge.id);
            setActiveChallenge(null);

            await updateState({
                ...gameState,
                active_challenge: null,
                lastUpdate: Date.now(),
                logs: [
                    ...(gameState.logs || []),
                    createLog('SUCCESS', 'Perturbation résolue', `Type: ${activeChallenge.type}`),
                ],
            });

            setAdminScript([say(CHARACTERS.system, 'PERTURBATION STABILISÉE. BON TRAVAIL.')]);
            setAdminDialogueOpen(true);
        }
    }, [activeChallenge, resolveChallenge, gameState, updateState]);

    const effectiveStartTime = gameState?.startTime ?? gameState?.timestamp ?? Date.now();
    const bonusSeconds = (gameState?.bonusTime || 0) * 60;
    const currentTotalDuration = SCENARIO.defaultDuration + bonusSeconds;
    const rawElapsed = (currentTime - toMs(effectiveStartTime)) / 1000;
    const elapsedTime = isNaN(rawElapsed) ? 0 : Math.max(0, rawElapsed);
    const safeStep = Math.max(1, gameState?.step || 1);
    const currentStepIndex = Math.min(safeStep - 1, SCENARIO.steps.length - 1);
    const currentScenarioStep = SCENARIO.steps[currentStepIndex];
    const isGameWon = currentScenarioStep?.componentId === 'victory-screen';
    const isTimeUp = !isGameWon && elapsedTime > currentTotalDuration;
    const theoreticalEndTime = toMs(effectiveStartTime) + currentTotalDuration * 1000;
    // on borne timerEndTime => il ne peut pas être plus loin que "Maintenant + Durée Max"
    const timerEndTime = isGameWon
        ? gameState?.lastUpdate
        : Math.min(theoreticalEndTime, currentTime + currentTotalDuration * 1000);
    const activePuzzleId = currentScenarioStep?.componentId;

    return {
        gameState,
        updateState,
        error,
        currentStepIndex,
        currentScenarioStep,
        isGameWon,
        isTimeUp,
        timerEndTime,
        effectiveStartTime,
        currentTotalDuration,
        activePuzzleId,
        adminDialogueOpen,
        setAdminDialogueOpen,
        adminScript,
        activeChallenge,
        handleChallengeResolved,
        submitProposal,
        rejectProposal,
        initiateNextStep,
        voteReady,
        confirmNextStep,
        submitModuleAction,
        isHost,
        leaveGame,
    };
};
