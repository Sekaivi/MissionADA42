'use client';

import React, { useCallback, useEffect, useState } from 'react';

import { useRouter } from 'next/navigation';

// --- TYPES ---
// Structure brute retournée par /game/list
interface RawGameData {
    id: number;
    code: string;
    state: string; // C'est du JSON stringifié
    created_at: string;
    updated_at: string;
}

// Structure interne de l'état du jeu (une fois parsé)
interface ParsedGameState {
    step: number;
    message?: string;
    players?: { id: string; name: string; isGM?: boolean }[];
    history?: any[];
    lastUpdate?: number;
}

// --- COMPOSANT LOGIN ---
const AdminLogin = ({ onLogin }: { onLogin: () => void }) => {
    const [pwd, setPwd] = useState('');
    const [error, setError] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (pwd === process.env.NEXT_PUBLIC_ADMIN_PASSWORD) {
            onLogin();
        } else {
            setError(true);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-900 text-white">
            <form
                onSubmit={handleSubmit}
                className="rounded-lg border border-gray-700 bg-gray-800 p-8 shadow-xl"
            >
                <h1 className="mb-6 text-center text-2xl font-bold text-red-500">
                    🔒 Accès Restreint
                </h1>
                <input
                    type="password"
                    value={pwd}
                    onChange={(e) => setPwd(e.target.value)}
                    placeholder="Mot de passe Admin"
                    className="mb-4 w-full rounded border border-gray-600 bg-gray-900 p-3 outline-none focus:border-red-500"
                    autoFocus
                />
                {error && <p className="mb-4 text-sm text-red-400">Accès refusé.</p>}
                <button
                    type="submit"
                    className="w-full rounded bg-red-600 px-4 py-2 font-bold text-white transition hover:bg-red-700"
                >
                    Entrer
                </button>
            </form>
        </div>
    );
};

// --- COMPOSANT DASHBOARD ---
export default function AdminDashboard() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [games, setGames] = useState<RawGameData[]>([]);
    const [loading, setLoading] = useState(false);
    const [lastRefresh, setLastRefresh] = useState<Date | null>(null);

    const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

    const fetchGames = useCallback(async () => {
        try {
            setLoading(true);
            const res = await fetch(`${API_BASE}/game/list`);
            const json = await res.json();

            if (json.status) {
                // On trie par date de mise à jour (les plus récents en premier)
                const sorted = json.data.sort(
                    (a: RawGameData, b: RawGameData) =>
                        new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
                );
                setGames(sorted);
                setLastRefresh(new Date());
            }
        } catch (err) {
            console.error('Erreur fetch admin:', err);
        } finally {
            setLoading(false);
        }
    }, [API_BASE]);

    // Polling automatique toutes les 5 secondes si authentifié
    useEffect(() => {
        if (!isAuthenticated) return;

        fetchGames(); // Premier fetch
        const interval = setInterval(fetchGames, 5000);
        return () => clearInterval(interval);
    }, [isAuthenticated, fetchGames]);

    if (!isAuthenticated) {
        return <AdminLogin onLogin={() => setIsAuthenticated(true)} />;
    }

    return (
        <div className="min-h-screen bg-gray-950 p-6 font-mono text-gray-100">
            {/* HEADER */}
            <header className="mb-8 flex items-center justify-between border-b border-gray-800 pb-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-wider text-red-500">GOD MODE</h1>
                    <p className="mt-1 text-xs text-gray-500">
                        HACKER SPACE CONTROL CENTER • {games.length} SESSIONS ACTIVES
                    </p>
                </div>
                <div className="flex items-center gap-4">
                    <span className="text-xs text-gray-500">
                        Dernière màj: {lastRefresh?.toLocaleTimeString()}
                    </span>
                    <button
                        onClick={() => fetchGames()}
                        className="rounded border border-gray-600 bg-gray-800 px-4 py-2 text-sm hover:bg-gray-700"
                    >
                        {loading ? '...' : 'Refresh'}
                    </button>
                </div>
            </header>

            {/* GRID DES PARTIES */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {games.map((game) => (
                    <GameCard key={game.id} game={game} />
                ))}

                {games.length === 0 && !loading && (
                    <div className="col-span-full py-20 text-center text-gray-600">
                        Aucune partie en cours... Le calme avant la tempête.
                    </div>
                )}
            </div>
        </div>
    );
}

// --- CARTE INDIVIDUELLE DE PARTIE ---
const GameCard = ({ game }: { game: RawGameData }) => {
    const router = useRouter();

    // Parsing sécurisé du JSON imbriqué
    let gameState: ParsedGameState = { step: 0 };
    try {
        gameState = JSON.parse(game.state);
    } catch (e) {
        console.error('Erreur parsing state pour', game.code);
    }

    const playerCount = gameState.players?.length || 0;
    // Calcul rapide du temps inactif (approximatif via updated_at)
    const lastActive = new Date(game.updated_at);
    const now = new Date();
    const minutesSinceUpdate = Math.floor((now.getTime() - lastActive.getTime()) / 60000);

    // Code couleur selon l'état
    const isStale = minutesSinceUpdate > 30; // Inactif > 30 min
    const isActive = minutesSinceUpdate < 2; // Actif < 2 min

    let statusColor = 'border-gray-700';
    if (isActive) statusColor = 'border-green-500 shadow-[0_0_10px_rgba(34,197,94,0.3)]';
    else if (isStale) statusColor = 'border-red-900 opacity-60';

    return (
        <div
            className={`rounded-lg border bg-gray-900 p-5 ${statusColor} group relative transition-transform hover:scale-[1.02]`}
        >
            {/* En-tête Carte */}
            <div className="mb-4 flex items-start justify-between">
                <div>
                    <h2 className="text-3xl font-black tracking-widest text-white">{game.code}</h2>
                    <span className="text-xs text-gray-500">ID: {game.id}</span>
                </div>
                <div
                    className={`rounded px-2 py-1 text-xs font-bold ${isActive ? 'bg-green-900 text-green-300' : 'bg-gray-700 text-gray-400'}`}
                >
                    {isActive ? 'LIVE' : `${minutesSinceUpdate}m ago`}
                </div>
            </div>

            {/* Détails */}
            <div className="space-y-3">
                {/* Barre de progression Etape */}
                <div>
                    <div className="mb-1 flex justify-between text-xs text-gray-400">
                        <span>PROGRESSION</span>
                        <span>ÉTAPE {gameState.step}</span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-gray-800">
                        {/* Supposons qu'il y a 5 étapes max pour l'exemple visuel */}
                        <div
                            className="h-full bg-blue-500 transition-all duration-500"
                            style={{ width: `${Math.min((gameState.step / 5) * 100, 100)}%` }}
                        />
                    </div>
                </div>

                {/* Joueurs */}
                <div className="flex items-center gap-2 text-sm text-gray-300">
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                        />
                    </svg>
                    <span>
                        {playerCount} Joueur{playerCount > 1 ? 's' : ''}
                    </span>
                </div>

                {/* Dernier message système (debug) */}
                {gameState.message && (
                    <div className="mt-2 truncate border-t border-gray-800 pt-2 text-xs text-gray-500 italic">
                        "{gameState.message}"
                    </div>
                )}
            </div>

            {/* Actions (Overlay au survol) */}
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 rounded-lg bg-black/80 opacity-0 backdrop-blur-sm transition-opacity group-hover:opacity-100">
                <button
                    onClick={() => router.push(`/mc-admin/game?code=${game.code}`)}
                    className="w-3/4 rounded bg-blue-600 px-4 py-2 text-sm font-bold text-white hover:bg-blue-500"
                >
                    👁️ ESPIONNER
                </button>
                <button
                    onClick={() => alert(`Détails stats pour ${game.code}`)}
                    className="w-3/4 rounded bg-gray-700 px-4 py-2 text-sm font-bold text-white hover:bg-gray-600"
                >
                    📊 STATS
                </button>
            </div>
        </div>
    );
};
