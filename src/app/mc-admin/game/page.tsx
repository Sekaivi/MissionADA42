'use client';

import React, { Suspense, useCallback, useEffect, useState } from 'react';

import { useRouter, useSearchParams } from 'next/navigation';

import { PaperAirplaneIcon } from '@heroicons/react/24/outline';
import {
    ArrowLeftIcon,
    ArrowPathIcon,
    BoltIcon,
    ChatBubbleLeftRightIcon,
    ClockIcon,
    ExclamationTriangleIcon,
    ForwardIcon,
    StopIcon,
} from '@heroicons/react/24/solid';
import clsx from 'clsx';

import { AlphaButton } from '@/components/alpha/AlphaButton';
import { AlphaCard } from '@/components/alpha/AlphaCard';
import { AlphaCircularGauge } from '@/components/alpha/AlphaCircularGauge';
import { AlphaError } from '@/components/alpha/AlphaError';
import AlphaFeedbackPill from '@/components/alpha/AlphaFeedbackPill';
import { AlphaPuzzleHeader } from '@/components/alpha/AlphaGameHeader';
import { AlphaGrid } from '@/components/alpha/AlphaGrid';
import { AlphaInfoRow } from '@/components/alpha/AlphaInfoRow';
import { AlphaInput } from '@/components/alpha/AlphaInput';
import { AlphaTerminalWrapper } from '@/components/alpha/AlphaTerminalWrapper';
import { AlphaTitle } from '@/components/alpha/AlphaTitle';
import { SCENARIO } from '@/data/alphaScenario';
import { createLog } from '@/hooks/useGameLogic';
import { useGameSync } from '@/hooks/useGameSync';
import { AdminCommandType, ChallengeType, GameLogEntry, GameState, Player } from '@/types/game';

interface ExtendedGameState extends GameState {
    duration?: number;
    logs?: GameLogEntry[];
    admin_command?: {
        id: number;
        type: AdminCommandType;
        payload?: string | number;
    };
    active_challenge?: {
        id: number;
        type: ChallengeType;
        payload?: string | number | Record<string, unknown>;
    } | null;
}

const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
};

const AdminTimer = ({
    startTime,
    bonusTime,
    isStopped,
}: {
    startTime: number;
    bonusTime: number;
    isStopped?: boolean;
}) => {
    const [now, setNow] = useState(() => Date.now());

    useEffect(() => {
        if (isStopped) return;
        const i = setInterval(() => setNow(Date.now()), 1000);
        return () => clearInterval(i);
    }, [isStopped]);

    const totalDurationSec = SCENARIO.defaultDuration + bonusTime * 60;
    const elapsedSec = Math.floor((now - startTime) / 1000);
    const remainingSec = Math.max(0, totalDurationSec - elapsedSec);

    const percentage = Math.min(100, Math.max(0, (remainingSec / totalDurationSec) * 100));

    let variant: 'success' | 'warning' | 'error' = 'success';
    if (remainingSec < 300) variant = 'error';
    else if (remainingSec < 600) variant = 'warning';

    return (
        <div className="flex flex-col items-center justify-center p-2">
            <AlphaCircularGauge
                progress={percentage}
                variant={variant}
                size="h-28 w-28"
                strokeWidth={8}
                showGlow={variant === 'error'}
            >
                <div className="text-center">
                    <div
                        className={clsx(
                            'text-2xl font-black tracking-tighter',
                            variant === 'error' && 'text-brand-error animate-pulse'
                        )}
                    >
                        {formatTime(remainingSec)}
                    </div>
                    <div className="text-muted text-xs font-bold uppercase">Restant</div>
                </div>
            </AlphaCircularGauge>

            <div className="text-muted mt-4 flex items-center gap-2 font-mono text-xs">
                <span>Total: {Math.floor(totalDurationSec / 60)}min</span>
                {bonusTime !== 0 && (
                    <span
                        className={clsx(
                            'font-bold',
                            bonusTime > 0 ? 'text-brand-emerald' : 'text-brand-error'
                        )}
                    >
                        ({bonusTime > 0 ? '+' : ''}
                        {bonusTime})
                    </span>
                )}
            </div>
        </div>
    );
};

function GameControlPanel() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const gameCode = searchParams.get('code');

    const { gameState, updateState, error, isLoading } = useGameSync(gameCode, false);

    const [customMessage, setCustomMessage] = useState('');
    const [customTime, setCustomTime] = useState('');
    const [fallbackStartTime] = useState(() => Date.now());

    const [now, setNow] = useState(() => Date.now());

    useEffect(() => {
        // màj l'heure toutes les secondes pour recalculer isDefeat en temps réel
        const interval = setInterval(() => setNow(Date.now()), 1000);
        return () => clearInterval(interval);
    }, []);

    const historyRef = React.useRef<HTMLDivElement>(null);
    // si l'utilisateur regarde l'historique
    const isUserScrolledUp = React.useRef(false);
    // nombre de logs précédents pour ne scroller que s'il y a du nouveau
    const prevLogLength = React.useRef(0);

    const state = gameState as ExtendedGameState;
    const currentLogs = state?.logs || [];

    // détecter si l'utilisateur scrolle manuellement vers le haut
    const handleScroll = useCallback(() => {
        if (!historyRef.current) return;
        const { scrollTop, scrollHeight, clientHeight } = historyRef.current;

        // si on est à plus de 50px du bas, on considère que l'user regarde l'historique
        const isAtBottom = scrollHeight - scrollTop - clientHeight < 50;
        isUserScrolledUp.current = !isAtBottom;
    }, []);

    useEffect(() => {
        if (!historyRef.current) return;

        const hasNewLogs = currentLogs.length > prevLogLength.current;

        // on scroll auto si
        // premier chargement (prevLogLength === 0)
        // nouveaux logs ET l'utilisateur n'est pas en train de lire l'historique
        if (prevLogLength.current === 0 || (hasNewLogs && !isUserScrolledUp.current)) {
            historyRef.current.scrollTop = historyRef.current.scrollHeight;
        }

        prevLogLength.current = currentLogs.length;
    }, [currentLogs.length]);

    useEffect(() => {
        if (!gameCode) router.push('/mc-admin');
    }, [gameCode, router]);

    const sendEffect = useCallback(
        async (type: AdminCommandType, payload?: string | number) => {
            if (!gameState) return;
            const commandId = Date.now();
            const currentState = gameState as ExtendedGameState;

            await updateState({
                ...currentState,
                admin_command: { id: commandId, type, payload },
                message: type === 'MESSAGE' ? (payload as string) : currentState.message,
                lastUpdate: Date.now(),
                logs: [
                    ...(currentState.logs || []),
                    createLog('ADMIN', `Commande: ${type}`, payload?.toString()),
                ],
            });
        },
        [gameState, updateState]
    );

    const sendChallenge = useCallback(
        async (type: ChallengeType) => {
            if (!gameState) return;
            const challengeId = Date.now();
            const currentState = gameState as ExtendedGameState;

            await updateState({
                ...currentState,
                active_challenge: { id: challengeId, type },
                message: 'DÉFI ACTIVÉ : ' + type,
                lastUpdate: Date.now(),
                logs: [
                    ...(currentState.logs || []),
                    createLog('WARNING', `Défi lancé : ${type}`, 'Action Admin'),
                ],
            });
        },
        [gameState, updateState]
    );

    const addTime = useCallback(
        async (minutes: number) => {
            if (!gameState) return;
            const commandId = Date.now();
            const currentState = gameState as ExtendedGameState;
            const currentBonus = currentState.bonusTime || 0;
            const newBonus = currentBonus + minutes;
            const sign = minutes > 0 ? '+' : '';
            const alertMessage = `RECALIBRAGE TEMPOREL : ${sign}${minutes} MIN`;

            await updateState({
                ...currentState,
                bonusTime: newBonus,
                admin_command: {
                    id: commandId,
                    type: 'MESSAGE' as AdminCommandType,
                    payload: alertMessage,
                },
                message: `Temps modifié (${sign}${minutes} min)`,
                lastUpdate: Date.now(),
                logs: [
                    ...(currentState.logs || []),
                    createLog('ADMIN', 'Modification Temps', `${sign}${minutes} min`),
                ],
            });
        },
        [gameState, updateState]
    );

    const stopChallenge = useCallback(async () => {
        if (!gameState) return;
        const currentState = gameState as ExtendedGameState;

        await updateState({
            ...currentState,
            active_challenge: null,
            message: "Défi annulé par l'Admin",
            lastUpdate: Date.now(),
            logs: [
                ...(currentState.logs || []),
                createLog('ADMIN', 'Interruption Défi', 'Annulé manuellement'),
            ],
        });
    }, [gameState, updateState]);

    const skipLevel = useCallback(async () => {
        if (!gameState) return;
        if (!confirm("ATTENTION : Cette action est irréversible. Forcer l'étape suivante ?"))
            return;

        const currentState = gameState as ExtendedGameState;
        const nextStep = (gameState.step || 0) + 1;

        const actionTime = Date.now();

        await updateState({
            ...gameState,
            step: (gameState.step || 0) + 1,
            message: 'INTERVENTION ADMIN : NIVEAU PASSÉ',
            active_challenge: null,
            lastStepTime: actionTime,
            lastUpdate: actionTime,
            logs: [
                ...(currentState.logs || []),
                createLog('ADMIN', 'Force Skip Level', `Vers étape ${nextStep}`),
            ],
        });
    }, [gameState, updateState]);

    // --- RENDU ETATS ---
    if (isLoading && !gameState)
        return (
            <div className="animate-pulse text-center">
                <ArrowPathIcon className="text-brand-blue mx-auto mb-4 h-10 w-10 animate-spin" />
                <p className="font-mono text-xs uppercase">Chargement...</p>
            </div>
        );

    if (error)
        return (
            <AlphaCard title="ERREUR CRITIQUE">
                <AlphaError message={`Liaison échouée : ${error}`} />
                <AlphaButton variant={'secondary'} onClick={() => router.push('/mc-admin')}>
                    Retour
                </AlphaButton>
            </AlphaCard>
        );

    if (!gameState) return <AlphaError message={`Aucun signal.`} />;

    const startTime = state.startTime || state.timestamp || fallbackStartTime;
    const totalDurationMs = SCENARIO.defaultDuration * 1000 + (state.bonusTime || 0) * 60 * 1000;
    const elapsedMs = now - startTime;
    const isVictory = state.step > SCENARIO.steps.length;
    const isDefeat = !isVictory && elapsedMs > totalDurationMs;

    return (
        <>
            <AlphaPuzzleHeader
                left={
                    <AlphaButton onClick={() => router.push('/mc-admin')} variant={'ghost'}>
                        <ArrowLeftIcon className="mr-2 h-3 w-3" />
                        RETOUR
                    </AlphaButton>
                }
                right={
                    <div className="flex items-center gap-4">
                        <AlphaTitle className="!mb-0 text-lg">{gameCode}</AlphaTitle>
                        {isVictory ? (
                            <AlphaFeedbackPill type="success" message="VICTOIRE" />
                        ) : isDefeat ? (
                            <AlphaFeedbackPill type="error" message="TIMEOUT" />
                        ) : (
                            <AlphaFeedbackPill type="success" message="LIVE LINK" pulse />
                        )}
                    </div>
                }
            />

            <div className="container mx-auto px-4 pb-20">
                <AlphaGrid>
                    {/* col 1 : monitoring */}
                    <AlphaCard title="Monitoring Temporel" className={'col-span-2'}>
                        <AdminTimer
                            startTime={startTime}
                            bonusTime={state.bonusTime || 0}
                            isStopped={isVictory || isDefeat}
                        />

                        {/* log */}
                        <AlphaTerminalWrapper>
                            <div
                                onScroll={handleScroll}
                                className={'max-h-[200px] overflow-y-scroll'}
                                ref={historyRef}
                            >
                                {state.logs && state.logs.length > 0 ? (
                                    [...state.logs].map((log) => (
                                        <div
                                            key={log.id}
                                            className="flex gap-2 font-mono text-xs opacity-80 transition-opacity hover:opacity-100"
                                        >
                                            <span className="text-muted">
                                                {new Date(log.timestamp).toLocaleTimeString([], {
                                                    hour: '2-digit',
                                                    minute: '2-digit',
                                                    second: '2-digit',
                                                })}
                                            </span>
                                            <span
                                                className={clsx(
                                                    'w-10 text-right font-bold',
                                                    log.type === 'ADMIN' && 'text-brand-purple',
                                                    log.type === 'ERROR' && 'text-brand-error',
                                                    log.type === 'WARNING' && 'text-brand-yellow',
                                                    log.type === 'SUCCESS' && 'text-brand-emerald',
                                                    log.type === 'PLAYER' && 'text-brand-blue',
                                                    (log.type === 'INFO' || !log.type) &&
                                                        'text-gray-400'
                                                )}
                                            >
                                                [{log.type ? log.type.substring(0, 3) : 'SYS'}]
                                            </span>
                                            <span className="truncate text-gray-300">
                                                {log.message}
                                            </span>{' '}
                                            :<span>{log.details}</span>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-gray-500 italic">
                                        <span className="mr-2 opacity-50">&gt;</span>
                                        {state.message || 'Système nominal...'}
                                    </div>
                                )}
                            </div>
                        </AlphaTerminalWrapper>
                    </AlphaCard>

                    <AlphaCard
                        title={`Escouade (${state.players?.length || 0})`}
                        contentClassName={'space-y-2'}
                    >
                        <ul className="custom-scrollbar max-h-[200px] space-y-1 overflow-y-auto pr-1">
                            {state.players?.map((p: Player) => (
                                <li key={p.id}>
                                    <AlphaInfoRow
                                        label={p.isGM ? 'Hôte' : 'Agent'}
                                        value={p.name}
                                    />
                                </li>
                            ))}
                        </ul>

                        <div className="border-border border-t pt-4">
                            <AlphaInfoRow
                                label="Progression"
                                value={
                                    <span className="text-brand-yellow font-bold">
                                        Étape {state.step}
                                    </span>
                                }
                            />
                        </div>
                    </AlphaCard>
                    <AlphaCard title="Distorsion Temporelle" icon={ClockIcon}>
                        <div className="grid grid-cols-3 gap-2">
                            {[1, 5, 10].map((min) => (
                                <AlphaButton
                                    key={min}
                                    fullWidth
                                    onClick={() => addTime(min)}
                                    variant={'primary'}
                                >
                                    +{min}m
                                </AlphaButton>
                            ))}
                        </div>
                        <form
                            onSubmit={(e) => {
                                e.preventDefault();
                                if (customTime) {
                                    addTime(parseInt(customTime));
                                    setCustomTime('');
                                }
                            }}
                            className="flex gap-2"
                        >
                            <AlphaInput
                                type="number"
                                value={customTime}
                                onChange={(e) => setCustomTime(e.target.value)}
                                placeholder="Min..."
                                containerClassName={'w-full'}
                            />
                            <AlphaButton type={'submit'} disabled={!customTime}>
                                OK
                            </AlphaButton>
                        </form>
                    </AlphaCard>

                    {/* col 2 et 3 : commandes */}

                    {/* temps */}

                    {/* messages */}
                    <AlphaCard
                        title="Canal Prioritaire"
                        icon={ChatBubbleLeftRightIcon}
                        className={'col-span-2'}
                    >
                        <div className="grid grid-cols-2 gap-2">
                            <AlphaButton
                                fullWidth
                                variant={'warning'}
                                onClick={() => sendEffect('MESSAGE', 'TEMPS LIMITÉ')}
                            >
                                ALERTE TEMPS
                            </AlphaButton>
                            <AlphaButton
                                fullWidth
                                size={'sm'}
                                variant={'primary'}
                                onClick={() => sendEffect('MESSAGE', 'Bon travail agent.')}
                            >
                                FÉLICITER
                            </AlphaButton>
                        </div>
                        <form
                            onSubmit={(e) => {
                                e.preventDefault();
                                sendEffect('MESSAGE', customMessage);
                                setCustomMessage('');
                            }}
                            className="flex gap-2"
                        >
                            <AlphaInput
                                containerClassName="w-full"
                                type="text"
                                value={customMessage}
                                onChange={(e) => setCustomMessage(e.target.value)}
                                placeholder="Message..."
                            />
                            <AlphaButton size="sm" type={'submit'} disabled={!customMessage}>
                                <PaperAirplaneIcon className="h-6 w-6" />
                            </AlphaButton>
                        </form>
                    </AlphaCard>

                    {/* sabotage */}
                    <AlphaCard title="Sabotage & Admin" icon={BoltIcon} className={'col-span-2'}>
                        {/* indicateur de la perturbation en cours */}
                        <div
                            className={clsx(
                                'mb-6 rounded-xl border p-4 shadow-md transition-all',
                                state.active_challenge
                                    ? 'bg-brand-error/10 border-brand-error shadow-brand-error/40'
                                    : 'bg-surface-highlight border-border'
                            )}
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div
                                        className={clsx(
                                            'rounded-full p-2',
                                            state.active_challenge
                                                ? 'bg-brand-error animate-pulse'
                                                : 'bg-surface text-muted'
                                        )}
                                    >
                                        <ExclamationTriangleIcon className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <h4
                                            className={clsx(
                                                'text-sm font-bold uppercase',
                                                state.active_challenge
                                                    ? 'text-brand-error'
                                                    : 'text-muted'
                                            )}
                                        >
                                            {state.active_challenge
                                                ? 'PERTURBATION EN COURS'
                                                : 'Système Stable'}
                                        </h4>
                                        {state.active_challenge && (
                                            <p className="font-mono text-xs">
                                                TYPE: {state.active_challenge.type}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                {state.active_challenge && (
                                    <AlphaButton onClick={stopChallenge} variant="danger" size="sm">
                                        <StopIcon className="mr-1 h-3 w-3" /> STOP
                                    </AlphaButton>
                                )}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                            {/* col 1 : effets bisuels */}
                            <div className="space-y-3">
                                <h4 className="text-muted text-xs font-bold uppercase">
                                    Effets visuels
                                </h4>
                                <div className="grid grid-cols-2 gap-3">
                                    <AlphaButton
                                        fullWidth
                                        variant={'primary'}
                                        onClick={() => sendEffect('GLITCH', 'heavy')}
                                    >
                                        GLITCH
                                    </AlphaButton>
                                    <AlphaButton
                                        fullWidth
                                        variant={'secondary'}
                                        onClick={() => sendEffect('INVERT', 'on')}
                                    >
                                        INVERSION
                                    </AlphaButton>
                                </div>
                            </div>

                            {/* col 2 : perturbations */}
                            <div className="space-y-3">
                                <h4 className="text-brand-error text-xs font-bold uppercase">
                                    Perturbations
                                </h4>

                                <AlphaButton
                                    onClick={() => sendChallenge('GYRO')}
                                    disabled={!!state.active_challenge}
                                    variant={'warning'}
                                    fullWidth
                                >
                                    <ArrowPathIcon className="mr-2 h-5 w-5" /> Gyro Protocol
                                </AlphaButton>
                            </div>

                            <div className={'col-span-2'}>
                                <AlphaButton
                                    variant={'danger'}
                                    fullWidth
                                    onClick={skipLevel}
                                    className="border-dashed"
                                >
                                    <ForwardIcon className="mr-2 h-4 w-4" /> FORCER NIVEAU SUIVANT
                                </AlphaButton>
                            </div>
                        </div>
                    </AlphaCard>
                </AlphaGrid>
            </div>
        </>
    );
}

export default function AdminGamePage() {
    return (
        <Suspense
            fallback={
                <div className="text-brand-emerald flex h-screen items-center justify-center bg-black font-mono">
                    CHARGEMENT...
                </div>
            }
        >
            <GameControlPanel />
        </Suspense>
    );
}
