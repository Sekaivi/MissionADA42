'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import {
    ArrowRightEndOnRectangleIcon,
    BellAlertIcon,
    ClockIcon,
    ComputerDesktopIcon,
    LightBulbIcon,
    RocketLaunchIcon,
    TrophyIcon,
    UserGroupIcon,
    UserIcon,
    UserMinusIcon,
} from '@heroicons/react/24/solid';
import { AnimatePresence } from 'framer-motion';

import { AlphaButton } from '@/components/alpha/AlphaButton';
import { AlphaCard } from '@/components/alpha/AlphaCard';
import { AlphaError } from '@/components/alpha/AlphaError';
import { AlphaHeader } from '@/components/alpha/AlphaHeader';
import { DialogueBox } from '@/components/dialogueBox';
import { EmergencyOverlay } from '@/components/overlays/EmergencyOverlay';
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
// TYPES & INTERFACES
// ============================================================================

interface SessionData {
    pseudo: string;
    gameCode: string;
    playerId: string;
}

interface SessionSetters {
    setPseudo: (v: string) => void;
    setCode: (v: string | null) => void;
    setId: (v: string) => void;
    setInputCode?: (v: string) => void;
}

interface GlobalTimerProps {
    startTime?: number | string;
    isStopped?: boolean;
    endTime?: number;
    totalDuration: number;
}

interface GameHeaderProps {
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
    totalDuration: number;
}

interface ProposalSectionProps {
    gameState: GameState | null;
    isHost: boolean;
    onAccept?: () => void;
    onReject?: () => void;
    playerId?: string;
}

interface ConnectionScreenProps {
    mode: 'host' | 'player';
    pseudo: string;
    setPseudo: (v: string) => void;
    code?: string;
    setCode?: (v: string) => void;
    onAction: () => void;
    onBack: () => void;
}

// ============================================================================
// UTILITAIRES & HOOKS TECHNIQUES
// ============================================================================

const toMs = (timestamp: number | string | undefined) => {
    if (!timestamp) return 0;
    const num = Number(timestamp);
    return isNaN(num) ? 0 : num < 100000000000 ? num * 1000 : num;
};

const formatTime = (seconds: number) => {
    if (isNaN(seconds) || seconds < 0) return '00:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

const useSessionInputSync = (
    isLoaded: boolean,
    session: SessionData | null,
    localId: string,
    setters: SessionSetters
) => {
    useEffect(() => {
        if (!isLoaded) return;
        if (session) {
            setters.setPseudo(session.pseudo);
            setters.setCode(session.gameCode);
            setters.setId(session.playerId);
            if (setters.setInputCode) setters.setInputCode(session.gameCode);
        } else {
            setters.setId(localId);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isLoaded, session, localId]);
};

// ============================================================================
// HOOK LOGIQUE METIER
// ============================================================================

const useSharedGameLogic = (gameCode: string | null, isHost: boolean) => {
    const { gameState, updateState, refresh, error } = useGameSync(gameCode, isHost);

    const [adminDialogueOpen, setAdminDialogueOpen] = useState(false);
    const [adminScript, setAdminScript] = useState<DialogueLine[]>([]);
    const [activeChallenge, setActiveChallenge] = useState<{ type: string; id: number } | null>(
        null
    );

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

    const [currentTime, setCurrentTime] = useState(() => Date.now());

    useEffect(() => {
        const i = setInterval(() => setCurrentTime(Date.now()), 1000);
        return () => clearInterval(i);
    }, []);

    const effectiveStartTime = gameState?.startTime ?? gameState?.timestamp;
    const bonusSeconds = (gameState?.bonusTime || 0) * 60;
    const currentTotalDuration = SCENARIO.defaultDuration + bonusSeconds;

    const elapsedTime = effectiveStartTime ? (currentTime - toMs(effectiveStartTime)) / 1000 : 0;

    const safeStep = Math.max(1, gameState?.step || 1);
    const currentStepIndex = Math.min(safeStep - 1, SCENARIO.steps.length - 1);
    const currentScenarioStep = SCENARIO.steps[currentStepIndex];

    const isGameWon = currentScenarioStep.componentId === 'victory-screen';
    const isTimeUp = !isGameWon && elapsedTime > currentTotalDuration;

    const timerEndTime = isGameWon
        ? gameState?.lastUpdate
        : toMs(effectiveStartTime) + currentTotalDuration * 1000;

    const ActivePuzzleComponent =
        PUZZLE_COMPONENTS[currentScenarioStep?.componentId] ||
        (() => <div className="text-brand-error">Erreur chargement puzzle</div>);

    return {
        gameState,
        updateState,
        refresh,
        error,
        adminDialogueOpen,
        setAdminDialogueOpen,
        adminScript,
        activeChallenge,
        handleChallengeResolved,
        effectiveStartTime,
        currentTotalDuration,
        currentScenarioStep,
        safeStep,
        isGameWon,
        isTimeUp,
        timerEndTime,
        ActivePuzzleComponent,
    };
};

// on déduit le type de retour du hook pour typer le layout
type SharedLogic = ReturnType<typeof useSharedGameLogic>;

// ============================================================================
// COMPOSANTS UI PARTAGÉS
// ============================================================================

const GlobalTimer: React.FC<GlobalTimerProps> = ({
    startTime,
    isStopped,
    endTime,
    totalDuration,
}) => {
    const [now, setNow] = useState(() => Date.now());

    useEffect(() => {
        if (isStopped) return;
        const i = setInterval(() => setNow(Date.now()), 1000);
        return () => clearInterval(i);
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
                className={`text-[10px] font-bold uppercase ${isUrgent ? 'text-brand-error' : 'text-muted'}`}
            >
                TEMPS RESTANT
            </span>
            <div
                className={`flex items-center gap-2 font-mono text-xl font-black ${isUrgent ? 'text-brand-error animate-pulse' : 'text-brand-emerald'} ${isStopped ? 'opacity-50' : ''}`}
            >
                <ClockIcon className="h-5 w-5" />
                {displayTime}
            </div>
        </div>
    );
};

const GameHeader: React.FC<GameHeaderProps> = ({
    code,
    step,
    startTime,
    onLogout,
    isLeaving,
    showConnectionStatus,
    scenarioTitle,
    isTimerStopped,
    timerEndTime,
    totalDuration,
}) => (
    <div className="border-border mb-6 grid grid-cols-3 items-start gap-4 border-b pb-4">
        <div>
            {showConnectionStatus ? (
                <div className="flex items-center gap-2">
                    <div className="bg-brand-emerald h-2 w-2 animate-pulse rounded-full" />
                    <span className="text-muted font-mono text-xs">EN LIGNE</span>
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
            <div className="text-brand-blue mb-1 text-sm font-bold">{scenarioTitle}</div>
            <div className="text-muted text-xs">
                Étape {step} / {SCENARIO.steps.length}
            </div>
        </div>
        <div className="flex flex-col items-end gap-2">
            <GlobalTimer
                startTime={startTime}
                isStopped={isTimerStopped}
                endTime={timerEndTime}
                totalDuration={totalDuration}
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

const ProposalSection: React.FC<ProposalSectionProps> = ({
    gameState,
    isHost,
    onAccept,
    onReject,
    playerId,
}) => {
    const proposal = gameState?.pendingProposal;
    if (!proposal) return null;
    const isMyProposal = proposal.playerId === playerId;

    if (isHost || isMyProposal) {
        return (
            <div className="animate-in zoom-in border-brand-yellow/50 bg-brand-yellow/10 mb-6 rounded-xl border p-4 duration-300">
                <div className="flex gap-4">
                    <BellAlertIcon className="text-brand-yellow h-8 w-8 animate-bounce" />
                    <div className="flex-1">
                        <h3 className="text-brand-yellow font-bold">
                            {isHost ? 'Proposition en attente !' : 'En attente du MJ...'}
                        </h3>
                        <p className="mt-1 text-sm text-white">
                            <span className="text-lg font-bold">{proposal.playerName}</span>{' '}
                            {isHost ? 'propose :' : 'a proposé :'}
                        </p>
                        <div className="my-3 rounded-lg border border-white/10 bg-black/40 p-3 text-center text-lg italic">
                            "{proposal.actionLabel}"
                        </div>
                        {isHost && (
                            <div className="grid grid-cols-2 gap-3">
                                <AlphaButton variant={'primary'} onClick={onAccept} fullWidth>
                                    Valider
                                </AlphaButton>
                                <AlphaButton variant={'danger'} onClick={onReject} fullWidth>
                                    Refuser
                                </AlphaButton>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    }
    return (
        <div className="bg-surface-highlight border-border mb-6 cursor-not-allowed rounded-xl border p-6 text-center opacity-50">
            <ClockIcon className="text-muted mx-auto mb-2 h-6 w-6" />
            <h3 className="text-muted text-sm font-bold">Système Verrouillé</h3>
            <p className="text-muted/70 text-xs">{proposal.playerName} propose une solution...</p>
        </div>
    );
};

// ============================================================================
// LAYOUT PRINCIPAL
// ============================================================================

interface GameInterfaceLayoutProps {
    logic: SharedLogic;
    gameCode: string | null;
    playerId: string;
    pseudo: string;
    isHost: boolean;
    onLogout: () => void;
    isLeaving: boolean;
    children?: React.ReactNode;
    onPuzzleSolve: () => void;
    onAccept?: () => void;
    onReject?: () => void;
}

const GameInterfaceLayout: React.FC<GameInterfaceLayoutProps> = ({
    logic,
    gameCode,
    playerId,
    isHost,
    onLogout,
    isLeaving,
    children,
    onPuzzleSolve,
    onAccept,
    onReject,
}) => {
    const {
        gameState,
        adminDialogueOpen,
        setAdminDialogueOpen,
        adminScript,
        activeChallenge,
        handleChallengeResolved,
        effectiveStartTime,
        currentTotalDuration,
        currentScenarioStep,
        safeStep,
        isGameWon,
        isTimeUp,
        timerEndTime,
        ActivePuzzleComponent,
    } = logic;

    const title = isHost ? 'Tableau de Bord Hôte' : 'Terminal Agent';

    if (isTimeUp) {
        return (
            <AlphaCard title={title} className="border-brand-purple/50">
                <GameHeader
                    code={gameCode}
                    step={safeStep}
                    startTime={effectiveStartTime}
                    onLogout={onLogout}
                    isLeaving={isLeaving}
                    showConnectionStatus={!isHost}
                    scenarioTitle={currentScenarioStep.title}
                    isTimerStopped={true}
                    timerEndTime={timerEndTime}
                    totalDuration={currentTotalDuration}
                />
                <DefeatScreen />
            </AlphaCard>
        );
    }

    return (
        <AlphaCard title={title} className="border-brand-purple/50">
            <div className="relative z-[51]">
                <DialogueBox
                    script={adminScript}
                    onComplete={() => setAdminDialogueOpen(false)}
                    isOpen={adminDialogueOpen}
                />
                <AnimatePresence>
                    {activeChallenge && (
                        <EmergencyOverlay
                            key={activeChallenge.id}
                            type={activeChallenge.type}
                            onResolve={handleChallengeResolved}
                        />
                    )}
                </AnimatePresence>
            </div>

            <GameHeader
                code={gameCode}
                step={safeStep}
                startTime={effectiveStartTime}
                onLogout={onLogout}
                isLeaving={isLeaving}
                showConnectionStatus={!isHost}
                scenarioTitle={currentScenarioStep.title}
                isTimerStopped={isGameWon}
                timerEndTime={timerEndTime}
                totalDuration={currentTotalDuration}
            />

            <ProposalSection
                gameState={gameState}
                isHost={isHost}
                onAccept={onAccept}
                onReject={onReject}
                playerId={playerId}
            />

            {isHost && !isGameWon && (
                <div className="border-brand-purple/30 mb-6 rounded-lg border bg-black/20 p-4">
                    <div className="mb-2 flex items-center justify-between">
                        <h5 className="text-brand-purple flex items-center gap-2 text-xs font-bold uppercase">
                            <LightBulbIcon className="h-4 w-4" /> Solution
                        </h5>
                        <span className="text-muted text-xs">ID: {currentScenarioStep.id}</span>
                    </div>
                    <p className="mb-2 text-sm text-gray-300 italic">
                        "{currentScenarioStep.description}"
                    </p>
                    <div className="border-brand-emerald text-brand-emerald mb-3 border-l-2 pl-3 font-mono text-sm font-bold">
                        SOLUTION : {currentScenarioStep.solution}
                    </div>
                    {/* CORRECTION ANY: Typage explicite des indices */}
                    {currentScenarioStep.hints.map((h: { id: string; text: string }) => (
                        <div key={h.id} className="text-muted text-xs">
                            💡 {h.text}
                        </div>
                    ))}
                </div>
            )}

            {!gameState?.pendingProposal && (
                <div
                    className={`mb-8 ${isHost ? 'border-border border-t border-dashed pt-6' : ''}`}
                >
                    {isHost && !isGameWon && (
                        <h4 className="text-muted mb-4 text-center text-xs font-bold uppercase">
                            Interface de contrôle
                        </h4>
                    )}
                    <ActivePuzzleComponent
                        onSolve={onPuzzleSolve}
                        isSolved={
                            !!gameState?.pendingProposal &&
                            gameState.pendingProposal.playerId === playerId
                        }
                        data={gameState || undefined}
                    />
                </div>
            )}

            {children}
        </AlphaCard>
    );
};

// ============================================================================
// IMPLEMENTATIONS SPÉCIFIQUES
// ============================================================================

const HostInterface = ({ onLogout }: { onLogout: () => void }) => {
    const { session, saveSession, isLoaded } = usePlayerSession();
    const [pseudo, setPseudo] = useState('Hôte');
    const [activeCode, setActiveCode] = useState<string | null>(null);
    const [hostId, setHostId] = useState('');
    const [isLeaving, setIsLeaving] = useState(false);
    const [generatedHostId] = useState(() => `host-${crypto.randomUUID().slice(0, 8)}`);

    useSessionInputSync(isLoaded, session, generatedHostId, {
        setPseudo,
        setCode: setActiveCode,
        setId: setHostId,
    });

    const logic = useSharedGameLogic(activeCode, true);
    const { gameState, updateState, effectiveStartTime, error } = logic;

    const handleCreateGame = useCallback(async () => {
        if (!hostId) return;
        const res = await createGame();
        if (res.success && res.code) {
            saveSession(res.code, pseudo, hostId);
            setActiveCode(res.code);
        }
    }, [hostId, pseudo, saveSession]);

    useEffect(() => {
        if (activeCode && hostId && gameState && (!gameState.step || gameState.step === 0)) {
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
            const players = gameState.players || [];
            if (!players.find((p) => p.id === hostId)) {
                updateState({
                    ...gameState,
                    players: [
                        ...players,
                        { id: hostId, name: pseudo, isGM: true, joinedAt: Date.now() },
                    ],
                });
            }
        }
    }, [gameState, activeCode, hostId, isLeaving, pseudo, updateState]);

    const handleAccept = useCallback(() => {
        if (!gameState) return;
        const now = Date.now();
        const startOfStep = toMs(gameState.lastStepTime || effectiveStartTime);
        const nextStep = Math.min(Math.max(1, gameState.step || 1) + 1, SCENARIO.steps.length);
        updateState({
            ...gameState,
            step: nextStep,
            message: `Étape ${nextStep}`,
            pendingProposal: null,
            history: [
                {
                    step: Math.max(1, gameState.step || 1),
                    solverName: gameState.pendingProposal?.playerName || pseudo,
                    solvedAt: now,
                    duration: (now - startOfStep) / 1000,
                },
                ...(gameState.history || []),
            ],
            lastStepTime: now,
            lastUpdate: now,
        });
    }, [gameState, effectiveStartTime, updateState, pseudo]);

    const handleReject = useCallback(
        () => updateState({ ...gameState!, pendingProposal: null, lastUpdate: Date.now() }),
        [gameState, updateState]
    );

    const handleManualSkip = useCallback(() => {
        handleAccept();
    }, [handleAccept]);

    const handleHostLogout = async () => {
        setIsLeaving(true);
        if (gameState) {
            const nextPlayers = (gameState.players || []).filter((p) => p.id !== hostId);
            await updateState({
                ...gameState,
                players:
                    nextPlayers.length > 0
                        ? nextPlayers.map((p, i) => (i === 0 ? { ...p, isGM: true } : p))
                        : nextPlayers,
            });
        }
        onLogout();
    };

    const kickPlayer = (id: string) => {
        if (!gameState) return;
        updateState({
            ...gameState,
            players: (gameState.players || []).filter((p) => p.id !== id),
        });
    };

    if (error)
        return (
            <AlphaCard title="Erreur">
                <AlphaError message={error} />
                <AlphaButton onClick={onLogout}>Retour</AlphaButton>
            </AlphaCard>
        );
    if (!isLoaded) return <div className="text-muted p-10 text-center">Chargement...</div>;
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

    return (
        <GameInterfaceLayout
            logic={logic}
            gameCode={activeCode}
            playerId={hostId}
            pseudo={pseudo}
            isHost={true}
            onLogout={handleHostLogout}
            isLeaving={isLeaving}
            onPuzzleSolve={handleAccept}
            onAccept={handleAccept}
            onReject={handleReject}
        >
            {!logic.isGameWon && (
                <>
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
                                                className="text-muted hover:text-brand-error p-1"
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
                                            </span>{' '}
                                            - {entry.solverName}
                                        </div>
                                        <div className="text-muted flex items-center gap-1 font-mono">
                                            {formatTime(entry.duration)}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                    <div className="border-border mt-8 border-t pt-4">
                        <button
                            onClick={handleManualSkip}
                            className="text-muted w-full text-xs underline hover:text-white"
                        >
                            Forcer la validation (Skip Étape)
                        </button>
                    </div>
                </>
            )}
        </GameInterfaceLayout>
    );
};

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
    const [generatedPlayerId] = useState(() => `player-${crypto.randomUUID().slice(0, 8)}`);

    useSessionInputSync(isLoaded, session, generatedPlayerId, {
        setPseudo,
        setCode: setConnectedCode,
        setInputCode,
        setId: setPlayerId,
    });

    const logic = useSharedGameLogic(connectedCode, false);
    const { gameState, updateState, refresh, error, currentScenarioStep, isTimeUp } = logic;

    const handleJoin = useCallback(() => {
        if (inputCode.length !== 4 || !pseudo) return;
        saveSession(inputCode.toUpperCase(), pseudo, playerId);
        setConnectedCode(inputCode.toUpperCase());
    }, [inputCode, pseudo, playerId, saveSession]);

    useEffect(() => {
        if (gameState && connectedCode && playerId) {
            const me = (gameState.players || []).find((p) => p.id === playerId);
            if (me) {
                if (!hasJoinedRef.current) hasJoinedRef.current = true;
                if (me.isGM) {
                    promoteSession();
                    onPromote();
                }
            } else {
                if (hasJoinedRef.current) {
                    alert('Vous avez été exclu.');
                    onLogout();
                } else
                    updateState({
                        ...gameState,
                        players: [
                            ...(gameState.players || []),
                            { id: playerId, name: pseudo, isGM: false, joinedAt: Date.now() },
                        ],
                    });
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
                    playerId,
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
    if (!isLoaded) return <div className="text-muted p-10 text-center">Chargement...</div>;
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

    return (
        <GameInterfaceLayout
            logic={logic}
            gameCode={connectedCode}
            playerId={playerId}
            pseudo={pseudo}
            isHost={false}
            onLogout={onLogout}
            isLeaving={false}
            onPuzzleSolve={handlePropose}
        >
            <div className="border-border text-muted flex items-center justify-between border-t pt-4 text-xs">
                <span>
                    Joueur: <strong className="text-foreground">{pseudo}</strong>
                </span>
            </div>
        </GameInterfaceLayout>
    );
};

const ConnectionScreen: React.FC<ConnectionScreenProps> = ({
    mode,
    pseudo,
    setPseudo,
    code,
    setCode,
    onAction,
    onBack,
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
            <div className="mx-auto mt-8">
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
