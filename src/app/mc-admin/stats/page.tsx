'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';

import { useRouter } from 'next/navigation';

import {
    ArrowLeftIcon,
    ChartBarIcon,
    ExclamationCircleIcon,
    FireIcon,
    TrophyIcon,
    UserGroupIcon,
} from '@heroicons/react/24/solid';
import clsx from 'clsx';

import { AlphaButton } from '@/components/alpha/AlphaButton';
import { AlphaCard } from '@/components/alpha/AlphaCard';
import { AlphaGrid } from '@/components/alpha/AlphaGrid';
import { AlphaHeader } from '@/components/alpha/AlphaHeader';
import { SCENARIO } from '@/data/alphaScenario';
import { GameState } from '@/types/game';

// ============================================================================
// TYPES & HELPERS
// ============================================================================

interface RawGameData {
    id: number;
    code: string;
    state: string;
    created_at: string;
    updated_at: string;
}

const formatDuration = (ms: number) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}m ${seconds}s`;
};

// ============================================================================
// COMPOSANT PRINCIPAL
// ============================================================================

export default function AnalyticsPage() {
    const router = useRouter();
    const [games, setGames] = useState<RawGameData[]>([]);
    const [loading, setLoading] = useState(true);

    const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

    const fetchGames = useCallback(async () => {
        try {
            setLoading(true);
            const res = await fetch(`${API_BASE}/game/list`);
            const json = await res.json();
            if (json.status) {
                setGames(json.data);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, [API_BASE]);

    useEffect(() => {
        fetchGames();
    }, [fetchGames]);

    // --- MOTEUR D'ANALYSE ---
    const stats = useMemo(() => {
        const now = Date.now();
        let totalGames = 0;
        let victories = 0;
        let defeats = 0;
        let abandons = 0;
        let totalPlayTime = 0; // Uniquement pour les parties finies
        let totalPlayers = 0;

        // Stats par étape
        const stepStats: Record<
            number,
            {
                totalTime: number;
                count: number;
                drops: number; // Combien ont arrêté ici
            }
        > = {};

        // Init step stats
        SCENARIO.steps.forEach((_, idx) => {
            stepStats[idx + 1] = { totalTime: 0, count: 0, drops: 0 };
        });

        games.forEach((game) => {
            let state: GameState;
            try {
                state = JSON.parse(game.state);
            } catch {
                return;
            }

            // Ignorer les parties vides/tests (< 1 min ou pas de joueurs)
            if (!state.players || state.players.length === 0) return;
            const startTime = state.startTime || new Date(game.created_at).getTime();
            const lastUpdate = new Date(game.updated_at).getTime();
            const duration = lastUpdate - startTime;

            if (duration < 60000 && state.step <= 1) return; // Partie test ignorer

            totalGames++;
            totalPlayers += state.players.length;

            // --- DETERMINATION DU RESULTAT ---
            const maxDuration =
                SCENARIO.defaultDuration * 1000 + (state.bonusTime || 0) * 60 * 1000;
            const isWin = state.step > SCENARIO.steps.length;

            // Une partie est considérée abandonnée si pas finie, pas timeout, et inactive depuis > 30min
            const isInactive = now - lastUpdate > 30 * 60 * 1000;
            const isLoss = !isWin && duration > maxDuration;
            const isAbandon = !isWin && !isLoss && isInactive;

            // Partie en cours (récente et pas finie) -> on ne la compte pas dans les stats finales
            if (!isWin && !isLoss && !isAbandon) return;

            if (isWin) {
                victories++;
                totalPlayTime += duration;
            } else if (isLoss) {
                defeats++;
            } else {
                abandons++;
                // On note où ils ont abandonné
                if (stepStats[state.step]) {
                    stepStats[state.step].drops++;
                }
            }

            // --- ANALYSE DE L'HISTORIQUE (Temps par puzzle) ---
            if (state.history) {
                state.history.forEach((entry) => {
                    const stepNum = entry.step;
                    if (stepStats[stepNum]) {
                        stepStats[stepNum].totalTime += entry.duration; // duration est en secondes dans history
                        stepStats[stepNum].count++;
                    }
                });
            }
        });

        // --- CALCULS FINAUX ---
        const avgTime = victories > 0 ? totalPlayTime / victories : 0;
        const winRate = totalGames > 0 ? (victories / totalGames) * 100 : 0;

        // Trouver le puzzle le plus dur (Temps moyen le plus élevé vs "Drop rate")
        let hardestStep = { id: 0, avg: 0, drops: 0 };

        Object.entries(stepStats).forEach(([stepId, data]) => {
            const avg = data.count > 0 ? data.totalTime / data.count : 0;
            // Un score arbitraire de difficulté : Temps moyen + (Nombre d'abandons * 60s de pénalité)
            const difficultyScore = avg + data.drops * 60;

            if (difficultyScore > hardestStep.avg + hardestStep.drops * 60) {
                hardestStep = { id: parseInt(stepId), avg, drops: data.drops };
            }
        });

        return {
            totalGames,
            totalPlayers,
            victories,
            defeats,
            abandons,
            avgTime,
            winRate,
            stepStats,
            hardestStep,
        };
    }, [games]);

    if (loading)
        return (
            <div className="text-brand-emerald flex h-screen animate-pulse items-center justify-center">
                ANALYSE DES DONNÉES...
            </div>
        );

    return (
        <div className="min-h-screen pb-20">
            <AlphaHeader
                title="CENTRE D'ANALYSE"
                subtitle="STATISTIQUES & PERFORMANCES DES AGENTS"
            />

            <div className="container mx-auto px-4 pt-8">
                {/* BACK BUTTON */}
                <div className="mb-8">
                    <AlphaButton variant="ghost" onClick={() => router.push('/mc-admin')}>
                        <ArrowLeftIcon className="mr-2 h-4 w-4" /> Retour Dashboard
                    </AlphaButton>
                </div>

                <AlphaGrid>
                    {/* --- KPI PRINCIPAUX --- */}
                    <AlphaCard
                        title="Performance Globale"
                        icon={TrophyIcon}
                        className="col-span-1 md:col-span-2"
                    >
                        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                            <StatBox
                                label="Sessions Terminées"
                                value={stats.totalGames}
                                sub="Exclut les tests"
                            />
                            <StatBox
                                label="Taux de Réussite"
                                value={`${stats.winRate.toFixed(1)}%`}
                                color={
                                    stats.winRate > 50 ? 'text-brand-emerald' : 'text-brand-error'
                                }
                            />
                            <StatBox
                                label="Temps Moyen (Victoire)"
                                value={formatDuration(stats.avgTime)}
                            />
                            <StatBox
                                label="Total Agents"
                                value={stats.totalPlayers}
                                icon={<UserGroupIcon className="h-4 w-4" />}
                            />
                        </div>

                        {/* BARRE DE REPARTITION */}
                        <div className="mt-8">
                            <div className="text-muted mb-2 flex justify-between text-xs font-bold uppercase">
                                <span>Répartition des issues</span>
                                <span>{stats.totalGames} parties</span>
                            </div>
                            <div className="bg-surface-highlight flex h-4 w-full overflow-hidden rounded-full">
                                <div
                                    style={{
                                        width: `${(stats.victories / stats.totalGames) * 100}%`,
                                    }}
                                    className="bg-brand-emerald h-full transition-all"
                                    title="Victoires"
                                />
                                <div
                                    style={{
                                        width: `${(stats.defeats / stats.totalGames) * 100}%`,
                                    }}
                                    className="bg-brand-error h-full transition-all"
                                    title="Défaites (Temps)"
                                />
                                <div
                                    style={{
                                        width: `${(stats.abandons / stats.totalGames) * 100}%`,
                                    }}
                                    className="h-full bg-gray-600 transition-all"
                                    title="Abandons"
                                />
                            </div>
                            <div className="mt-2 flex justify-center gap-4">
                                <LegendItem
                                    color="bg-brand-emerald"
                                    label={`Victoires (${stats.victories})`}
                                />
                                <LegendItem
                                    color="bg-brand-error"
                                    label={`Timeout (${stats.defeats})`}
                                />
                                <LegendItem
                                    color="bg-gray-600"
                                    label={`Abandons (${stats.abandons})`}
                                />
                            </div>
                        </div>
                    </AlphaCard>

                    {/* --- POINT DE FRICTION --- */}
                    <AlphaCard
                        title="Point de Friction Majeur"
                        icon={ExclamationCircleIcon}
                        className="border-brand-error/30"
                    >
                        <div className="flex h-full flex-col items-center justify-center py-4 text-center">
                            <div className="bg-brand-error/10 mb-4 rounded-full p-4">
                                <FireIcon className="text-brand-error h-10 w-10 animate-pulse" />
                            </div>
                            <h3 className="mb-1 text-xl font-black text-white">
                                ÉTAPE {stats.hardestStep.id}
                            </h3>
                            <p className="text-brand-error mb-4 text-sm font-bold tracking-widest uppercase">
                                {SCENARIO.steps[stats.hardestStep.id - 1]?.title || 'Inconnue'}
                            </p>

                            <div className="bg-surface-highlight w-full space-y-2 rounded-lg p-4">
                                <div className="flex justify-between text-xs">
                                    <span className="text-muted">Abandons à cette étape</span>
                                    <span className="font-bold text-white">
                                        {stats.hardestStep.drops} équipes
                                    </span>
                                </div>
                                <div className="flex justify-between text-xs">
                                    <span className="text-muted">Temps Moyen de résolution</span>
                                    <span className="text-brand-yellow font-bold">
                                        {formatDuration(stats.hardestStep.avg * 1000)}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </AlphaCard>

                    {/* --- DETAILS PAR PUZZLE (Full Width) --- */}
                    <div className="col-span-1 md:col-span-3">
                        <AlphaCard title="Analyse Détaillée par Puzzle" icon={ChartBarIcon}>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm">
                                    <thead>
                                        <tr className="text-muted border-b border-white/10 text-xs tracking-wider uppercase">
                                            <th className="py-3 pl-2">Étape</th>
                                            <th className="py-3">Nom du Module</th>
                                            <th className="py-3 text-center">Temps Moyen</th>
                                            <th className="py-3 text-center">Écart vs Standard</th>
                                            <th className="py-3 pr-2 text-right">Taux d'Abandon</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/5">
                                        {SCENARIO.steps.map((step, idx) => {
                                            const stepId = idx + 1;
                                            const data = stats.stepStats[stepId];
                                            const avgSec =
                                                data.count > 0 ? data.totalTime / data.count : 0;
                                            // Estimation: on imagine que chaque étape devrait prendre ~5min (300s) pour l'exemple
                                            // Vous pourriez ajouter un champ "expectedDuration" dans votre SCENARIO data
                                            const standard = 300;
                                            const diff = avgSec - standard;
                                            const dropRate =
                                                stats.totalGames > 0
                                                    ? (data.drops / stats.totalGames) * 100
                                                    : 0;

                                            return (
                                                <tr
                                                    key={stepId}
                                                    className="transition-colors hover:bg-white/5"
                                                >
                                                    <td className="text-brand-emerald py-3 pl-2 font-mono font-bold">
                                                        #{stepId}
                                                    </td>
                                                    <td className="py-3 font-bold text-white">
                                                        {step.title}
                                                    </td>
                                                    <td className="py-3 text-center font-mono">
                                                        {avgSec > 0
                                                            ? formatDuration(avgSec * 1000)
                                                            : '-'}
                                                    </td>
                                                    <td className="py-3 text-center">
                                                        {avgSec > 0 ? (
                                                            <span
                                                                className={clsx(
                                                                    'rounded px-2 py-0.5 text-[10px] font-bold',
                                                                    diff > 60
                                                                        ? 'bg-brand-error/20 text-brand-error'
                                                                        : diff < -60
                                                                          ? 'bg-brand-emerald/20 text-brand-emerald'
                                                                          : 'text-muted bg-white/10'
                                                                )}
                                                            >
                                                                {diff > 0 ? '+' : ''}
                                                                {Math.round(diff)}s
                                                            </span>
                                                        ) : (
                                                            '-'
                                                        )}
                                                    </td>
                                                    <td className="py-3 pr-2 text-right">
                                                        {data.drops > 0 ? (
                                                            <div className="flex items-center justify-end gap-2">
                                                                <div className="bg-surface-highlight h-1.5 w-16 overflow-hidden rounded-full">
                                                                    <div
                                                                        style={{
                                                                            width: `${Math.min(dropRate, 100)}%`,
                                                                        }}
                                                                        className="bg-brand-error h-full"
                                                                    />
                                                                </div>
                                                                <span className="text-brand-error font-bold">
                                                                    {data.drops}
                                                                </span>
                                                            </div>
                                                        ) : (
                                                            <span className="text-muted opacity-30">
                                                                -
                                                            </span>
                                                        )}
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </AlphaCard>
                    </div>
                </AlphaGrid>
            </div>
        </div>
    );
}

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

const StatBox = ({
    label,
    value,
    sub,
    color = 'text-white',
    icon,
}: {
    label: string;
    value: string | number;
    sub?: string;
    color?: string;
    icon?: React.ReactNode;
}) => (
    <div className="bg-surface-highlight flex flex-col items-center justify-center rounded-lg border border-white/5 p-4 text-center transition-all hover:border-white/20">
        <div className="text-muted mb-1 flex items-center gap-1 text-[10px] font-bold tracking-widest uppercase">
            {icon} {label}
        </div>
        <div className={clsx('text-2xl font-black', color)}>{value}</div>
        {sub && <div className="mt-1 text-[10px] text-gray-500">{sub}</div>}
    </div>
);

const LegendItem = ({ color, label }: { color: string; label: string }) => (
    <div className="text-muted flex items-center gap-2 text-xs">
        <div className={`h-2 w-2 rounded-full ${color}`} />
        <span>{label}</span>
    </div>
);
