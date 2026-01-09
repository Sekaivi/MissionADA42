'use client';

import React, { useCallback, useEffect, useState } from 'react';

import { useRouter } from 'next/navigation';

import {
    ArrowPathIcon,
    ChartBarIcon,
    ClockIcon,
    EyeIcon,
    UsersIcon,
} from '@heroicons/react/24/solid';

import { AlphaButton } from '@/components/alpha/AlphaButton';
import { AlphaCard } from '@/components/alpha/AlphaCard';
import AlphaFeedbackPill from '@/components/alpha/AlphaFeedbackPill';
import { AlphaGrid } from '@/components/alpha/AlphaGrid';
import { AlphaHeader } from '@/components/alpha/AlphaHeader';
import { AlphaInfoRow } from '@/components/alpha/AlphaInfoRow';

interface RawGameData {
    id: number;
    code: string;
    state: string;
    created_at: string;
    updated_at: string;
}

interface ParsedGameState {
    step: number;
    message?: string;
    players?: { id: string; name: string; isGM?: boolean }[];
    history?: { step: number; solverName: string; solvedAt: number; duration: number }[];
    lastUpdate?: number;
}

export default function AdminDashboard() {
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

    // polling automatique
    useEffect(() => {
        fetchGames();
        const interval = setInterval(fetchGames, 5000);
        return () => clearInterval(interval);
    }, [fetchGames]);

    return (
        <>
            <AlphaHeader
                title="GOD MODE"
                subtitle={`${games.length} SESSIONS ACTIVES • CONTROL CENTER`}
            />

            <div className="container mx-auto px-4 pt-8">
                <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-2">
                        <ClockIcon className="text-brand-blue h-8 w-8" />
                        <AlphaFeedbackPill
                            message={`Dernière màj: ${lastRefresh?.toLocaleTimeString() || '--:--:--'}`}
                        />
                    </div>
                    <AlphaButton onClick={() => fetchGames()} variant={'secondary'}>
                        <ArrowPathIcon
                            className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`}
                        />
                        RAFRAÎCHIR
                    </AlphaButton>
                </div>

                <AlphaGrid>
                    {games.map((game) => (
                        <GameCard key={game.id} game={game} />
                    ))}

                    {games.length === 0 && !loading && (
                        <div className="col-span-full py-20 text-center opacity-50">
                            <ChartBarIcon className="mx-auto mb-4 h-16 w-16 text-gray-600" />
                            <p className="text-xl font-bold text-gray-400">
                                Aucune activité détectée
                            </p>
                            <p className="text-sm text-gray-600">
                                Le système est en attente de connexions.
                            </p>
                        </div>
                    )}
                </AlphaGrid>
            </div>
        </>
    );
}

const GameCard = ({ game }: { game: RawGameData }) => {
    const router = useRouter();

    let gameState: ParsedGameState = { step: 0 };
    try {
        gameState = JSON.parse(game.state);
    } catch (e) {
        console.error('Erreur parsing state pour', game.code, e);
    }

    const playerCount = gameState.players?.length || 0;
    const lastActive = new Date(game.updated_at);
    const now = new Date();
    const minutesSinceUpdate = Math.floor((now.getTime() - lastActive.getTime()) / 60000);

    const isActive = minutesSinceUpdate < 2;
    const isStale = minutesSinceUpdate > 30;

    return (
        <AlphaCard
            progress={Math.min((gameState.step / 8) * 100, 100)}
            title={`ID: ${game.id} • lvl cleared : ${gameState.history?.length || 0}`}
            contentClassName={'space-y-4 mb-4'}
            className={`border transition-transform duration-300 hover:-translate-y-1 ${isActive ? 'border-brand-emerald/50 shadow-[0_0_8px_var(--color-brand-emerald)]' : isStale ? 'border-brand-error/50 opacity-80' : 'border-border'} `}
        >
            <div className="mb-4 flex items-start justify-between">
                <div>
                    <h3 className="font-mono text-3xl font-black">{game.code}</h3>
                    <div className="flex items-center gap-2 text-[10px] tracking-wider text-gray-500 uppercase">
                        <span>ID: {game.id}</span>
                        <span>•</span>
                        <span>lvl {gameState.history?.length || 0}</span>
                    </div>
                </div>

                {isActive ? (
                    <AlphaFeedbackPill type="success" message="LIVE" pulse />
                ) : (
                    <AlphaFeedbackPill type={'error'} message={`${minutesSinceUpdate}min ago`} />
                )}
            </div>

            {/* Infos Clés */}
            <div className="space-y-4">
                {/* Progression */}
                <AlphaInfoRow label={'Progression'} value={`Étape ${gameState.step}`} />
                <AlphaInfoRow
                    label={
                        <div className="text-muted flex items-center gap-2">
                            <UsersIcon className="h-4 w-4" />
                            <span className="font-bold">{playerCount}</span>
                            <span className="text-xs uppercase">Agents</span>
                        </div>
                    }
                    value={
                        <div className="flex -space-x-2">
                            {gameState.players?.slice(0, 4).map((p) => (
                                <div
                                    key={p.id}
                                    className="bg-brand-blue ring-border h-4 w-4 rounded-full ring-2"
                                    title={p.name}
                                />
                            ))}
                            {(gameState.players?.length || 0) > 4 && (
                                <div className="bg-muted ring-border h-4 w-4 rounded-full ring-2" />
                            )}
                        </div>
                    }
                />

                {/* Message Debug */}
                <div className="h-8 overflow-hidden">
                    <p className="text-muted truncate font-mono text-[10px]">
                        &gt; {gameState.message || 'Système stable...'}
                    </p>
                </div>
            </div>

            <div className={'flex flex-wrap justify-center gap-4'}>
                <AlphaButton
                    onClick={() => router.push(`/mc-admin/game?code=${game.code}`)}
                    variant="primary"
                >
                    <EyeIcon className="mr-2 h-4 w-4" />
                    ESPIONNER
                </AlphaButton>

                <AlphaButton
                    variant={'secondary'}
                    onClick={() =>
                        alert(
                            `Stats ID: ${game.id}\nCreated: ${new Date(game.created_at).toLocaleString()}`
                        )
                    }
                >
                    <ChartBarIcon className="mr-2 h-4 w-4" />
                    DÉTAILS
                </AlphaButton>
            </div>
        </AlphaCard>
    );
};
