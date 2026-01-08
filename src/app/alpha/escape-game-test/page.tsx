'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';

import {
    ArrowRightEndOnRectangleIcon,
    BellAlertIcon,
    CheckIcon,
    ClockIcon,
    ComputerDesktopIcon,
    LightBulbIcon,
    RocketLaunchIcon,
    TrophyIcon,
    UserGroupIcon,
    UserIcon,
    UserMinusIcon,
    XMarkIcon,
} from '@heroicons/react/24/solid';

import { AlphaButton } from '@/components/alpha/AlphaButton';
import { AlphaCard } from '@/components/alpha/AlphaCard';
import { AlphaError } from '@/components/alpha/AlphaError';
import { AlphaHeader } from '@/components/alpha/AlphaHeader';
import { DialogueBox } from '@/components/dialogueBox';
import { DefeatScreen, PUZZLE_COMPONENTS } from '@/components/puzzles/PuzzleRegistry';
import { SCENARIO } from '@/data/alphaScenario';
import { CHARACTERS } from '@/data/characters';
import { useGameEffects } from '@/hooks/useGameEffects';
import { createGame, useGameSync } from '@/hooks/useGameSync';
import { usePlayerSession } from '@/hooks/usePlayerSession';
import { DialogueLine } from '@/types/dialogue';
import { GameState } from '@/types/game';
import { say } from '@/utils/dialogueUtils';

// ============================================================================
// UTILITAIRES
// ============================================================================

const toMs = (timestamp: number | string | undefined) => {
    if (!timestamp) return 0;
    const num = Number(timestamp);
    if (isNaN(num)) return 0;
    return num < 100000000000 ? num * 1000 : num;
};

const formatTime = (seconds: number) => {
    if (isNaN(seconds) || seconds < 0) return '00:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

// ============================================================================
// HOOKS PARTAGÉS (DRY)
// ============================================================================

interface SessionSetters {
    setPseudo: (v: string) => void;
    setCode: (v: string | null) => void;
    setId: (v: string) => void;
    setInputCode?: (v: string) => void;
    currentValues: {
        pseudo: string;
        code: string | null;
        id: string;
        inputCode?: string;
    };
}

interface SessionData {
    pseudo: string;
    gameCode: string;
    playerId: string;
}

const useSessionSync = (
    isLoaded: boolean,
    session: SessionData | null,
    generatedId: string,
    setters: SessionSetters
) => {
    const settersRef = useRef(setters);

    // Met à jour la ref à chaque rendu
    useEffect(() => {
        settersRef.current = setters;
    });

    useEffect(() => {
        if (!isLoaded) return;

        const timer = setTimeout(() => {
            const currentSetters = settersRef.current;
            const { pseudo, code, id, inputCode } = currentSetters.currentValues;

            if (session) {
                if (pseudo !== session.pseudo) currentSetters.setPseudo(session.pseudo);
                if (code !== session.gameCode) currentSetters.setCode(session.gameCode);

                if (currentSetters.setInputCode && inputCode !== session.gameCode) {
                    currentSetters.setInputCode(session.gameCode);
                }

                if (id !== session.playerId) currentSetters.setId(session.playerId);
            } else {
                if (id !== generatedId) currentSetters.setId(generatedId);
            }
        }, 0);

        return () => clearTimeout(timer);
    }, [isLoaded, session, generatedId]);
};

const useGameLogic = (
    gameState: GameState | null,
    effectiveStartTime: number | string | undefined
) => {
    const [currentTime, setCurrentTime] = useState(() => Date.now());

    useEffect(() => {
        const interval = setInterval(() => setCurrentTime(Date.now()), 1000);
        return () => clearInterval(interval);
    }, []);

    const safeStep = Math.max(1, gameState?.step || 1);
    const currentStepIndex = Math.min(safeStep - 1, SCENARIO.steps.length - 1);
    const currentScenarioStep = SCENARIO.steps[currentStepIndex];

    const isGameWon = currentScenarioStep.componentId === 'victory-screen';
    const elapsedTime = effectiveStartTime ? (currentTime - toMs(effectiveStartTime)) / 1000 : 0;
    const isTimeUp = !isGameWon && elapsedTime > SCENARIO.defaultDuration;

    return {
        safeStep,
        currentScenarioStep,
        isGameWon,
        isTimeUp,
        ActivePuzzleComponent:
            PUZZLE_COMPONENTS[currentScenarioStep?.componentId] ||
            (() => <div className="text-red-500">Puzzle introuvable</div>),
    };
};

// ============================================================================
// COMPOSANTS PARTAGÉS (UI)
// ============================================================================

const GlobalTimer = ({
    startTime,
    isStopped = false,
    endTime = 0,
    totalDuration,
    label = 'TEMPS RESTANT',
}: {
    startTime?: number | string;
    isStopped?: boolean;
    endTime?: number;
    totalDuration: number;
    label?: string;
}) => {
    const [now, setNow] = useState(0);
    useEffect(() => {
        if (isStopped) return;
        const initTimer = setTimeout(() => setNow(Date.now()), 0);
        const interval = setInterval(() => setNow(Date.now()), 1000);
        return () => {
            clearTimeout(initTimer);
            clearInterval(interval);
        };
    }, [isStopped]);

    const startMs = toMs(startTime);
    let displayTime = '--:--';
    let isUrgent = false;

    if (startMs > 0) {
        const referenceTime = isStopped && endTime ? toMs(endTime) : now;
        const elapsedMs = Math.max(0, referenceTime - startMs);
        const remainingSeconds = Math.max(0, totalDuration - Math.floor(elapsedMs / 1000));
        displayTime = formatTime(remainingSeconds);
        isUrgent = remainingSeconds < 300;
    }

    return (
        <div className="flex flex-col items-end">
            <span
                className={`text-[10px] font-bold uppercase ${isUrgent ? 'text-red-400' : 'text-muted'}`}
            >
                {label}
            </span>
            <div
                className={`flex items-center gap-2 font-mono text-xl font-black ${isUrgent ? 'animate-pulse text-red-500' : 'text-brand-emerald'} ${isStopped ? 'opacity-50' : ''}`}
            >
                <ClockIcon className="h-5 w-5" />
                {displayTime}
            </div>
        </div>
    );
};

const GameHeader = ({
    code,
    step,
    startTime,
    onLogout,
    isLeaving,
    connectionStatus,
    showConnectionStatus,
    scenarioTitle,
    isTimerStopped,
    timerEndTime,
}: {
    code: string | null;
    step?: number;
    startTime?: number | string;
    onLogout: () => void;
    isLeaving?: boolean;
    connectionStatus?: string;
    showConnectionStatus?: boolean;
    scenarioTitle?: string;
    isTimerStopped?: boolean;
    timerEndTime?: number;
}) => (
    <div className="border-border mb-6 grid grid-cols-3 items-start gap-4 border-b pb-4">
        <div>
            {showConnectionStatus ? (
                <div className="flex items-center gap-2">
                    <div className="h-2 w-2 animate-pulse rounded-full bg-green-500" />
                    <span className="text-muted font-mono text-xs">
                        {connectionStatus || 'EN LIGNE'}
                    </span>
                </div>
            ) : (
                <>
                    <div className="text-muted text-[10px] tracking-widest uppercase">Code</div>
                    <div className="text-brand-emerald text-4xl font-black tracking-widest select-all">
                        {code}
                    </div>
                </>
            )}
        </div>
        <div className="text-center">
            <div className="text-muted text-[10px] tracking-widest uppercase">Mission</div>
            <div className="text-brand-blue mb-1 text-sm font-bold">
                {scenarioTitle || 'Chargement...'}
            </div>
            <div className="text-muted text-xs">
                Étape {step ?? '-'} / {SCENARIO.steps.length}
            </div>
        </div>
        <div className="flex flex-col items-end gap-2">
            <GlobalTimer
                startTime={startTime}
                isStopped={isTimerStopped}
                endTime={timerEndTime}
                totalDuration={SCENARIO.defaultDuration}
            />
            <button
                onClick={onLogout}
                disabled={isLeaving}
                className="text-brand-error mt-1 flex items-center gap-1 text-xs hover:text-red-300 disabled:opacity-50"
            >
                <ArrowRightEndOnRectangleIcon className="h-3 w-3" />{' '}
                {isLeaving ? 'Départ...' : 'Fin'}
            </button>
        </div>
    </div>
);

const ProposalSection = ({
    gameState,
    isHost,
    onAccept,
    onReject,
    playerId,
}: {
    gameState: GameState | null;
    isHost: boolean;
    onAccept?: () => void;
    onReject?: () => void;
    playerId?: string;
}) => {
    const proposal = gameState?.pendingProposal;
    if (!proposal) return null;

    const isMyProposal = proposal.playerId === playerId;

    if (isHost || isMyProposal) {
        return (
            <div className="animate-in zoom-in mb-6 rounded-xl border border-yellow-500/50 bg-yellow-500/10 p-4 duration-300">
                <div className="flex gap-4">
                    <BellAlertIcon className="h-8 w-8 animate-bounce text-yellow-500" />
                    <div className="flex-1">
                        <h3 className="font-bold text-yellow-400">
                            {isHost ? 'Proposition en attente !' : 'En attente du MJ...'}
                        </h3>
                        <p className="mt-1 text-sm text-white">
                            <span className="text-lg font-bold">{proposal.playerName}</span>{' '}
                            {isHost ? 'propose :' : 'a proposé :'}
                        </p>
                        <div className="my-3 rounded-lg border border-white/10 bg-black/40 p-3 text-center text-lg italic">
                            "{proposal.actionLabel}"
                        </div>
                        {isHost && onAccept && onReject && (
                            <div className="grid grid-cols-2 gap-3">
                                <button
                                    onClick={onAccept}
                                    className="flex items-center justify-center gap-2 rounded-lg bg-green-600 py-3 font-bold text-white hover:bg-green-500 active:scale-95"
                                >
                                    <CheckIcon className="h-5 w-5" /> VALIDER
                                </button>
                                <button
                                    onClick={onReject}
                                    className="flex items-center justify-center gap-2 rounded-lg bg-red-600 py-3 font-bold text-white hover:bg-red-500 active:scale-95"
                                >
                                    <XMarkIcon className="h-5 w-5" /> REFUSER
                                </button>
                            </div>
                        )}
                        {!isHost && (
                            <p className="animate-pulse text-center text-sm text-yellow-500/70">
                                Validation de votre solution en cours
                            </p>
                        )}
                    </div>
                </div>
            </div>
        );
    }
    return (
        <div className="bg-surface-highlight border-border mb-6 cursor-not-allowed rounded-xl border p-6 text-center opacity-50">
            <div className="mb-2 flex justify-center">
                <ClockIcon className="text-muted h-6 w-6" />
            </div>
            <h3 className="text-muted text-sm font-bold">Système Verrouillé</h3>
            <p className="text-muted/70 text-xs">{proposal.playerName} propose une solution...</p>
        </div>
    );
};

const ConnectionScreen = ({
    mode,
    pseudo,
    setPseudo,
    code,
    setCode,
    onAction,
    onBack,
}: {
    mode: 'host' | 'player';
    pseudo: string;
    setPseudo: (value: string) => void;
    code?: string; // optionnel car l'hôte ne l'utilise pas pour se connecter
    setCode?: (value: string) => void; // optionnel
    onAction: () => void;
    onBack: () => void;
}) => (
    <AlphaCard title={mode === 'host' ? 'Création de Session' : 'Rejoindre une Partie'}>
        <div className="flex flex-col items-center gap-6 py-6">
            <div className="bg-surface-highlight rounded-full p-6">
                {mode === 'host' ? (
                    <ComputerDesktopIcon className="text-brand-purple h-12 w-12" />
                ) : (
                    <UserIcon className="text-brand-blue h-12 w-12" />
                )}
            </div>
            <div className="w-full max-w-sm space-y-4">
                <div>
                    <label className="text-muted text-xs font-bold uppercase">Votre Pseudo</label>
                    <input
                        value={pseudo}
                        onChange={(e) => setPseudo(e.target.value)}
                        className="bg-surface border-border text-foreground w-full rounded-lg border px-4 py-3 outline-none"
                        placeholder={mode === 'host' ? 'Hôte' : 'Ex: Agent Alpha'}
                    />
                </div>
                {mode === 'player' && setCode && (
                    <div>
                        <label className="text-muted text-xs font-bold uppercase">
                            Code Session
                        </label>
                        <input
                            value={code}
                            maxLength={4}
                            onChange={(e) => setCode(e.target.value)}
                            className="bg-surface border-border text-foreground w-full rounded-lg border px-4 py-3 text-center font-mono tracking-widest uppercase outline-none"
                            placeholder="ABCD"
                        />
                    </div>
                )}
            </div>
            <div className="w-full max-w-sm">
                <AlphaButton onClick={onAction}>
                    {mode === 'host' ? 'INITIALISER LA SALLE' : 'REJOINDRE'}
                </AlphaButton>
            </div>
            <button onClick={onBack} className="text-muted hover:text-foreground text-sm">
                Retour
            </button>
        </div>
    </AlphaCard>
);

// ============================================================================
// HOST INTERFACE
// ============================================================================
const HostInterface = ({ onLogout }: { onLogout: () => void }) => {
    const { session, saveSession, isLoaded } = usePlayerSession();
    const [pseudo, setPseudo] = useState('Hôte');
    const [activeCode, setActiveCode] = useState<string | null>(null);
    const [hostId, setHostId] = useState('');
    const [isLeaving, setIsLeaving] = useState(false);
    const [generatedHostId] = useState(() => `host-${crypto.randomUUID().slice(0, 8)}`);

    useSessionSync(isLoaded, session, generatedHostId, {
        setPseudo,
        setCode: setActiveCode,
        setId: setHostId,
        currentValues: {
            pseudo,
            code: activeCode,
            id: hostId,
        },
    });

    const { gameState, updateState, error } = useGameSync(activeCode, true);

    const [adminDialogueOpen, setAdminDialogueOpen] = useState(false);
    const [adminScript, setAdminScript] = useState<DialogueLine[]>([]);

    // Cette fonction sera appelée par le hook quand un message arrive
    const handleAdminMessage = useCallback((text: string) => {
        // 1. On crée le script à la volée
        // Tu peux créer un CHARACTERS.SYSTEM s'il n'existe pas encore
        const newScript = [say(CHARACTERS.system, text)];

        // 2. On met à jour l'état pour afficher le dialogue
        setAdminScript(newScript);
        setAdminDialogueOpen(true);
    }, []);

    // --- BRANCHEMENT DU HOOK ---
    // On passe handleAdminMessage en 2ème argument
    useGameEffects(gameState, handleAdminMessage);

    const effectiveStartTime = gameState?.startTime ?? gameState?.timestamp;
    const { safeStep, currentScenarioStep, isGameWon, isTimeUp, ActivePuzzleComponent } =
        useGameLogic(gameState, effectiveStartTime);

    const handleCreateGame = useCallback(async () => {
        if (!hostId) return;
        const res = await createGame();
        if (res.success && res.code) {
            saveSession(res.code, pseudo, hostId);
            setActiveCode(res.code);
        }
    }, [hostId, pseudo, saveSession]);

    useEffect(() => {
        if (
            activeCode &&
            hostId &&
            gameState &&
            (typeof gameState.step === 'undefined' || gameState.step === 0)
        ) {
            const now = Date.now();
            updateState({
                step: 1,
                message: 'En attente...',
                startTime: now,
                timestamp: now,
                lastStepTime: now,
                players: [{ id: hostId, name: pseudo, isGM: true, joinedAt: now }],
                history: [],
                pendingProposal: null,
                lastUpdate: now,
            });
        }
    }, [gameState, activeCode, hostId, pseudo, updateState]);

    useEffect(() => {
        if (gameState && activeCode && hostId && !isLeaving) {
            const currentPlayers = gameState.players || [];
            if (!currentPlayers.find((p) => p.id === hostId)) {
                updateState({
                    ...gameState,
                    players: [
                        ...currentPlayers,
                        { id: hostId, name: pseudo, isGM: true, joinedAt: Date.now() },
                    ],
                });
            }
        }
    }, [gameState, activeCode, hostId, isLeaving, pseudo, updateState]);

    const handleHostLogout = useCallback(async () => {
        if (!gameState) {
            onLogout();
            return;
        }
        setIsLeaving(true);
        const players = (gameState.players || []).filter((p) => p.id !== hostId);
        const nextPlayers =
            players.length > 0
                ? players.map((p, i) => (i === 0 ? { ...p, isGM: true } : p))
                : players;
        await updateState({ ...gameState, players: nextPlayers });
        onLogout();
    }, [gameState, hostId, onLogout, updateState]);

    const handleAccept = useCallback(() => {
        if (!gameState || isTimeUp) return;
        const now = Date.now();
        const startOfStep = toMs(gameState.lastStepTime || effectiveStartTime);
        const solverName = gameState.pendingProposal?.playerName || pseudo;
        const nextStep = Math.min(Math.max(1, gameState.step || 1) + 1, SCENARIO.steps.length);

        updateState({
            ...gameState,
            step: nextStep,
            message: `Étape ${nextStep}`,
            pendingProposal: null,
            history: [
                {
                    step: Math.max(1, gameState.step || 1),
                    solverName,
                    solvedAt: now,
                    duration: (now - startOfStep) / 1000,
                },
                ...(gameState.history || []),
            ],
            lastStepTime: now,
            lastUpdate: now,
        });
    }, [gameState, effectiveStartTime, updateState, isTimeUp, pseudo]);

    const handleReject = useCallback(() => {
        if (!gameState) return;
        updateState({ ...gameState, pendingProposal: null, lastUpdate: Date.now() });
    }, [gameState, updateState]);

    const handleManualSkip = useCallback(() => {
        if (!gameState || isTimeUp) return;
        const now = Date.now();
        const startOfStep = toMs(gameState.lastStepTime || effectiveStartTime);
        const nextStep = Math.min(Math.max(1, gameState.step || 1) + 1, SCENARIO.steps.length);

        updateState({
            ...gameState,
            step: nextStep,
            message: `Étape ${nextStep} (Forcée)`,
            history: [
                {
                    step: Math.max(1, gameState.step || 1),
                    solverName: 'ADMIN (Skip)',
                    solvedAt: now,
                    duration: (now - startOfStep) / 1000,
                },
                ...(gameState.history || []),
            ],
            pendingProposal: null,
            lastStepTime: now,
            lastUpdate: now,
        });
    }, [gameState, effectiveStartTime, updateState, isTimeUp]);

    const kickPlayer = useCallback(
        (idToKick: string) => {
            if (!gameState) return;
            const newPlayers = (gameState.players || []).filter((p) => p.id !== idToKick);
            const newPending =
                gameState.pendingProposal?.playerId === idToKick ? null : gameState.pendingProposal;
            updateState({ ...gameState, players: newPlayers, pendingProposal: newPending });
        },
        [gameState, updateState]
    );

    if (error)
        return (
            <AlphaCard title="Erreur">
                <AlphaError message={error} />
                <AlphaButton onClick={onLogout}>Retour</AlphaButton>
            </AlphaCard>
        );
    if (!isLoaded)
        return <div className="text-muted animate-pulse p-10 text-center">Chargement...</div>;
    if (!activeCode)
        return (
            <ConnectionScreen
                mode="host"
                pseudo={pseudo}
                setPseudo={setPseudo}
                onAction={handleCreateGame}
                onBack={onLogout}
            />
        );

    if (isTimeUp)
        return (
            <AlphaCard title="Tableau de Bord Hôte" className="border-brand-purple/50">
                <GameHeader
                    code={activeCode}
                    step={safeStep}
                    startTime={effectiveStartTime}
                    onLogout={handleHostLogout}
                    isLeaving={isLeaving}
                    scenarioTitle={currentScenarioStep.title}
                    isTimerStopped={true}
                    timerEndTime={toMs(effectiveStartTime) + SCENARIO.defaultDuration * 1000}
                />
                <DefeatScreen />
            </AlphaCard>
        );

    return (
        <AlphaCard title="Tableau de Bord Hôte" className="border-brand-purple/50">
            <div className={"relative z-[51]"}>
                <DialogueBox
                    script={adminScript}
                    onComplete={() => setAdminDialogueOpen(false)}
                    isOpen={adminDialogueOpen}
                />
            </div>
            <GameHeader
                code={activeCode}
                step={safeStep}
                startTime={effectiveStartTime}
                onLogout={handleHostLogout}
                isLeaving={isLeaving}
                scenarioTitle={currentScenarioStep.title}
                isTimerStopped={isGameWon}
                timerEndTime={
                    isGameWon
                        ? gameState?.lastUpdate
                        : toMs(effectiveStartTime) + SCENARIO.defaultDuration * 1000
                }
            />
            <ProposalSection
                gameState={gameState}
                isHost={true}
                onAccept={handleAccept}
                onReject={handleReject}
            />

            {!isGameWon && (
                <div className="border-brand-purple/30 mb-6 rounded-lg border bg-black/20 p-4">
                    <div className="mb-2 flex items-center justify-between">
                        <h5 className="text-brand-purple flex items-center gap-2 text-xs font-bold uppercase">
                            <LightBulbIcon className="h-4 w-4" /> Solution
                        </h5>
                        <span className="text-muted text-xs">
                            Step ID: {currentScenarioStep.id}
                        </span>
                    </div>
                    <p className="mb-2 text-sm text-gray-300 italic">
                        "{currentScenarioStep.description}"
                    </p>
                    <div className="mb-3 border-l-2 border-green-500 pl-3 font-mono text-sm font-bold text-green-400">
                        SOLUTION : {currentScenarioStep.solution}
                    </div>
                    {currentScenarioStep.hints.map((h) => (
                        <div key={h.id} className="text-xs text-gray-500">
                            💡 {h.text}
                        </div>
                    ))}
                </div>
            )}

            {!gameState?.pendingProposal && (
                <div className="border-border mb-8 border-t border-dashed pt-6">
                    {!isGameWon && (
                        <h4 className="text-muted mb-4 text-center text-xs font-bold uppercase">
                            Interface de contrôle
                        </h4>
                    )}
                    <ActivePuzzleComponent
                        onSolve={handleAccept}
                        isSolved={false}
                        data={gameState || undefined}
                    />
                </div>
            )}

            {!isGameWon && (
                <div className="border-border grid grid-cols-1 gap-6 border-t pt-6 md:grid-cols-2">
                    <div>
                        <h4 className="text-muted mb-3 flex items-center gap-2 text-sm font-bold">
                            <UserGroupIcon className="h-4 w-4" /> Participants (
                            {gameState?.players?.length || 0})
                        </h4>
                        <div className="bg-surface/50 min-h-[100px] space-y-2 rounded-lg p-2">
                            {(gameState?.players || []).map((p) => (
                                <div
                                    key={p.id}
                                    className={`flex items-center justify-between rounded p-2 text-xs ${p.isGM ? 'border-brand-purple/30 bg-brand-purple/20 border' : 'bg-surface border-border border'}`}
                                >
                                    <div className="flex items-center gap-2">
                                        <span
                                            className={`h-2 w-2 rounded-full ${p.isGM ? 'bg-brand-purple' : 'bg-brand-emerald'}`}
                                        ></span>
                                        <span
                                            className={
                                                p.isGM
                                                    ? 'text-brand-purple font-bold'
                                                    : 'text-foreground'
                                            }
                                        >
                                            {p.name} {p.isGM && '(Hôte)'}
                                        </span>
                                    </div>
                                    {!p.isGM && (
                                        <button
                                            onClick={() => kickPlayer(p.id)}
                                            className="text-muted p-1 hover:text-red-500"
                                            title="Éjecter"
                                        >
                                            <UserMinusIcon className="h-4 w-4" />
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                    <div>
                        <h4 className="text-muted mb-3 flex items-center gap-2 text-sm font-bold">
                            <TrophyIcon className="h-4 w-4" /> Historique
                        </h4>
                        <div className="custom-scrollbar bg-surface/50 max-h-40 min-h-[100px] space-y-2 overflow-y-auto rounded-lg p-2 pr-2">
                            {(gameState?.history || []).map((entry, idx) => (
                                <div
                                    key={idx}
                                    className="bg-surface border-brand-blue flex items-center justify-between rounded border-l-2 p-2 text-xs"
                                >
                                    <div>
                                        <span className="text-brand-blue font-bold">
                                            Étape {entry.step}
                                        </span>
                                        <span className="text-muted mx-1"> - </span>
                                        <span className="text-foreground">{entry.solverName}</span>
                                    </div>
                                    <div className="text-muted flex items-center gap-1 font-mono">
                                        <ClockIcon className="h-3 w-3" />
                                        {formatTime(entry.duration)}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
            {!isGameWon && (
                <div className="border-border mt-8 border-t pt-4">
                    <button
                        onClick={handleManualSkip}
                        className="text-muted w-full text-xs underline hover:text-white"
                    >
                        Forcer la validation (Skip Étape)
                    </button>
                </div>
            )}
        </AlphaCard>
    );
};

// ============================================================================
// PLAYER INTERFACE
// ============================================================================
const PlayerInterface = ({
    onLogout,
    onPromote,
}: {
    onLogout: () => void;
    onPromote: () => void;
}) => {
    const { session, saveSession, promoteSession, isLoaded } = usePlayerSession();
    const [pseudo, setPseudo] = useState('');
    const [inputCode, setInputCode] = useState('');
    const [connectedCode, setConnectedCode] = useState<string | null>(null);
    const [playerId, setPlayerId] = useState('');
    const hasJoinedRef = useRef(false);
    const isPromotingRef = useRef(false);
    const [generatedPlayerId] = useState(() => `player-${crypto.randomUUID().slice(0, 8)}`);

    useSessionSync(isLoaded, session, generatedPlayerId, {
        setPseudo,
        setCode: setConnectedCode,
        setInputCode,
        setId: setPlayerId,
        currentValues: {
            pseudo,
            code: connectedCode,
            inputCode,
            id: playerId,
        },
    });

    const { gameState, updateState, refresh, error } = useGameSync(connectedCode, false);

    // --- GESTION DU DIALOGUE ADMIN ---
    const [adminDialogueOpen, setAdminDialogueOpen] = useState(false);
    const [adminScript, setAdminScript] = useState<DialogueLine[]>([]);

    const handleAdminMessage = useCallback((text: string) => {
        // 1. On crée le script à la volée
        // Tu peux créer un CHARACTERS.SYSTEM s'il n'existe pas encore
        const newScript = [say(CHARACTERS.system, text)];

        // 2. On met à jour l'état pour afficher le dialogue
        setAdminScript(newScript);
        setAdminDialogueOpen(true);
    }, []);

    useGameEffects(gameState, handleAdminMessage);

    const effectiveStartTime = gameState?.startTime ?? gameState?.timestamp;
    const { safeStep, currentScenarioStep, isGameWon, isTimeUp, ActivePuzzleComponent } =
        useGameLogic(gameState, effectiveStartTime);

    const handleJoin = useCallback(() => {
        if (inputCode.length !== 4 || !pseudo) return;
        saveSession(inputCode.toUpperCase(), pseudo, playerId);
        setConnectedCode(inputCode.toUpperCase());
    }, [inputCode, pseudo, playerId, saveSession]);

    useEffect(() => {
        if (gameState && connectedCode && playerId) {
            const currentPlayers = gameState.players || [];
            const me = currentPlayers.find((p) => p.id === playerId);
            if (me) {
                if (!hasJoinedRef.current) hasJoinedRef.current = true;
                if (me.isGM) {
                    isPromotingRef.current = true;
                    promoteSession();
                    onPromote();
                    return;
                }
            } else {
                if (hasJoinedRef.current) {
                    alert('Vous avez été exclu.');
                    onLogout();
                } else {
                    updateState({
                        ...gameState,
                        players: [
                            ...currentPlayers,
                            { id: playerId, name: pseudo, isGM: false, joinedAt: Date.now() },
                        ],
                    });
                }
            }
        }
    }, [
        gameState,
        connectedCode,
        playerId,
        pseudo,
        onLogout,
        promoteSession,
        onPromote,
        updateState,
    ]);

    const handlePropose = useCallback(() => {
        if (!gameState || isTimeUp) return;
        refresh().then(() =>
            updateState({
                ...gameState,
                pendingProposal: {
                    playerId: playerId,
                    playerName: pseudo,
                    actionLabel: `Solution pour "${currentScenarioStep.title}"`,
                    timestamp: Date.now(),
                },
            })
        );
    }, [gameState, refresh, updateState, playerId, pseudo, currentScenarioStep, isTimeUp]);

    if (error)
        return (
            <AlphaCard title="Erreur">
                <AlphaError message={error} />
                <AlphaButton onClick={onLogout}>Retour</AlphaButton>
            </AlphaCard>
        );
    if (!isLoaded)
        return <div className="text-muted animate-pulse p-10 text-center">Chargement...</div>;
    if (!connectedCode)
        return (
            <ConnectionScreen
                mode="player"
                pseudo={pseudo}
                setPseudo={setPseudo}
                code={inputCode}
                setCode={setInputCode}
                onAction={handleJoin}
                onBack={onLogout}
            />
        );

    if (!gameState)
        return (
            <AlphaCard title="Connexion...">
                <div className="text-muted animate-pulse py-20 text-center">Synchronisation...</div>
            </AlphaCard>
        );

    if (isTimeUp)
        return (
            <AlphaCard title="Terminal Agent">
                <GameHeader
                    code={connectedCode}
                    step={safeStep}
                    startTime={effectiveStartTime}
                    onLogout={onLogout}
                    isLeaving={false}
                    showConnectionStatus={true}
                    scenarioTitle={currentScenarioStep.title}
                    isTimerStopped={true}
                    timerEndTime={toMs(effectiveStartTime) + SCENARIO.defaultDuration * 1000}
                />
                <DefeatScreen />
            </AlphaCard>
        );

    return (
        <AlphaCard title="Terminal Agent">
            <div className={"relative z-[51]"}>
                <DialogueBox
                    script={adminScript}
                    onComplete={() => setAdminDialogueOpen(false)}
                    isOpen={adminDialogueOpen}
                />
            </div>

            <GameHeader
                code={connectedCode}
                step={safeStep}
                startTime={effectiveStartTime}
                onLogout={onLogout}
                isLeaving={false}
                showConnectionStatus={true}
                scenarioTitle={currentScenarioStep.title}
                isTimerStopped={isGameWon}
                timerEndTime={isGameWon ? gameState.lastUpdate : undefined}
            />

            <div className="mb-8">
                <ActivePuzzleComponent
                    onSolve={handlePropose}
                    isSolved={
                        !!gameState.pendingProposal &&
                        gameState.pendingProposal.playerId === playerId
                    }
                    data={gameState || undefined}
                />
            </div>

            <ProposalSection gameState={gameState} isHost={false} playerId={playerId} />
            <div className="border-border text-muted flex items-center justify-between border-t pt-4 text-xs">
                <span>
                    Joueur: <strong className="text-foreground">{pseudo}</strong>
                </span>
            </div>
        </AlphaCard>
    );
};

export default function EscapeGamePage() {
    const { session, clearSession, isLoaded } = usePlayerSession();
    const [viewMode, setViewMode] = useState<'select' | 'host' | 'player'>('select');
    const activeMode = session
        ? session.playerId.startsWith('host-') || session.isPromoted
            ? 'host'
            : 'player'
        : viewMode;

    if (!isLoaded) return null;

    return (
        <div className="min-h-screen pb-20">
            <AlphaHeader title="Escape Game System" subtitle="Scénario: Protocole Alpha" />
            <div className="mx-auto mt-8 max-w-2xl px-4">
                {activeMode === 'select' && (
                    <AlphaCard title="Bienvenue">
                        <div className="grid grid-cols-1 gap-6 py-8 md:grid-cols-2">
                            <button
                                onClick={() => setViewMode('host')}
                                className="border-border bg-surface hover:bg-surface-highlight hover:border-brand-purple group flex flex-col items-center gap-4 rounded-xl border p-6 transition-all"
                            >
                                <div className="text-brand-purple bg-brand-purple/10 rounded-full p-4 transition-transform group-hover:scale-110">
                                    <ComputerDesktopIcon className="h-10 w-10" />
                                </div>
                                <div className="text-center">
                                    <h3 className="text-foreground text-lg font-bold">
                                        CRÉER UNE SALLE
                                    </h3>
                                    <p className="text-muted mt-1 text-xs">
                                        Pour le Maître du Jeu (Hôte)
                                    </p>
                                </div>
                            </button>
                            <button
                                onClick={() => setViewMode('player')}
                                className="border-border bg-surface hover:bg-surface-highlight hover:border-brand-blue group flex flex-col items-center gap-4 rounded-xl border p-6 transition-all"
                            >
                                <div className="text-brand-blue rounded-full bg-blue-900/20 p-4 transition-transform group-hover:scale-110">
                                    <RocketLaunchIcon className="h-10 w-10" />
                                </div>
                                <div className="text-center">
                                    <h3 className="text-foreground text-lg font-bold">REJOINDRE</h3>
                                    <p className="text-muted mt-1 text-xs">
                                        Pour les Joueurs / Agents
                                    </p>
                                </div>
                            </button>
                        </div>
                    </AlphaCard>
                )}
                {activeMode === 'host' && (
                    <HostInterface
                        onLogout={() => {
                            clearSession();
                            setViewMode('select');
                        }}
                    />
                )}
                {activeMode === 'player' && (
                    <PlayerInterface
                        onLogout={() => {
                            clearSession();
                            setViewMode('select');
                        }}
                        onPromote={() => {
                            setViewMode('host');
                        }}
                    />
                )}
            </div>
        </div>
    );
}
