'use client';

import React, { Suspense, useCallback, useEffect, useState } from 'react';

import { useRouter, useSearchParams } from 'next/navigation';

import {
    ArrowLeftIcon,
    ArrowPathIcon,
    BoltIcon,
    ChatBubbleLeftRightIcon,
    CheckIcon,
    ClockIcon,
    ExclamationTriangleIcon,
    ForwardIcon,
    StopIcon,
    TrophyIcon,
} from '@heroicons/react/24/solid';

import { AlphaButton } from '@/components/alpha/AlphaButton';
import { AlphaCard } from '@/components/alpha/AlphaCard';
import { AlphaCircularGauge } from '@/components/alpha/AlphaCircularGauge';
import { AlphaError } from '@/components/alpha/AlphaError';
import AlphaFeedbackPill from '@/components/alpha/AlphaFeedbackPill';
import { AlphaPuzzleHeader } from '@/components/alpha/AlphaGameHeader';
import { AlphaGrid } from '@/components/alpha/AlphaGrid';
import { AlphaInfoRow } from '@/components/alpha/AlphaInfoRow';
import { AlphaInput } from '@/components/alpha/AlphaInput';
import { AlphaTitle } from '@/components/alpha/AlphaTitle';
import { SCENARIO } from '@/data/alphaScenario';
import { useGameSync } from '@/hooks/useGameSync';
import { AdminCommandType, ChallengeType, GameState, Player } from '@/types/game';

interface ExtendedGameState extends GameState {
    duration?: number;
    admin_command?: {
        id: number;
        type: AdminCommandType;
        payload?: string | number;
    };
    active_challenge?: {
        id: number;
        type: ChallengeType;
        payload?: string | number | Record<string, unknown>;
    };
}

const AdminTimer = ({ startTime, bonusTime }: { startTime: number; bonusTime: number }) => {
    const [now, setNow] = useState(() => Date.now());

    useEffect(() => {
        const i = setInterval(() => setNow(Date.now()), 1000);
        return () => clearInterval(i);
    }, []);

    const startMs = startTime;
    const totalDurationSec = SCENARIO.defaultDuration + bonusTime * 60;

    const elapsedSec = Math.floor((now - startMs) / 1000);
    const remainingSec = Math.max(0, totalDurationSec - elapsedSec);

    const percentage = Math.min(100, Math.max(0, (remainingSec / totalDurationSec) * 100));

    const mins = Math.floor(remainingSec / 60);
    const secs = remainingSec % 60;
    const timeString = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;

    let variant: 'success' | 'warning' | 'error' = 'success';
    if (remainingSec < 300) variant = 'error';
    else if (remainingSec < 600) variant = 'warning';

    return (
        <div className="flex flex-col items-center justify-center p-4">
            <AlphaCircularGauge
                progress={percentage}
                variant={variant}
                size="h-32 w-32"
                strokeWidth={8}
                showGlow={variant === 'error'}
            >
                <div className="text-center">
                    <div
                        className={`text-2xl font-black tracking-tighter ${variant === 'error' ? 'text-brand-error animate-pulse' : ''}`}
                    >
                        {timeString}
                    </div>
                    <div className="text-[9px] font-bold tracking-widest text-gray-500 uppercase">
                        Restant
                    </div>
                </div>
            </AlphaCircularGauge>

            <div className="mt-2 font-mono text-xs text-gray-600">
                Total: {Math.floor(totalDurationSec / 60)} min
                {bonusTime !== 0 && (
                    <span
                        className={
                            bonusTime > 0 ? 'text-brand-emerald0 ml-1' : 'text-brand-error ml-1'
                        }
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

    // CORRECTION PURITY: On initialise une date fixe au montage du composant
    // Cela sert de valeur par défaut stable si le gameState n'a pas de timestamp
    const [fallbackStartTime] = useState(() => Date.now());

    useEffect(() => {
        if (!gameCode) router.push('/mc-admin');
    }, [gameCode, router]);

    // --- LOGIQUE METIER ---

    const sendEffect = useCallback(
        async (type: AdminCommandType, payload?: string | number) => {
            if (!gameState) return;
            const commandId = Date.now();
            const currentState = gameState as ExtendedGameState;
            const newState = {
                ...currentState,
                admin_command: { id: commandId, type, payload },
                message: type === 'MESSAGE' ? (payload as string) : currentState.message,
            };
            await updateState(newState);
        },
        [gameState, updateState]
    );

    const sendChallenge = useCallback(
        async (type: ChallengeType) => {
            if (!gameState) return;
            const challengeId = Date.now();
            const currentState = gameState as ExtendedGameState;
            const newState = {
                ...currentState,
                active_challenge: { id: challengeId, type },
                message: '⚠️ DÉFI ACTIVÉ : ' + type,
            };
            await updateState(newState);
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

            const newState = {
                ...currentState,
                bonusTime: newBonus,
                admin_command: {
                    id: commandId,
                    type: 'MESSAGE' as AdminCommandType,
                    payload: alertMessage,
                },
                message: `⏱️ Temps modifié (${sign}${minutes} min)`,
            };
            await updateState(newState);
        },
        [gameState, updateState]
    );

    const stopChallenge = useCallback(async () => {
        if (!gameState) return;
        const currentState = gameState as ExtendedGameState;
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { active_challenge, ...rest } = currentState;
        const newState = { ...rest, message: "✅ Défi annulé par l'Admin" };
        await updateState(newState as ExtendedGameState);
    }, [gameState, updateState]);

    const skipLevel = useCallback(async () => {
        if (!gameState) return;
        if (!confirm("Êtes-vous sûr de vouloir forcer l'étape suivante ?")) return;
        const newState = {
            ...gameState,
            step: (gameState.step || 0) + 1,
            message: '⚠️ INTERVENTION ADMIN : NIVEAU PASSÉ',
            active_challenge: undefined,
        };
        await updateState(newState);
    }, [gameState, updateState]);

    // --- RENDU ---
    if (isLoading && !gameState)
        return (
            <div className="flex min-h-screen items-center justify-center bg-gray-950 text-white">
                <div className="animate-pulse text-center">
                    <ArrowPathIcon className="mx-auto mb-4 h-10 w-10 animate-spin text-blue-500" />
                    <p>ÉTABLISSEMENT DE LA LIAISON SATELLITE...</p>
                </div>
            </div>
        );

    if (error)
        return (
            <div className="flex min-h-screen items-center justify-center bg-gray-950 p-4">
                <AlphaCard title="ERREUR CRITIQUE">
                    <AlphaError message={`Liaison échouée : ${error}`} />
                    <AlphaButton onClick={() => router.push('/mc-admin')}>Retour Base</AlphaButton>
                </AlphaCard>
            </div>
        );

    if (!gameState) return <div className="p-10 text-gray-500">Aucun signal.</div>;

    const state = gameState as ExtendedGameState;

    return (
        <>
            {/* HEADER */}
            <AlphaPuzzleHeader
                left={
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => router.push('/mc-admin')}
                            className="text-gray-400 transition hover:text-white"
                        >
                            <ArrowLeftIcon className="h-6 w-6" />
                        </button>
                        <AlphaFeedbackPill
                            type="success"
                            message="LIVE LINK"
                            className="animate-pulse"
                        />
                    </div>
                }
                right={<AlphaTitle>{`SESSION: ${gameCode}`}</AlphaTitle>}
            />

            <AlphaGrid>
                {/* col 1 MONITORING */}
                <AlphaCard title="État Système">
                    <div className="space-y-4">
                        <div className="border-border rounded-lg border">
                            <AdminTimer
                                startTime={state.startTime || state.timestamp || fallbackStartTime}
                                bonusTime={state.bonusTime || 0}
                            />
                        </div>

                        <AlphaInfoRow
                            label={'Perturbation Active'}
                            value={
                                <div className={'flex items-center gap-2'}>
                                    <p
                                        className={`font-bold ${state.active_challenge ? 'text-brand-error' : 'text-muted'}`}
                                    >
                                        {state.active_challenge
                                            ? state.active_challenge.type
                                            : 'AUCUNE'}
                                    </p>
                                    {state.active_challenge ? (
                                        <AlphaButton onClick={stopChallenge} variant={'danger'}>
                                            <StopIcon className="mr-2 h-4 w-4" /> ARRÊTER
                                        </AlphaButton>
                                    ) : (
                                        <CheckIcon className="text-muted h-6 w-6" />
                                    )}
                                </div>
                            }
                        />

                        {/* console log */}
                        <div className="border-border text-brand-emerald rounded border bg-black p-3 font-mono text-xs">
                            <span className="text-muted mr-2">&gt;</span>
                            {state.message || 'Système en attente...'}
                        </div>
                    </div>
                </AlphaCard>

                <AlphaCard
                    title={`Escouade (${state.players?.length || 0})`}
                    contentClassName={'space-y-4'}
                >
                    <ul className="custom-scrollbar max-h-[300px] space-y-2 overflow-y-auto">
                        {state.players?.map((p: Player) => (
                            <li
                                key={p.id}
                                className="bg-surface-highlight flex items-center justify-between rounded p-2 text-sm"
                            >
                                <div className="flex items-center gap-3">
                                    <span
                                        className={`h-2 w-2 rounded-full ${p.isGM ? 'bg-brand-purple shadow-[0_0_8px_var(--color-brand-purple)]' : 'bg-brand-emerald0'}`}
                                    ></span>
                                    <span
                                        className={
                                            p.isGM ? 'text-brand-purple font-bold' : 'text-muted'
                                        }
                                    >
                                        {p.name}
                                    </span>
                                </div>
                                {p.isGM && (
                                    <span className="border-brand-purple bg-brand-purple/10 text-brand-purple rounded border px-1.5 py-0.5 text-[10px]">
                                        GM
                                    </span>
                                )}
                            </li>
                        ))}
                        {(!state.players || state.players.length === 0) && (
                            <li className="text-muted py-4 text-center text-xs italic">
                                Aucun agent connecté
                            </li>
                        )}
                    </ul>

                    <AlphaInfoRow
                        label={
                            <div className="text-muted flex items-center gap-2">
                                <TrophyIcon className="text-brand-yellow h-5 w-5" />
                                <span className="text-xs font-bold uppercase">Progression</span>
                            </div>
                        }
                        value={`Étape ${state.step}`}
                    />
                </AlphaCard>

                {/* cols 2 et 3 : INTERVENTIONS */}
                <div className="lg:col-span-2">
                    <AlphaCard title="Intervention Directe">
                        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                            <div className="space-y-8">
                                {/* temps */}
                                <div className="space-y-3">
                                    <h3 className="text-brand-blue flex items-center gap-2 text-xs font-bold tracking-wider uppercase">
                                        <ClockIcon className="h-4 w-4" /> Distorsion Temporelle
                                    </h3>

                                    <div className="grid grid-cols-3 gap-2">
                                        {[1, 5, 10].map((min) => (
                                            <AlphaButton
                                                key={min}
                                                onClick={() => addTime(min)}
                                                fullWidth
                                                variant={'secondary'}
                                            >
                                                +{min} min
                                            </AlphaButton>
                                        ))}
                                    </div>

                                    <div className="flex gap-2">
                                        <AlphaInput
                                            type="number"
                                            value={customTime}
                                            onChange={(e) => setCustomTime(e.target.value)}
                                            placeholder="Min..."
                                        />
                                        <AlphaButton
                                            onClick={() => {
                                                if (customTime) {
                                                    addTime(parseInt(customTime));
                                                    setCustomTime('');
                                                }
                                            }}
                                            disabled={!customTime}
                                            variant="primary"
                                        >
                                            APPLIQUER
                                        </AlphaButton>
                                    </div>
                                </div>

                                {/* communication */}
                                <div className="space-y-3">
                                    <h3 className="text-muted flex items-center gap-2 text-xs font-bold tracking-wider uppercase">
                                        <ChatBubbleLeftRightIcon className="h-4 w-4" />{' '}
                                        Communication
                                    </h3>
                                    <div className="flex gap-2">
                                        <AlphaInput
                                            type="text"
                                            value={customMessage}
                                            onChange={(e) => setCustomMessage(e.target.value)}
                                            placeholder="Message système..."
                                        />
                                        <AlphaButton
                                            onClick={() => {
                                                sendEffect('MESSAGE', customMessage);
                                                setCustomMessage('');
                                            }}
                                            disabled={!customMessage}
                                        >
                                            envoyer
                                        </AlphaButton>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2">
                                        <AlphaButton
                                            variant={'secondary'}
                                            onClick={() =>
                                                sendEffect('MESSAGE', 'ATTENTION : TEMPS LIMITÉ')
                                            }
                                        >
                                            Alerte Temps
                                        </AlphaButton>
                                    </div>
                                </div>
                            </div>

                            {/* PERTURBATIONS */}
                            <div className="space-y-8">
                                <div className="space-y-3">
                                    <h3 className="text-brand-purple flex items-center gap-2 text-xs font-bold tracking-wider uppercase">
                                        <BoltIcon className="h-4 w-4" /> Effets Visuels
                                    </h3>
                                    <div className="grid grid-cols-2 gap-3">
                                        <AlphaButton
                                            variant={'primary'}
                                            fullWidth
                                            onClick={() => sendEffect('GLITCH', 'heavy')}
                                        >
                                            GLITCH
                                        </AlphaButton>
                                        <AlphaButton
                                            variant={'danger'}
                                            fullWidth
                                            onClick={() => sendEffect('INVERT', 'on')}
                                        >
                                            INVERSION
                                        </AlphaButton>
                                    </div>
                                </div>

                                {/* challenges */}
                                <div className="space-y-3">
                                    <h3 className="text-brand-error flex items-center gap-2 text-xs font-bold tracking-wider uppercase">
                                        <ExclamationTriangleIcon className="h-4 w-4" /> Challenges
                                        Bloquants
                                    </h3>
                                    <button
                                        onClick={() => sendChallenge('GYRO')}
                                        disabled={!!state.active_challenge}
                                        className={`group relative w-full overflow-hidden rounded-xl border p-4 text-center transition-all ${
                                            state.active_challenge
                                                ? 'cursor-not-allowed border-gray-800 bg-gray-900 opacity-50'
                                                : 'border-brand-orange/50 from-brand-orange/20 hover:border-brand-orange cursor-pointer bg-gradient-to-br to-black hover:shadow-[0_0_10px_var(--color-brand-orange)]'
                                        }`}
                                    >
                                        <div className="relative z-10">
                                            <div className="mb-1 text-2xl transition-transform group-hover:scale-110">
                                                🔄
                                            </div>
                                            <div className="text-brand-orange font-black tracking-widest">
                                                GYRO PROTOCOL
                                            </div>
                                            <div className="mt-1 text-[10px] text-orange-200/60 uppercase">
                                                Rotation physique requise
                                            </div>
                                        </div>
                                    </button>
                                </div>

                                {/* Section Admin */}
                                <div className="mt-auto pt-4">
                                    <AlphaButton variant={'danger'} fullWidth onClick={skipLevel}>
                                        <ForwardIcon className="mr-2 h-4 w-4" /> FORCER NIVEAU
                                        SUIVANT
                                    </AlphaButton>
                                </div>
                            </div>
                        </div>
                    </AlphaCard>
                </div>
            </AlphaGrid>
        </>
    );
}

export default function AdminGamePage() {
    return (
        <Suspense fallback={<div className="flex items-center justify-center">Chargement...</div>}>
            <GameControlPanel />
        </Suspense>
    );
}
