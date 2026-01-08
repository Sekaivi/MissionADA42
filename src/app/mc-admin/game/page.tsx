'use client';

import React, { Suspense, useEffect, useState } from 'react';

import { useRouter, useSearchParams } from 'next/navigation';

import { ClockIcon } from '@heroicons/react/24/outline';

import { useGameSync } from '@/hooks/useGameSync';
import { AdminCommandType, ChallengeType, GameState } from '@/types/game';

// Assure-toi d'avoir heroicons ou retire l'import

// --- TYPES ÉTENDUS POUR L'INTERFACE ---
// On s'assure que TypeScript connait les deux canaux de commande
interface ExtendedGameState extends GameState {
    // Si ton state utilise 'duration' ou 'endTime', déclare-le ici pour éviter les erreurs TS
    duration?: number;

    admin_command?: {
        id: number;
        type: AdminCommandType;
        payload?: string | number;
    };
    active_challenge?: {
        id: number;
        type: ChallengeType;
        payload?: any;
    };
}

function GameControlPanel() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const gameCode = searchParams.get('code');

    // Polling actif (isGM = false pour mode espion, on ne rejoint pas la liste des joueurs)
    const { gameState, updateState, error, isLoading } = useGameSync(gameCode, false);

    // États locaux pour les inputs
    const [customMessage, setCustomMessage] = useState('');
    const [customTime, setCustomTime] = useState('');

    useEffect(() => {
        if (!gameCode) router.push('/admin');
    }, [gameCode, router]);

    // --- 1. ENVOYER UN EFFET ÉPHÉMÈRE (Message, Glitch) ---
    // Ne touche pas au challenge en cours
    const sendEffect = async (type: AdminCommandType, payload?: any) => {
        if (!gameState) return;
        const currentState = gameState as ExtendedGameState;

        const newState = {
            ...currentState, // On garde tout (y compris active_challenge)
            admin_command: {
                id: Date.now(),
                type,
                payload,
            },
            // Si c'est un message, on met aussi à jour le champ visible pour l'historique
            message: type === 'MESSAGE' ? (payload as string) : currentState.message,
        };

        await updateState(newState);
        console.log(`Effect ${type} sent.`);
    };

    // --- 2. ENVOYER UN CHALLENGE PERSISTANT (Gyro) ---
    // Ne touche pas à la dernière commande admin
    const sendChallenge = async (type: ChallengeType) => {
        if (!gameState) return;
        const currentState = gameState as ExtendedGameState;

        const newState = {
            ...currentState,
            active_challenge: {
                id: Date.now(),
                type,
            },
            message: '⚠️ DÉFI ACTIVÉ : ' + type,
        };

        await updateState(newState);
        console.log(`Challenge ${type} activated.`);
    };

    // --- 3. GESTION DU TEMPS (Modifie le state + Notifie) ---
// --- GESTION DU TEMPS (MODIFIÉ) ---
    const addTime = async (minutes: number) => {
        if (!gameState) return;
        const currentState = gameState as ExtendedGameState;

        // 1. On récupère le bonus actuel (0 par défaut)
        const currentBonus = currentState.bonusTime || 0;
        const newBonus = currentBonus + minutes;

        const sign = minutes > 0 ? '+' : '';
        const alertMessage = `RECALIBRAGE TEMPOREL : ${sign}${minutes} MIN`;

        const newState = {
            ...currentState,

            // 2. On met à jour SEULEMENT le bonus
            bonusTime: newBonus,

            // 3. Feedback habituel
            admin_command: {
                id: Date.now(),
                type: 'MESSAGE' as AdminCommandType,
                payload: alertMessage
            },
            message: `⏱️ Temps modifié (${sign}${minutes} min)`
        };

        await updateState(newState);
        console.log(`Bonus Time total : ${newBonus} min`);
    };

    // --- 4. ANNULER LE CHALLENGE EN COURS (Secours) ---
    const stopChallenge = async () => {
        if (!gameState) return;
        const currentState = gameState as ExtendedGameState;

        // On exclut active_challenge pour le supprimer
        const { active_challenge, ...rest } = currentState;

        const newState = {
            ...rest,
            message: "✅ Défi annulé par l'Admin",
        };

        await updateState(newState as ExtendedGameState);
    };

    // --- 5. FORCER LE NIVEAU SUIVANT ---
    const skipLevel = async () => {
        if (!gameState) return;
        if (!confirm("Êtes-vous sûr de vouloir forcer l'étape suivante ?")) return;

        const newState = {
            ...gameState,
            step: (gameState.step || 0) + 1,
            message: '⚠️ INTERVENTION ADMIN : NIVEAU PASSÉ',
            // On nettoie aussi le challenge si on passe le niveau
            active_challenge: undefined,
        };
        await updateState(newState);
    };

    if (isLoading && !gameState)
        return <div className="animate-pulse p-10 text-white">Liaison satellite en cours...</div>;
    if (error) return <div className="p-10 font-mono text-red-500">ERREUR LINK : {error}</div>;
    if (!gameState) return <div className="p-10 text-gray-500">Aucun signal.</div>;

    const state = gameState as ExtendedGameState;

    return (
        <div className="min-h-screen bg-gray-950 p-4 font-mono text-gray-200 lg:p-8">
            {/* HEADER */}
            <div className="mb-8 flex items-center justify-between border-b border-gray-800 pb-4">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => router.push('/admin')}
                        className="text-gray-500 transition hover:text-white"
                    >
                        &larr; RETOUR
                    </button>
                    <h1 className="text-2xl font-bold text-blue-500">
                        SESSION: <span className="text-white">{gameCode}</span>
                    </h1>
                    <span className="animate-pulse rounded border border-green-900 bg-green-900/30 px-2 py-0.5 text-xs text-green-400">
                        ● LIVE
                    </span>
                </div>
                <div className="text-xs text-gray-600">
                    ID: {state.active_challenge?.id || 'N/A'}
                </div>
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                {/* COLONNE 1 : MONITORING */}
                <div className="space-y-6 lg:col-span-1">
                    {/* Carte INFO */}
                    <div className="rounded-lg border border-gray-700 bg-gray-900 p-4">
                        <h2 className="mb-4 border-b border-gray-800 pb-2 text-sm tracking-widest text-gray-400 uppercase">
                            État Système
                        </h2>
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <span className="text-gray-400">Progression</span>
                                <span className="text-xl font-bold text-yellow-400">
                                    Étape {state.step}
                                </span>
                            </div>

                            {/* Indicateur de Challenge Actif */}
                            <div
                                className={`rounded border p-3 ${state.active_challenge ? 'border-red-500 bg-red-900/20 text-red-400' : 'border-gray-700 bg-gray-800 text-gray-500'}`}
                            >
                                <div className="mb-1 text-xs uppercase">Challenge Bloquant</div>
                                <div className="flex items-center justify-between font-bold">
                                    {state.active_challenge ? state.active_challenge.type : 'AUCUN'}
                                    {state.active_challenge && (
                                        <button
                                            onClick={stopChallenge}
                                            className="animate-pulse rounded bg-red-600 px-2 py-1 text-xs text-white hover:bg-red-500"
                                        >
                                            ARRÊTER
                                        </button>
                                    )}
                                </div>
                            </div>

                            <div className="mt-4 rounded border border-green-900/50 bg-black p-2 font-mono text-xs text-green-400">
                                &gt; {state.message || 'Standby...'}
                            </div>
                        </div>
                    </div>

                    {/* Liste JOUEURS */}
                    <div className="rounded-lg border border-gray-700 bg-gray-900 p-4">
                        <h2 className="mb-4 border-b border-gray-800 pb-2 text-sm tracking-widest text-gray-400 uppercase">
                            Escouade ({state.players?.length || 0})
                        </h2>
                        <ul className="space-y-2">
                            {state.players?.map((p: any) => (
                                <li
                                    key={p.id}
                                    className="flex items-center gap-3 rounded bg-gray-800/50 p-2 text-sm"
                                >
                                    <span
                                        className={`h-2 w-2 rounded-full ${p.isGM ? 'bg-purple-500' : 'bg-green-500'}`}
                                    ></span>
                                    <span
                                        className={
                                            p.isGM ? 'font-bold text-purple-300' : 'text-gray-300'
                                        }
                                    >
                                        {p.name}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                {/* COLONNE 2 & 3 : COMMANDES */}
                <div className="relative overflow-hidden rounded-lg border border-gray-700 bg-gray-900 p-6 lg:col-span-2">
                    <h2 className="mb-6 flex items-center gap-2 text-xl font-bold text-white">
                        <span className="text-red-500">⚡</span> INTERVENTION
                    </h2>

                    <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                        {/* GAUCHE : COMM & TEMPS */}
                        <div className="space-y-6">
                            {/* DISTORSION TEMPORELLE */}
                            <div className="rounded border border-cyan-900/50 bg-cyan-900/10 p-4">
                                <h3 className="mb-3 flex items-center gap-2 text-xs font-bold tracking-wider text-cyan-400 uppercase">
                                    <ClockIcon className="h-4 w-4" /> Distorsion Temporelle
                                </h3>

                                <div className="mb-3 grid grid-cols-3 gap-2">
                                    <button onClick={() => addTime(1)} className="btn-time">
                                        +1 min
                                    </button>
                                    <button onClick={() => addTime(5)} className="btn-time">
                                        +5 min
                                    </button>
                                    <button onClick={() => addTime(10)} className="btn-time">
                                        +10 min
                                    </button>
                                </div>

                                <div className="flex gap-2">
                                    <input
                                        type="number"
                                        value={customTime}
                                        onChange={(e) => setCustomTime(e.target.value)}
                                        placeholder="Min..."
                                        className="w-20 rounded border border-gray-600 bg-gray-800 p-2 text-center text-sm outline-none focus:border-cyan-500"
                                    />
                                    <button
                                        onClick={() => {
                                            if (customTime) {
                                                addTime(parseInt(customTime));
                                                setCustomTime('');
                                            }
                                        }}
                                        disabled={!customTime}
                                        className="flex-1 rounded bg-cyan-700 px-3 py-1 text-xs font-bold hover:bg-cyan-600 disabled:opacity-50"
                                    >
                                        APPLIQUER
                                    </button>
                                </div>
                                <p className="mt-2 text-[10px] text-gray-500">
                                    Val. négative pour retirer du temps (-5).
                                </p>
                            </div>

                            {/* COMMUNICATION */}
                            <div className="space-y-4 border-t border-gray-800 pt-4">
                                <h3 className="text-xs font-bold tracking-wider text-gray-500 uppercase">
                                    Communication
                                </h3>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={customMessage}
                                        onChange={(e) => setCustomMessage(e.target.value)}
                                        placeholder="Message IA..."
                                        className="flex-1 rounded border border-gray-600 bg-gray-800 p-2 text-sm transition outline-none focus:border-blue-500 focus:bg-gray-700"
                                    />
                                    <button
                                        onClick={() => {
                                            sendEffect('MESSAGE', customMessage);
                                            setCustomMessage('');
                                        }}
                                        disabled={!customMessage}
                                        className="rounded bg-blue-600 px-4 py-2 text-sm font-bold hover:bg-blue-500 disabled:opacity-50"
                                    >
                                        DIRE
                                    </button>
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                    <button
                                        onClick={() =>
                                            sendEffect(
                                                'MESSAGE',
                                                'Indice : Regardez sous la table.'
                                            )
                                        }
                                        className="btn-preset"
                                    >
                                        💬 "Indice Table"
                                    </button>
                                    <button
                                        onClick={() =>
                                            sendEffect('MESSAGE', 'ATTENTION : TEMPS LIMITÉ')
                                        }
                                        className="btn-preset"
                                    >
                                        💬 "Alerte Temps"
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* DROITE : PERTURBATIONS & EFFETS */}
                        <div className="space-y-4">
                            {/* EFFETS VISUELS */}
                            <div>
                                <h3 className="mb-2 text-xs font-bold tracking-wider text-gray-500 uppercase">
                                    Effets Visuels
                                </h3>
                                <div className="grid grid-cols-2 gap-2">
                                    <button
                                        onClick={() => sendEffect('GLITCH', 'heavy')}
                                        className="btn-effect border-fuchsia-900 bg-fuchsia-900/20 text-fuchsia-300"
                                    >
                                        👾 GLITCH
                                    </button>
                                    <button
                                        onClick={() => sendEffect('INVERT', 'on')}
                                        className="btn-effect border-indigo-900 bg-indigo-900/20 text-indigo-300"
                                    >
                                        🌗 INVERSION
                                    </button>
                                </div>
                            </div>

                            {/* CHALLENGES */}
                            <div className="border-t border-gray-800 pt-4">
                                <h3 className="mb-2 text-xs font-bold tracking-wider text-red-500 uppercase">
                                    ⚠️ Challenges (Bloquants)
                                </h3>

                                <button
                                    onClick={() => sendChallenge('GYRO')}
                                    disabled={!!state.active_challenge}
                                    className={`group w-full rounded border p-4 text-center transition ${
                                        state.active_challenge
                                            ? 'cursor-not-allowed border-gray-700 bg-gray-800 opacity-50'
                                            : 'cursor-pointer border-orange-600 bg-orange-900/20 hover:bg-orange-900/40'
                                    }`}
                                >
                                    <div className="mb-1 text-2xl">🔄</div>
                                    <div className="font-bold text-orange-400">GYRO PROTOCOL</div>
                                    <div className="mt-1 text-xs text-orange-200/60">
                                        Rotation physique requise
                                    </div>
                                </button>
                            </div>

                            {/* ADMIN LEVEL */}
                            <div className="border-t border-gray-800 pt-4">
                                <h3 className="mb-2 text-xs font-bold tracking-wider text-gray-500 uppercase">
                                    Admin
                                </h3>
                                <button
                                    onClick={skipLevel}
                                    className="flex w-full items-center justify-center gap-2 rounded border border-red-900/50 bg-red-900/10 p-3 text-sm font-bold text-red-400 transition hover:bg-red-900/30"
                                >
                                    ⏩ FORCER NIVEAU SUIVANT
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* STYLES UTILITAIRES POUR ALLEGER LE JSX */}
            <style jsx>{`
                .btn-time {
                    @apply rounded border border-cyan-700 bg-cyan-800/30 py-2 text-sm font-bold text-cyan-100 transition hover:bg-cyan-700;
                }
                .btn-preset {
                    @apply rounded bg-gray-800 p-2 text-left text-xs text-gray-300 transition hover:bg-gray-700;
                }
                .btn-effect {
                    @apply hover:bg-opacity-40 rounded border p-2 text-sm font-bold transition;
                }
            `}</style>
        </div>
    );
}

export default function AdminGamePage() {
    return (
        <Suspense
            fallback={
                <div className="flex h-screen items-center justify-center bg-gray-950 text-white">
                    Chargement Control Room...
                </div>
            }
        >
            <GameControlPanel />
        </Suspense>
    );
}
