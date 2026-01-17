import { useCallback, useEffect, useMemo, useState } from 'react';

import { SCENARIO } from '@/data/alphaScenario';
import { CHARACTERS } from '@/data/characters';
import { useGameEffects } from '@/hooks/useGameEffects';
import { useGameSync } from '@/hooks/useGameSync';
import { DialogueLine } from '@/types/dialogue';
import { say } from '@/utils/dialogueUtils';

const toMs = (timestamp: number | string | undefined) => {
    if (!timestamp) return 0;
    const num = Number(timestamp);
    return isNaN(num) ? 0 : num < 100000000000 ? num * 1000 : num;
};

export const useGameLogic = (
    gameCode: string | null,
    isHost: boolean,
    playerId: string,
    pseudo: string
) => {
    const { gameState, updateState, refresh, error } = useGameSync(gameCode, isHost);

    const [adminDialogueOpen, setAdminDialogueOpen] = useState(false);
    const [adminScript, setAdminScript] = useState<DialogueLine[]>([]);
    const [activeChallenge, setActiveChallenge] = useState<{ type: string; id: number } | null>(
        null
    );
    const [currentTime, setCurrentTime] = useState(() => Date.now());

    // init auto
    useEffect(() => {
        if (isHost && gameState && (!gameState.step || gameState.step === 0)) {
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
                lastModuleAction: null
            });
        }
    }, [isHost, gameState, updateState, playerId, pseudo]);

    // auto join
    useEffect(() => {
        if (!isHost && gameState && gameState.players) {
            const amIInList = gameState.players.find((p) => p.id === playerId);
            if (!amIInList) {
                const now = Date.now();
                updateState({
                    ...gameState,
                    players: [
                        ...gameState.players,
                        { id: playerId, name: pseudo || 'Agent', isGM: false, joinedAt: now },
                    ],
                });
            }
        }
    }, [isHost, gameState, updateState, playerId, pseudo]);

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
    const submitModuleAction = async (moduleId: string, payload: any) => {
        if (!gameState) return;

        await updateState({
            ...gameState,
            lastModuleAction: {
                id: moduleId,
                payload: typeof payload === 'string' ? payload : JSON.stringify(payload),
                playerId,
                timestamp: Date.now()
            },
            // on ne touche pas à pendingProposal
            lastUpdate: Date.now()
        });
    };

    // soumettre proposition => notifie l'hôte ou valide direct
    const submitProposal = async (playerName: string, label: string) => {
        if (!gameState) return;

        const isPlayingSolo = gameState.players.length === 1;

        // si c'est une action technique
        if (label.startsWith('MODULE_ACTION:')) {
            const parts = label.split(':');
            // parts[0] = MODULE_ACTION, parts[1] = id, parts[2] = payload
            if (parts.length >= 3) {
                await submitModuleAction(parts[1], parts.slice(2).join(':'));
                return;
            }
        }

        if (isHost || isPlayingSolo) {
            await initiateNextStep();
        } else {
            await updateState({
                ...gameState,
                pendingProposal: { playerId, playerName, actionLabel: label, timestamp: Date.now() },
                lastUpdate: Date.now()
            });
        }
    };

    // rejeter proposition
    const rejectProposal = async () => {
        if (!gameState) return;
        await updateState({ ...gameState, pendingProposal: null, lastUpdate: Date.now() });
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

        await updateState({
            ...gameState,
            step: gameState.validationRequest.nextStep,
            message: `Étape ${gameState.validationRequest.nextStep}`,
            history: [historyEntry, ...(gameState.history || [])],
            lastStepTime: now,
            lastUpdate: now,
            validationRequest: null,
            pendingProposal: null,
            lastModuleAction: null
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

    const handleChallengeResolved = useCallback(() => {
        if (activeChallenge) {
            resolveChallenge(activeChallenge.id);
            setActiveChallenge(null);
        }
    }, [activeChallenge, resolveChallenge]);

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
    const timerEndTime = isGameWon
        ? gameState?.lastUpdate
        : toMs(effectiveStartTime) + currentTotalDuration * 1000;
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
        submitModuleAction
    };
};
