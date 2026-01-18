'use client';

import React, { useCallback, useEffect, useState } from 'react';

import { useRouter } from 'next/navigation';

import {
    ArrowPathIcon,
    ChartBarIcon,
    ClockIcon,
    EyeIcon,
    MagnifyingGlassIcon,
    // Import ajouté
    TrashIcon,
    UsersIcon,
} from '@heroicons/react/24/solid';
import clsx from 'clsx';

import { AlphaButton } from '@/components/alpha/AlphaButton';
import { AlphaCard } from '@/components/alpha/AlphaCard';
import AlphaFeedbackPill from '@/components/alpha/AlphaFeedbackPill';
import { AlphaGrid } from '@/components/alpha/AlphaGrid';
import { AlphaHeader } from '@/components/alpha/AlphaHeader';
import { AlphaInfoRow } from '@/components/alpha/AlphaInfoRow';
import { SCENARIO } from '@/data/alphaScenario';

interface RawGameData {
    id: number;
    code: string;
    state: string; // JSON Stringified
    created_at: string;
    updated_at: string;
}

interface ParsedGameState {
    step: number;
    message?: string;
    players?: { id: string; name: string; isGM?: boolean }[];
    history?: { step: number; solverName: string; solvedAt: number; duration: number }[];
    lastUpdate?: number;
    startTime?: number;
    bonusTime?: number; // en minutes
}

export default function AdminDashboard() {
    const [games, setGames] = useState<RawGameData[]>([]);
    const [loading, setLoading] = useState(false);
    const [lastRefresh, setLastRefresh] = useState<Date | null>(null);

    const [searchTerm, setSearchTerm] = useState('');

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

    const deleteGame = async (id: number) => {
        if (!confirm(`Voulez-vous vraiment supprimer définitivement la session #${id} ?`)) return;

        try {
            setLoading(true);
            const res = await fetch(`${API_BASE}/game/${id}`, {
                method: 'DELETE',
            });

            if (res.ok) {
                await fetchGames();
            } else {
                alert('Erreur lors de la suppression de la partie.');
            }
        } catch (err) {
            console.error('Erreur delete:', err);
            alert('Impossible de contacter le serveur.');
        } finally {
            setLoading(false);
        }
    };

    // polling automatique
    useEffect(() => {
        fetchGames();
        const interval = setInterval(fetchGames, 10000);
        return () => clearInterval(interval);
    }, [fetchGames]);

    // filtrage
    const filteredGames = games.filter((game) => {
        const term = searchTerm.toLowerCase();
        return (
            game.code.toLowerCase().includes(term) || // par code (ABCD)
            game.id.toString().includes(term) // par ID (123)
        );
    });

    return (
        <>
            <AlphaHeader
                title="GOD MODE"
                subtitle={`${games.length} SESSIONS EN BASE DE DONNÉES`}
            />

            <div className="container mx-auto px-4 pt-8 pb-20">
                {/* toolbar */}
                <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    {/* info et refresh */}
                    <div className="flex items-center justify-between gap-4 lg:justify-start">
                        <div className="flex items-center gap-2">
                            <ClockIcon className="text-brand-blue h-6 w-6 lg:h-8 lg:w-8" />
                            <AlphaFeedbackPill
                                message={`MAJ: ${lastRefresh?.toLocaleTimeString() || '--:--:--'}`}
                            />
                        </div>
                        <AlphaButton onClick={() => fetchGames()} variant={'secondary'} size="sm">
                            <ArrowPathIcon
                                className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`}
                            />
                            RAFRAÎCHIR
                        </AlphaButton>
                    </div>

                    {/* Zone Recherche (Ajoutée) */}
                    <div className="relative w-full max-w-md">
                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                            <MagnifyingGlassIcon
                                className="text-muted h-5 w-5"
                                aria-hidden="true"
                            />
                        </div>
                        <input
                            type="text"
                            className="bg-surface border-border focus:border-brand-emerald focus:ring-brand-emerald placeholder-muted block w-full rounded-lg border p-2.5 pl-10 text-sm transition-all outline-none"
                            placeholder="Rechercher une session (Code, ID...)"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <AlphaGrid>
                    {filteredGames.map((game) => (
                        <GameCard key={game.id} game={game} onDelete={() => deleteGame(game.id)} />
                    ))}

                    {filteredGames.length === 0 && !loading && (
                        <div className="col-span-full py-20 text-center opacity-50">
                            <ChartBarIcon className="text-muted mx-auto mb-4 h-16 w-16" />
                            <p className="text-muted text-xl font-bold">
                                {games.length === 0
                                    ? 'Aucune activité détectée'
                                    : 'Aucun résultat pour cette recherche'}
                            </p>
                            <p className="text-muted text-sm">
                                {games.length === 0
                                    ? 'Le système est en attente de connexions.'
                                    : 'Essayez un autre code ou ID.'}
                            </p>
                        </div>
                    )}
                </AlphaGrid>
            </div>
        </>
    );
}

const GameCard = ({ game, onDelete }: { game: RawGameData; onDelete: () => void }) => {
    const router = useRouter();

    let gameState: ParsedGameState = { step: 0 };
    try {
        gameState = JSON.parse(game.state);
    } catch (e) {
        console.error('Erreur parsing state pour', game.code, e);
    }

    const now = new Date();
    const lastActive = new Date(game.updated_at);
    const minutesSinceUpdate = Math.floor((now.getTime() - lastActive.getTime()) / 60000);

    const playerCount = gameState.players?.length || 0;
    const startTime = gameState.startTime || new Date(game.created_at).getTime();

    const totalDurationMs =
        SCENARIO.defaultDuration * 1000 + (gameState.bonusTime || 0) * 60 * 1000;
    const elapsedMs = now.getTime() - startTime;

    const isEmpty = playerCount === 0;
    const isVictory =
        gameState.step > SCENARIO.steps.length ||
        (gameState.history && gameState.history.length >= SCENARIO.steps.length);
    const isDefeat = !isVictory && elapsedMs > totalDurationMs;

    const isActive = minutesSinceUpdate < 2 && !isEmpty && !isVictory && !isDefeat;
    const isStale = minutesSinceUpdate > 20;

    let statusColor = 'border-border';
    let statusMessage = `${minutesSinceUpdate}min ago`;
    let statusType: 'info' | 'success' | 'error' | 'warning' = 'info';

    if (isActive) {
        statusColor = 'border-brand-yellow shadow-[0_0_8px_var(--color-brand-yellow)]';
        statusMessage = 'EN LIGNE';
        statusType = 'success';
    } else if (isVictory) {
        statusColor = 'border-brand-emerald bg-brand-emerald/5';
        statusMessage = 'VICTOIRE';
        statusType = 'warning';
    } else if (isDefeat) {
        statusColor = 'border-brand-error/50 bg-brand-error/5';
        statusMessage = 'DÉFAITE (Temps)';
        statusType = 'error';
    } else if (isEmpty) {
        statusColor = 'border-muted opacity-60';
        statusMessage = 'VIDE / ABANDON';
        statusType = 'info';
    } else if (isStale) {
        statusColor = 'border-brand-purple/30 opacity-70';
        statusMessage = 'INACTIF';
        statusType = 'info';
    }

    return (
        <AlphaCard
            progress={Math.min((gameState.step / SCENARIO.steps.length) * 100, 100)}
            title={`SESSION #${game.id}`}
            contentClassName={'space-y-4 mb-4'}
            className={clsx(
                'group relative border transition-all duration-300 hover:-translate-y-1',
                statusColor
            )}
        >
            <div className="mb-4 flex items-start justify-between">
                <div>
                    <h3 className="font-mono text-3xl font-black">{game.code}</h3>
                    <div className="text-muted flex items-center gap-2 text-xs uppercase">
                        <span>{new Date(game.created_at).toLocaleDateString()}</span>
                        <span>•</span>
                        <span>
                            {new Date(game.created_at).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit',
                            })}
                        </span>
                    </div>
                </div>

                <div className="flex flex-col items-end gap-1">
                    <AlphaFeedbackPill type={statusType} message={statusMessage} pulse={isActive} />
                    {isDefeat && (
                        <span className="text-brand-error text-xs font-bold">TIMEOUT</span>
                    )}
                </div>
            </div>

            <div className="space-y-4">
                <AlphaInfoRow
                    label={'Niveau'}
                    value={
                        <div className="flex items-center gap-2">
                            <span
                                className={
                                    isVictory ? 'text-brand-yellow font-black' : 'text-foreground'
                                }
                            >
                                {gameState.step} / {SCENARIO.steps.length}
                            </span>
                        </div>
                    }
                />

                <AlphaInfoRow
                    label={
                        <div className="text-muted flex items-center gap-2">
                            <UsersIcon className="h-4 w-4" />
                            <span className="font-bold">{playerCount}</span>
                        </div>
                    }
                    value={
                        <div className="flex -space-x-2">
                            {gameState.players?.slice(0, 5).map((p) => (
                                <div
                                    key={p.id}
                                    className={clsx(
                                        'ring-surface flex h-5 w-5 items-center justify-center rounded-full text-xs font-bold ring-2',
                                        p.isGM ? 'bg-brand-purple z-10' : 'bg-brand-blue'
                                    )}
                                    title={p.name}
                                >
                                    {p.name.charAt(0).toUpperCase()}
                                </div>
                            ))}
                            {(gameState.players?.length || 0) > 5 && (
                                <div className="bg-muted ring-surface flex h-5 w-5 items-center justify-center rounded-full text-xs font-bold ring-2">
                                    +
                                </div>
                            )}
                        </div>
                    }
                />

                <div className="h-10 overflow-hidden rounded bg-black/20 px-2 py-1">
                    <p className="text-muted truncate font-mono text-xs leading-tight opacity-70">
                        &gt; {gameState.message || 'Système en attente...'}
                    </p>
                    {gameState.bonusTime !== 0 && gameState.bonusTime !== undefined && (
                        <p
                            className={clsx(
                                'text-[9px] font-bold',
                                (gameState.bonusTime || 0) > 0
                                    ? 'text-brand-emerald'
                                    : 'text-brand-error'
                            )}
                        >
                            &gt; TEMPS: {(gameState.bonusTime || 0) > 0 ? '+' : ''}
                            {gameState.bonusTime} min
                        </p>
                    )}
                </div>
            </div>

            <div
                className={
                    'border-border mt-4 flex flex-wrap items-center justify-between gap-2 border-t pt-4'
                }
            >
                <AlphaButton
                    onClick={() => router.push(`/mc-admin/game?code=${game.code}`)}
                    variant="primary"
                    className={'flex-1'}
                >
                    <EyeIcon className="mr-2 h-3 w-3" />
                    ESPIONNER
                </AlphaButton>

                <AlphaButton
                    onClick={(e) => {
                        e.stopPropagation();
                        onDelete();
                    }}
                    variant={'danger'}
                    className={'!p-2'}
                    title="Supprimer définitivement"
                >
                    <TrashIcon className="h-4 w-4" />
                </AlphaButton>
            </div>
        </AlphaCard>
    );
};
