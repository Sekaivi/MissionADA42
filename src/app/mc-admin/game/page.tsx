'use client';

import React, { Suspense, useEffect, useState } from 'react';

import { useRouter, useSearchParams } from 'next/navigation';

import { useGameSync } from '@/hooks/useGameSync';
// Assure-toi que le chemin est bon
import { GameState } from '@/types/game';

// --- TYPES POUR LES COMMANDES ADMIN ---
type AdminCommandType = 'MESSAGE' | 'GLITCH' | 'GYRO' | 'INVERT' | 'SKIP';

interface AdminCommand {
    id: number;
    type: AdminCommandType;
    payload?: string | number;
}

// On étend ton type GameState pour inclure la commande admin si elle n'y est pas déjà
interface ExtendedGameState extends GameState {
    admin_command?: AdminCommand;
}

function GameControlPanel() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const gameCode = searchParams.get('code');

    // On utilise ton hook existant.
    // isGM = false car on ne veut pas s'ajouter à la liste des joueurs
    const { gameState, updateState, error, isLoading } = useGameSync(gameCode, false);

    // État local pour le message personnalisé
    const [customMessage, setCustomMessage] = useState('');

    // Sécurité basique : Redirige si pas de code
    useEffect(() => {
        if (!gameCode) router.push('/admin');
    }, [gameCode, router]);

    // --- FONCTION D'ENVOI DE COMMANDE ---
    const sendCommand = async (type: AdminCommandType, payload?: any) => {
        if (!gameState) return;

        // On clone l'état actuel
        const currentState = gameState as ExtendedGameState;

        // On prépare la nouvelle commande
        const command: AdminCommand = {
            id: Date.now(), // ID unique pour que les clients détectent le changement
            type,
            payload,
        };

        // Mise à jour de l'état
        // Note : On ne touche pas aux autres champs (step, players, etc.)
        const newState = {
            ...currentState,
            admin_command: command,
            // Si c'est un message système, on peut aussi mettre à jour le champ message visible
            message: type === 'MESSAGE' ? (payload as string) : currentState.message,
        };

        await updateState(newState);
        // Petit feedback visuel ou log
        console.log(`Commande ${type} envoyée à ${gameCode}`);
    };

    // --- FONCTION SKIP LEVEL (DANGEREUX MAIS UTILE) ---
    const skipLevel = async () => {
        if (!gameState) return;
        if (!confirm("Êtes-vous sûr de vouloir forcer l'étape suivante ?")) return;

        const newState = {
            ...gameState,
            step: (gameState.step || 0) + 1,
            message: '⚠️ INTERVENTION ADMIN : NIVEAU PASSÉ',
        };
        await updateState(newState);
    };

    if (isLoading && !gameState)
        return <div className="p-10 text-white">Chargement du lien quantique...</div>;
    if (error) return <div className="p-10 text-red-500">Erreur de connexion : {error}</div>;
    if (!gameState) return <div className="p-10 text-white">Aucune donnée reçue.</div>;

    const state = gameState as ExtendedGameState;

    return (
        <div className="min-h-screen bg-gray-950 p-4 font-mono text-gray-200 lg:p-8">
            {/* HEADER NAVIGATION */}
            <div className="mb-8 flex items-center gap-4">
                <button
                    onClick={() => router.push('/admin')}
                    className="text-gray-500 transition hover:text-white"
                >
                    &larr; RETOUR LISTE
                </button>
                <h1 className="text-2xl font-bold text-blue-500">
                    SESSIONS : <span className="text-white">{gameCode}</span>
                </h1>
                <span className="rounded border border-gray-600 bg-gray-800 px-2 py-1 text-xs">
                    Polling Actif
                </span>
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                {/* COLONNE 1 : ÉTAT DU JEU (LIVE MONITOR) */}
                <div className="space-y-6 lg:col-span-1">
                    {/* Carte INFO */}
                    <div className="rounded-lg border border-gray-700 bg-gray-900 p-4">
                        <h2 className="mb-4 border-b border-gray-800 pb-2 text-sm text-gray-400 uppercase">
                            État Système
                        </h2>
                        <div className="space-y-2">
                            <div className="flex justify-between">
                                <span>Étape Actuelle :</span>
                                <span className="text-xl font-bold text-yellow-400">
                                    {state.step}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span>Dernière activité :</span>
                                <span className="text-xs">
                                    {new Date((state.timestamp || 0) * 1000).toLocaleTimeString()}
                                </span>
                            </div>
                            <div className="mt-4 rounded border border-green-900 bg-black p-2 font-mono text-xs text-green-400">
                                {state.message || 'Système stable.'}
                            </div>
                        </div>
                    </div>

                    {/* Liste JOUEURS */}
                    <div className="rounded-lg border border-gray-700 bg-gray-900 p-4">
                        <h2 className="mb-4 border-b border-gray-800 pb-2 text-sm text-gray-400 uppercase">
                            Joueurs Connectés ({state.players?.length || 0})
                        </h2>
                        <ul className="space-y-2">
                            {state.players?.map((p: any) => (
                                <li key={p.id} className="flex items-center gap-2 text-sm">
                                    <span
                                        className={`h-2 w-2 rounded-full ${p.isGM ? 'bg-purple-500' : 'bg-green-500'}`}
                                    ></span>
                                    <span className={p.isGM ? 'text-purple-300' : 'text-gray-300'}>
                                        {p.name} {p.isGM && '(Hôte)'}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                {/* COLONNE 2 & 3 : COMMANDES DIVINES */}
                <div className="relative overflow-hidden rounded-lg border border-gray-700 bg-gray-900 p-6 lg:col-span-2">
                    <div className="pointer-events-none absolute top-0 right-0 p-2 text-9xl opacity-10">
                        ⚡
                    </div>

                    <h2 className="mb-6 flex items-center gap-2 text-xl font-bold text-red-500">
                        <span className="animate-pulse">●</span> INTERVENTION DIRECTE
                    </h2>

                    <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                        {/* SECTION MESSAGE */}
                        <div className="space-y-4">
                            <h3 className="text-sm font-bold text-white uppercase">
                                Communication
                            </h3>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={customMessage}
                                    onChange={(e) => setCustomMessage(e.target.value)}
                                    placeholder="Message système..."
                                    className="flex-1 rounded border border-gray-600 bg-gray-800 p-2 text-sm outline-none focus:border-blue-500"
                                />
                                <button
                                    onClick={() => {
                                        sendCommand('MESSAGE', customMessage);
                                        setCustomMessage('');
                                    }}
                                    disabled={!customMessage}
                                    className="rounded bg-blue-600 px-4 py-2 text-sm font-bold hover:bg-blue-500 disabled:opacity-50"
                                >
                                    ENVOYER
                                </button>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                <button
                                    onClick={() =>
                                        sendCommand('MESSAGE', 'Indice : Regardez sous la table.')
                                    }
                                    className="rounded bg-gray-800 p-2 text-left text-xs hover:bg-gray-700"
                                >
                                    "Indice: Table"
                                </button>
                                <button
                                    onClick={() =>
                                        sendCommand('MESSAGE', 'ATTENTION : TEMPS LIMITÉ')
                                    }
                                    className="rounded bg-gray-800 p-2 text-left text-xs hover:bg-gray-700"
                                >
                                    "Alerte Temps"
                                </button>
                            </div>
                        </div>

                        {/* SECTION SABOTAGE / FUN */}
                        <div className="space-y-4">
                            <h3 className="text-sm font-bold text-white uppercase">
                                Perturbations & Urgence
                            </h3>

                            <div className="grid grid-cols-2 gap-3">
                                <button
                                    onClick={() => sendCommand('GLITCH', 'heavy')}
                                    className="rounded border border-fuchsia-700 bg-fuchsia-900 p-3 text-sm font-bold text-fuchsia-100 transition hover:scale-105 hover:bg-fuchsia-700"
                                >
                                    👾 GLITCH ÉCRAN
                                </button>

                                <button
                                    onClick={() => sendCommand('GYRO', 10)}
                                    className="rounded border border-orange-700 bg-orange-900 p-3 text-sm font-bold text-orange-100 transition hover:scale-105 hover:bg-orange-700"
                                >
                                    🔄 GYRO CHALLENGE
                                </button>

                                <button
                                    onClick={() => sendCommand('INVERT', 'on')}
                                    className="rounded border border-indigo-700 bg-indigo-900 p-3 text-sm font-bold text-indigo-100 transition hover:scale-105 hover:bg-indigo-700"
                                >
                                    🌗 INVERSION
                                </button>

                                <button
                                    onClick={skipLevel}
                                    className="flex items-center justify-center gap-2 rounded border border-red-600 bg-red-900 p-3 text-sm font-bold text-red-100 transition hover:scale-105 hover:bg-red-700"
                                >
                                    ⏩ SKIP LEVEL
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* LOGGER DES DERNIERES COMMANDES */}
                    <div className="mt-8 border-t border-gray-800 pt-4">
                        <p className="font-mono text-xs text-gray-500">
                            Dernière commande envoyée : {state.admin_command?.type || 'AUCUNE'}
                            <span className="ml-2 opacity-50">ID: {state.admin_command?.id}</span>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

// Composant Page Principal (avec Suspense pour l'export static)
export default function AdminGamePage() {
    return (
        <Suspense
            fallback={
                <div className="flex min-h-screen items-center justify-center bg-gray-950 text-white">
                    Chargement Control Room...
                </div>
            }
        >
            <GameControlPanel />
        </Suspense>
    );
}
