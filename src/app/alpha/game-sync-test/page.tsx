'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';

import {
    ArrowRightEndOnRectangleIcon,
    BellAlertIcon,
    CheckIcon,
    ClockIcon,
    ComputerDesktopIcon,
    PlayCircleIcon,
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
import { createGame, useGameSync } from '@/hooks/useGameSync';
import { usePlayerSession } from '@/hooks/usePlayerSession';
import { GameState, HistoryEntry, Player } from '@/types/game';

// ============================================================================
// UTILITAIRES & COMPOSANTS PARTAGÉS
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

const GlobalTimer = ({
    startTime,
    label = 'TEMPS TOTAL',
}: {
    startTime: number | string | undefined;
    label?: string;
}) => {
    const [now, setNow] = useState(0);
    useEffect(() => {
        const animate = requestAnimationFrame(() => setNow(Date.now()));
        const interval = setInterval(() => setNow(Date.now()), 1000);
        return () => {
            cancelAnimationFrame(animate);
            clearInterval(interval);
        };
    }, []);

    const startMs = toMs(startTime);
    let displayTime = '--:--';
    if (startMs > 0 && now > 0) {
        const diff = Math.floor((now - startMs) / 1000);
        displayTime = formatTime(diff > 0 ? diff : 0);
    }

    return (
        <div className="flex flex-col items-end">
            <span className="text-muted text-[10px] font-bold uppercase">{label}</span>
            <div className="text-brand-emerald flex items-center gap-2 font-mono text-xl font-black">
                <ClockIcon className="h-5 w-5" />
                {displayTime}
            </div>
        </div>
    );
};

// --- HEADER COMMUN ---
const GameHeader = ({
    code,
    step,
    startTime,
    onLogout,
    isLeaving,
    connectionStatus,
    showConnectionStatus,
}: {
    code: string | null;
    step?: number;
    startTime?: number | string;
    onLogout: () => void;
    isLeaving?: boolean;
    connectionStatus?: string;
    showConnectionStatus?: boolean;
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
            <div className="text-muted text-[10px] tracking-widest uppercase">Étape</div>
            <div className="text-4xl font-black text-white">{step ?? '-'}</div>
        </div>
        <div className="flex flex-col items-end gap-2">
            <GlobalTimer startTime={startTime} />
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

// --- SECTION PROPOSITION COMMUNE ---
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

    if (!proposal) {
        if (isHost) {
            return (
                <div className="border-border text-muted bg-surface/50 mb-6 rounded-xl border border-dashed p-6 text-center">
                    <div className="animate-pulse">En attente de résolution...</div>
                    <span className="text-xs opacity-50">Les joueurs réfléchissent</span>
                </div>
            );
        }
        return null; // Joueur : Rien à afficher si pas de prop
    }

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

// ============================================================================
// COMPOSANT : INTERFACE HÔTE (MJ)
// ============================================================================
const HostInterface = ({ onLogout }: { onLogout: () => void }) => {
    const { session, saveSession, isLoaded } = usePlayerSession();
    const [pseudo, setPseudo] = useState('Hôte');
    const [activeCode, setActiveCode] = useState<string | null>(null);
    const [hostId, setHostId] = useState('');
    const [isLeaving, setIsLeaving] = useState(false);
    const [generatedHostId] = useState(() => `host-${crypto.randomUUID().slice(0, 8)}`);

    useEffect(() => {
        if (isLoaded) {
            const timer = setTimeout(() => {
                if (session) {
                    if (pseudo !== session.pseudo) setPseudo(session.pseudo);
                    if (activeCode !== session.gameCode) setActiveCode(session.gameCode);
                    if (hostId !== session.playerId) setHostId(session.playerId);
                } else {
                    if (hostId !== generatedHostId) setHostId(generatedHostId);
                }
            }, 0);
            return () => clearTimeout(timer);
        }
    }, [isLoaded, session, generatedHostId, pseudo, activeCode, hostId]);

    const { gameState, updateState, error } = useGameSync(activeCode, true);
    const effectiveStartTime = gameState?.startTime ?? gameState?.timestamp;

    const handleCreateGame = useCallback(async () => {
        if (!hostId) return;
        const res = await createGame();
        if (res.success && res.code) {
            saveSession(res.code, pseudo, hostId);
            setActiveCode(res.code);
        }
    }, [hostId, pseudo, saveSession]);

    useEffect(() => {
        if (activeCode && hostId && gameState && typeof gameState.step === 'undefined') {
            const now = Date.now();
            const initialState: GameState = {
                step: 1,
                message: 'En attente du lancement...',
                startTime: now,
                timestamp: Math.floor(now / 1000),
                lastStepTime: now,
                players: [{ id: hostId, name: pseudo, isGM: true, joinedAt: now }],
                history: [],
                pendingProposal: null,
                lastUpdate: now,
            };
            updateState(initialState);
        }
    }, [gameState, activeCode, hostId, pseudo, updateState]);

    useEffect(() => {
        if (gameState && activeCode && hostId && !isLeaving) {
            const currentPlayers = gameState.players || [];
            if (!currentPlayers.find((p) => p.id === hostId)) {
                const hostPlayer: Player = {
                    id: hostId,
                    name: pseudo,
                    isGM: true,
                    joinedAt: Date.now(),
                };
                updateState({ ...gameState, players: [...currentPlayers, hostPlayer] });
            }
        }
    }, [gameState, activeCode, hostId, isLeaving, pseudo, updateState]);

    const handleHostLogout = useCallback(async () => {
        if (!gameState) {
            onLogout();
            return;
        }
        setIsLeaving(true);
        const currentPlayers = gameState.players || [];
        const remainingPlayers = currentPlayers.filter((p) => p.id !== hostId);
        let nextPlayersList = remainingPlayers;
        if (remainingPlayers.length > 0) {
            nextPlayersList = remainingPlayers.map((p, index) => {
                if (index === 0) return { ...p, isGM: true };
                return p;
            });
        }
        await updateState({ ...gameState, players: nextPlayersList });
        onLogout();
    }, [gameState, hostId, onLogout, updateState]);

    const handleAccept = useCallback(() => {
        if (!gameState || !gameState.pendingProposal) return;
        const now = Date.now();
        const startOfStep = toMs(gameState.lastStepTime || effectiveStartTime);
        const duration = (now - startOfStep) / 1000;
        const newHistoryItem: HistoryEntry = {
            step: gameState.step,
            solverName: gameState.pendingProposal.playerName,
            solvedAt: now,
            duration: duration,
        };
        updateState({
            ...gameState,
            step: gameState.step + 1,
            message: `Étape ${gameState.step + 1} en cours`,
            pendingProposal: null,
            history: [newHistoryItem, ...(gameState.history || [])],
            lastStepTime: now,
            lastUpdate: now,
        });
    }, [gameState, effectiveStartTime, updateState]);

    const handleReject = useCallback(() => {
        if (!gameState) return;
        updateState({ ...gameState, pendingProposal: null, lastUpdate: Date.now() });
    }, [gameState, updateState]);

    const handleManualSkip = useCallback(() => {
        if (!gameState) return;
        const now = Date.now();
        const startOfStep = toMs(gameState.lastStepTime || effectiveStartTime);
        const duration = (now - startOfStep) / 1000;
        const newHistoryItem: HistoryEntry = {
            step: gameState.step,
            solverName: 'ADMIN (Skip)',
            solvedAt: now,
            duration: duration,
        };
        updateState({
            ...gameState,
            step: gameState.step + 1,
            message: `Étape ${gameState.step + 1} (Forcée)`,
            history: [newHistoryItem, ...(gameState.history || [])],
            pendingProposal: null,
            lastStepTime: now,
            lastUpdate: now,
        });
    }, [gameState, effectiveStartTime, updateState]);

    const kickPlayer = useCallback(
        (idToKick: string) => {
            if (!gameState) return;
            const newPlayers = (gameState.players || []).filter((p) => p.id !== idToKick);
            let newPending = gameState.pendingProposal;
            if (newPending?.playerId === idToKick) newPending = null;
            updateState({ ...gameState, players: newPlayers, pendingProposal: newPending });
        },
        [gameState, updateState]
    );

    if (error)
        return (
            <AlphaCard title="Erreur" contentClassName={'flex flex-col gap-4 items-center'}>
                <AlphaError message={error} />
                <AlphaButton onClick={onLogout}>Retour</AlphaButton>
            </AlphaCard>
        );
    if (!isLoaded)
        return <div className="text-muted animate-pulse p-10 text-center">Chargement...</div>;

    if (!activeCode) {
        return (
            <AlphaCard title="Création de Session">
                <div className="flex flex-col items-center gap-6 py-6">
                    <div className="bg-surface-highlight rounded-full p-6">
                        <ComputerDesktopIcon className="text-brand-purple h-12 w-12" />
                    </div>
                    <div className="w-full max-w-sm space-y-2">
                        <label className="text-muted text-xs font-bold uppercase">
                            Pseudo de l'Hôte
                        </label>
                        <input
                            value={pseudo}
                            onChange={(e) => setPseudo(e.target.value)}
                            className="bg-surface border-border text-foreground w-full rounded-lg border px-4 py-3 outline-none"
                        />
                    </div>
                    <div className="w-full max-w-sm">
                        <AlphaButton onClick={handleCreateGame}>INITIALISER LA SALLE</AlphaButton>
                    </div>
                    <button onClick={onLogout} className="text-muted hover:text-foreground text-sm">
                        Retour
                    </button>
                </div>
            </AlphaCard>
        );
    }

    return (
        <AlphaCard title="Tableau de Bord Hôte" className="border-brand-purple/50">
            <GameHeader
                code={activeCode}
                step={gameState?.step}
                startTime={effectiveStartTime}
                onLogout={handleHostLogout}
                isLeaving={isLeaving}
            />

            <ProposalSection
                gameState={gameState}
                isHost={true}
                onAccept={handleAccept}
                onReject={handleReject}
            />

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
                        <TrophyIcon className="h-4 w-4" /> Historique & Temps
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
                        {(!gameState?.history || gameState.history.length === 0) && (
                            <p className="text-muted py-4 text-center text-xs italic">
                                Historique vide.
                            </p>
                        )}
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
        </AlphaCard>
    );
};

// ============================================================================
// COMPOSANT : INTERFACE JOUEUR
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
    const [generatedPlayerId] = useState(() => `player-${crypto.randomUUID().slice(0, 8)}`);

    useEffect(() => {
        if (isLoaded) {
            const timer = setTimeout(() => {
                if (session) {
                    setPseudo((prev) => (prev !== session.pseudo ? session.pseudo : prev));
                    setConnectedCode((prev) =>
                        prev !== session.gameCode ? session.gameCode : prev
                    );
                    setInputCode((prev) => (prev !== session.gameCode ? session.gameCode : prev));
                    setPlayerId((prev) => (prev !== session.playerId ? session.playerId : prev));
                } else {
                    setPlayerId((prev) => (prev !== generatedPlayerId ? generatedPlayerId : prev));
                }
            }, 0);
            return () => clearTimeout(timer);
        }
    }, [isLoaded, session, generatedPlayerId]);

    const { gameState, updateState, refresh, error } = useGameSync(connectedCode, false);
    const effectiveStartTime = gameState?.startTime ?? gameState?.timestamp;

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
                    promoteSession();
                    onPromote();
                }
            } else {
                if (hasJoinedRef.current) {
                    alert('Vous avez été exclu de la partie.');
                    onLogout();
                } else {
                    const newPlayer: Player = {
                        id: playerId,
                        name: pseudo,
                        isGM: false,
                        joinedAt: Date.now(),
                    };
                    updateState({ ...gameState, players: [...currentPlayers, newPlayer] });
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
        if (!gameState) return;
        refresh().then(() => {
            updateState({
                ...gameState,
                pendingProposal: {
                    playerId: playerId,
                    playerName: pseudo,
                    actionLabel: `Solution Étape ${gameState.step}`,
                    timestamp: Date.now(),
                },
            });
        });
    }, [gameState, refresh, updateState, playerId, pseudo]);

    if (error)
        return (
            <AlphaCard title="Erreur" contentClassName={'flex flex-col gap-4 items-center'}>
                <AlphaError message={error} />
                <AlphaButton onClick={onLogout}>Retour</AlphaButton>
            </AlphaCard>
        );
    if (!isLoaded)
        return <div className="text-muted animate-pulse p-10 text-center">Chargement...</div>;

    if (!connectedCode) {
        return (
            <AlphaCard title="Rejoindre une Partie">
                <div className="flex flex-col items-center gap-6 py-6">
                    <div className="bg-surface-highlight rounded-full p-6">
                        <UserIcon className="text-brand-blue h-12 w-12" />
                    </div>
                    <div className="w-full max-w-sm space-y-4">
                        <div>
                            <label className="text-muted text-xs font-bold uppercase">
                                Votre Pseudo
                            </label>
                            <input
                                value={pseudo}
                                onChange={(e) => setPseudo(e.target.value)}
                                className="bg-surface border-border text-foreground w-full rounded-lg border px-4 py-3 outline-none"
                                placeholder="Ex: Agent Alpha"
                            />
                        </div>
                        <div>
                            <label className="text-muted text-xs font-bold uppercase">
                                Code Session
                            </label>
                            <input
                                value={inputCode}
                                maxLength={4}
                                onChange={(e) => setInputCode(e.target.value)}
                                className="bg-surface border-border text-foreground w-full rounded-lg border px-4 py-3 text-center font-mono tracking-widest uppercase outline-none"
                                placeholder="ABCD"
                            />
                        </div>
                    </div>
                    <div className="w-full max-w-sm">
                        <AlphaButton onClick={handleJoin}>REJOINDRE</AlphaButton>
                    </div>
                    <button onClick={onLogout} className="text-muted hover:text-foreground text-sm">
                        Retour
                    </button>
                </div>
            </AlphaCard>
        );
    }

    if (!gameState)
        return (
            <AlphaCard title="Connexion...">
                <div className="text-muted animate-pulse py-20 text-center">
                    Synchronisation avec le QG...
                </div>
            </AlphaCard>
        );

    return (
        <AlphaCard title="Terminal Agent">
            <GameHeader
                code={connectedCode}
                step={gameState.step}
                startTime={effectiveStartTime}
                onLogout={onLogout}
                isLeaving={false}
                showConnectionStatus={true}
            />

            <p className="text-brand-blue mb-6 text-center text-sm italic">"{gameState.message}"</p>

            <ProposalSection gameState={gameState} isHost={false} playerId={playerId} />

            {!gameState.pendingProposal && (
                <div className="my-8">
                    <button
                        onClick={handlePropose}
                        className="group bg-brand-blue relative w-full overflow-hidden rounded-xl py-4 text-lg font-bold text-white shadow-[0_0_20px_rgba(59,130,246,0.3)] transition-all hover:bg-blue-500 hover:shadow-[0_0_30px_rgba(59,130,246,0.5)] active:scale-95"
                    >
                        <div className="relative z-10 flex items-center justify-center gap-3">
                            <PlayCircleIcon className="h-6 w-6" /> J'AI TROUVÉ !
                        </div>
                    </button>
                </div>
            )}

            <div className="border-border text-muted flex items-center justify-between border-t pt-4 text-xs">
                <span>
                    Joueur: <strong className="text-foreground">{pseudo}</strong>
                </span>
            </div>
        </AlphaCard>
    );
};

// ============================================================================
// PAGE PRINCIPALE : ROUTEUR
// ============================================================================
export default function SyncTestPage() {
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
            <AlphaHeader
                title="Escape Game System"
                subtitle="Prototype de Synchronisation Temps Réel"
            />
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
