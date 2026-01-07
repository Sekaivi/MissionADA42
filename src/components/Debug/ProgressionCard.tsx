'use client';
import React from 'react';

import Card from '@/components/ui/Card';

import PuzzleInput from './PuzzleInput';

interface ProgressionCardProps {
    inputValue: string;
    onInputChange: (val: string) => void;
    onVerify: () => void;
    onHelp: () => void;
    hintsUsed: number; // 0, 1, 2 ou 3
}

export default function ProgressionCard({
    inputValue,
    onInputChange,
    onVerify,
    onHelp,
    hintsUsed,
}: ProgressionCardProps) {
    return (
        <Card className="w-full max-w-xl border border-green-600/50 bg-[#042b04] shadow-lg transition-all duration-500 hover:shadow-green-900/50">
            <div className="mb-6 flex items-center justify-between border-b border-green-800 pb-2 text-green-400">
                <span className="font-bold tracking-widest uppercase">SÉCURITÉ DU SYSTÈME</span>
                <span className="animate-pulse rounded border border-red-800 bg-red-900/50 px-3 py-1 text-xs font-bold text-red-400">
                    CRITIQUE
                </span>
            </div>

            <p className="mb-6 text-sm text-green-300">
                Le virus a verrouillé le noyau. Entrez la <strong>Clé Finale</strong> pour déployer
                l'antivirus et sauver le système.
            </p>

            {/* L'Input Unique */}
            <PuzzleInput
                label="CLÉ D'ACTIVATION ANTIVIRUS"
                placeholder="Entrez le code maître..."
                value={inputValue}
                onChange={onInputChange}
                onSubmit={onVerify}
                status="active" // Toujours actif
            />

            {/* Zone d'aide (Profs) */}
            <div className="mt-6 flex flex-col items-center gap-2">
                <div className="mb-2 flex gap-1">
                    {/* Indicateurs visuels des aides restantes */}
                    {[0, 1, 2].map((i) => (
                        <div
                            key={i}
                            className={`h-2 w-8 rounded-full transition-colors ${
                                i < hintsUsed
                                    ? 'bg-gray-800'
                                    : 'bg-purple-500 shadow-[0_0_5px_purple]'
                            }`}
                        />
                    ))}
                </div>

                <button
                    onClick={onHelp}
                    disabled={hintsUsed >= 3}
                    className={`rounded-lg border px-4 py-2 text-xs font-bold tracking-wider uppercase transition-all ${
                        hintsUsed >= 3
                            ? 'cursor-not-allowed border-gray-800 bg-transparent text-gray-600'
                            : 'border-purple-500/50 text-purple-400 hover:border-purple-400 hover:bg-purple-900/30 hover:text-purple-200'
                    }`}
                >
                    {hintsUsed >= 3
                        ? '🚫 Connexion perdue avec le corps enseignant'
                        : `📞 Appeler un professeur (${3 - hintsUsed} restants)`}
                </button>
            </div>
        </Card>
    );
}
