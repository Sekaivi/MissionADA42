import React, { useState } from 'react';

import {
    BoltIcon,
    CheckCircleIcon,
    StarIcon,
    TrophyIcon,
    XCircleIcon,
} from '@heroicons/react/24/solid';

import { GameState, HistoryEntry } from '@/types/game';
import { PuzzleComponentId } from '@/types/scenario';

export interface PuzzleProps {
    onSolve: () => void;
    isSolved?: boolean;
    data?: GameState;
}

const formatDuration = (ms: number) => {
    if (!ms || ms < 0) return '0m 0s';
    const totalSeconds = Math.floor(ms / 1000);
    const m = Math.floor(totalSeconds / 60);
    const s = totalSeconds % 60;
    return `${m}m ${s}s`;
};

// --- PUZZLE 1 ---
const TutorialCodePuzzle: React.FC<PuzzleProps> = ({ onSolve, isSolved }) => {
    const [input, setInput] = useState('');
    const [error, setError] = useState(false);
    const checkCode = () => {
        if (input === '1234') onSolve();
        else {
            setError(true);
            setTimeout(() => setError(false), 1000);
        }
    };
    if (isSolved)
        return (
            <div className="rounded-xl border border-green-500 bg-green-900/20 p-6 text-center">
                <CheckCircleIcon className="mx-auto mb-4 h-16 w-16 text-green-500" />
                <h2 className="text-xl font-bold text-green-400">ACCÈS AUTORISÉ</h2>
            </div>
        );
    return (
        <div className="border-brand-blue rounded-xl border bg-blue-900/20 p-6 text-center">
            <h2 className="text-brand-blue mb-4 text-xl font-bold">PUZZLE 1 : Calibration</h2>
            <p className="mb-4 text-sm text-gray-300">Entrez le code de sécurité (Indice: 1234)</p>
            <div className="mx-auto flex max-w-xs justify-center gap-2">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    className={`border bg-black/50 ${error ? 'animate-shake border-red-500' : 'border-brand-blue'} w-full rounded px-4 py-2 text-center tracking-widest text-white transition-colors outline-none`}
                    placeholder="____"
                    maxLength={4}
                />
                <button
                    onClick={checkCode}
                    className="bg-brand-blue rounded px-4 py-2 font-bold text-white hover:bg-blue-500"
                >
                    OK
                </button>
            </div>
            {error && <p className="mt-2 text-xs font-bold text-red-500">CODE INCORRECT</p>}
        </div>
    );
};

// --- PUZZLE 2 ---
const LogicCircuitPuzzle: React.FC<PuzzleProps> = ({ onSolve, isSolved }) => {
    const [charging, setCharging] = useState(false);
    const handleConnect = () => {
        setCharging(true);
        setTimeout(() => {
            setCharging(false);
            onSolve();
        }, 1500);
    };
    if (isSolved)
        return (
            <div className="rounded-xl border border-green-500 bg-green-900/20 p-6 text-center">
                <h2 className="text-xl font-bold text-green-400">SYSTÈME STABILISÉ</h2>
            </div>
        );
    return (
        <div className="border-brand-purple rounded-xl border bg-purple-900/20 p-6 text-center">
            <h2 className="text-brand-purple mb-4 text-xl font-bold">PUZZLE 2 : Surcharge</h2>
            <p className="mb-6 text-sm">Le noyau est instable. Redirigez l'énergie manuellement.</p>
            <button
                onClick={handleConnect}
                disabled={charging}
                className={`relative w-full overflow-hidden rounded-lg py-4 font-bold transition-all ${charging ? 'cursor-wait bg-purple-900 text-purple-300' : 'bg-brand-purple text-white hover:bg-purple-500'}`}
            >
                <div className="relative z-10 flex items-center justify-center gap-2">
                    <BoltIcon className={`h-5 w-5 ${charging ? 'animate-pulse' : ''}`} />
                    {charging ? 'REDIRECTION EN COURS...' : 'REDIRIGER LE FLUX'}
                </div>
                <div
                    className={`absolute top-0 left-0 h-full bg-white/20 transition-all duration-[1500ms] ease-out ${charging ? 'w-full' : 'w-0'}`}
                />
            </button>
        </div>
    );
};

// --- VICTOIRE (MVP Absolu) ---
const VictoryScreen: React.FC<PuzzleProps> = ({ data }) => {
    const history: HistoryEntry[] = data?.history || [];

    let start = Number(data?.startTime);
    if (start < 100000000000) start *= 1000;

    let end = Number(data?.lastUpdate);
    if (end < 100000000000) end *= 1000;

    const totalDuration = end > start ? end - start : 0;

    const solverCounts: Record<string, number> = {};
    history.forEach((h) => {
        if (!h.solverName.includes('ADMIN (Skip)')) {
            solverCounts[h.solverName] = (solverCounts[h.solverName] || 0) + 1;
        }
    });

    let mvpName: string | null = null;
    let maxSolves = 0;
    let isTie = false;

    Object.entries(solverCounts).forEach(([name, count]) => {
        if (count > maxSolves) {
            maxSolves = count;
            mvpName = name;
            isTie = false;
        } else if (count === maxSolves && maxSolves > 0) {
            isTie = true;
        }
    });

    if (isTie) mvpName = null;

    return (
        <div className="animate-in zoom-in p-8 text-center duration-500">
            <TrophyIcon className="mx-auto mb-4 h-24 w-24 animate-bounce text-yellow-400" />
            <h1 className="text-brand-emerald mb-2 text-4xl font-black">MISSION ACCOMPLIE</h1>
            <p className="mb-8 text-gray-300">Le système est sécurisé.</p>

            <div className="bg-surface border-border relative mx-auto max-w-md overflow-hidden rounded-xl border p-6 text-left">
                {mvpName && (
                    <div className="absolute top-0 right-0 flex flex-col items-center rounded-bl-xl border-b border-l border-yellow-500/50 bg-yellow-500/20 p-2 shadow-[0_0_15px_rgba(234,179,8,0.3)]">
                        <span className="text-[10px] font-bold tracking-widest text-yellow-500 uppercase">
                            MVP
                        </span>
                        <div className="flex items-center gap-1 text-sm font-bold text-yellow-400">
                            <StarIcon className="h-4 w-4" />
                            {mvpName}
                        </div>
                    </div>
                )}

                <h3 className="text-muted border-border mb-4 border-b pb-2 text-xs font-bold uppercase">
                    Rapport de Mission
                </h3>

                <div className="mb-6 flex items-center justify-between">
                    <span className="text-sm font-bold">Temps de mission</span>
                    <span className="text-brand-blue font-mono text-2xl font-black">
                        {formatDuration(totalDuration)}
                    </span>
                </div>

                <div className="custom-scrollbar max-h-40 space-y-3 overflow-y-auto pr-2">
                    {history.map((entry, idx) => (
                        <div key={idx} className="flex items-center justify-between text-xs">
                            <div className="flex items-center gap-2">
                                <span className="bg-brand-purple/20 text-brand-purple rounded px-2 py-1 font-bold">
                                    #{entry.step}
                                </span>
                                <span className="font-medium text-gray-400">
                                    {entry.solverName}
                                </span>
                            </div>
                            <span className="font-mono text-white opacity-70">
                                {formatDuration(entry.duration * 1000)}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

// --- DÉFAITE ---
export const DefeatScreen = () => (
    <div className="animate-in fade-in rounded-xl border border-red-900 bg-red-950/30 p-10 text-center duration-1000">
        <XCircleIcon className="mx-auto mb-4 h-24 w-24 text-red-600" />
        <h1 className="mb-2 text-4xl font-black text-red-500">ÉCHEC MISSION</h1>
        <p className="text-lg text-red-300">Temps imparti écoulé. Le système a été compromis.</p>
    </div>
);

export const PUZZLE_COMPONENTS: Record<PuzzleComponentId, React.FC<PuzzleProps>> = {
    'tutorial-code': TutorialCodePuzzle,
    'logic-circuit': LogicCircuitPuzzle,
    'victory-screen': VictoryScreen,
};
