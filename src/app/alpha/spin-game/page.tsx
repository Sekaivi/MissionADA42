'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import { ArrowPathIcon, CheckCircleIcon } from '@heroicons/react/24/solid';

import { AlphaButton } from '@/components/alpha/AlphaButton';
import { AlphaCard } from '@/components/alpha/AlphaCard';
import { AlphaError } from '@/components/alpha/AlphaError';
import { AlphaGrid } from '@/components/alpha/AlphaGrid';
import { AlphaHeader } from '@/components/alpha/AlphaHeader';
import { useOrientation } from '@/hooks/useOrientation';

// séquence à valider
const LEVELS = [
    { target: 360, label: '1 Tour à Droite', direction: 'right' },
    { target: -360, label: '1 Tour à Gauche', direction: 'left' },
    { target: 720, label: '2 Tours à Droite', direction: 'right' },
];

export default function SpinGame() {
    const { data, error, permissionGranted, requestPermission } = useOrientation();
    const [levelIndex, setLevelIndex] = useState(0);
    const [gameState, setGameState] = useState<'intro' | 'playing' | 'won'>('intro');

    // accumulateur de rotation
    const [totalRotation, setTotalRotation] = useState(0);

    // ref pour stocker la valeur précédente
    const lastAlphaRef = useRef<number | null>(null);

    const startGame = () => {
        setTotalRotation(0);
        lastAlphaRef.current = data.alpha;
        setLevelIndex(0);
        setGameState('playing');
    };

    const nextLevel = useCallback(() => {
        setTotalRotation(0);

        if (levelIndex + 1 < LEVELS.length) {
            setLevelIndex((prev) => prev + 1);
        } else {
            setGameState('won');
        }
    }, [levelIndex]);

    useEffect(() => {
        if (gameState !== 'playing' || data.alpha === null) return;

        const currentAlpha = data.alpha;
        const lastAlpha = lastAlphaRef.current;

        if (lastAlpha !== null) {
            // soustraction
            // rotation horaire (droite) = positif
            // rotation anti-horaire (gauche) = négatif
            let delta = lastAlpha - currentAlpha;

            // Correction du passage (0° <-> 360°)
            if (delta > 180) {
                delta -= 360;
            } else if (delta < -180) {
                delta += 360;
            }

            setTotalRotation((prev) => prev + delta);
        }

        lastAlphaRef.current = currentAlpha;
    }, [data.alpha, gameState]);

    // validation
    const currentTarget = LEVELS[levelIndex].target;
    const progress = Math.min(
        100,
        Math.max(0, (Math.abs(totalRotation) / Math.abs(currentTarget)) * 100)
    );

    // check direction et quantité (marge erreur 20°)
    // check aussi le signe (Math.sign) pour être sûr qu'on tourne dans le bon sens
    const isGoodDirection =
        Math.sign(currentTarget) === Math.sign(totalRotation) || totalRotation === 0;
    const isTargetReached =
        Math.abs(totalRotation) >= Math.abs(currentTarget) - 20 &&
        Math.sign(totalRotation) === Math.sign(currentTarget);

    useEffect(() => {
        if (isTargetReached && gameState === 'playing') {
            const timer = setTimeout(() => {
                nextLevel();
            }, 500);
            return () => clearTimeout(timer);
        }
    }, [isTargetReached, gameState, nextLevel]);

    return (
        <>
            <AlphaHeader title="Module Gyroscopique" subtitle="Test de rotation physique à 360°" />

            {!permissionGranted && !error && (
                <div className="flex flex-col items-center justify-center rounded-lg border border-neutral-800 bg-neutral-900 p-10 text-center">
                    <p className="mb-4 text-neutral-400">Accès capteurs requis.</p>
                    <AlphaButton onClick={requestPermission}>Activer</AlphaButton>
                </div>
            )}

            <AlphaError message={error} />

            {permissionGranted && (
                <AlphaGrid>
                    <div className="space-y-6">
                        <AlphaCard title="Objectif de Rotation">
                            {gameState === 'intro' && (
                                <div className="py-10 text-center">
                                    <ArrowPathIcon className="mx-auto mb-4 h-16 w-16 text-neutral-500" />
                                    <p className="mb-6 text-neutral-400">
                                        Vous allez devoir tourner sur vous-même physiquement.
                                        <br />
                                        Faites de la place autour de vous !
                                    </p>
                                    <AlphaButton onClick={startGame}>Commencer</AlphaButton>
                                </div>
                            )}

                            {gameState === 'won' && (
                                <div className="py-10 text-center">
                                    <CheckCircleIcon className="mx-auto mb-4 h-16 w-16 animate-bounce text-emerald-500" />
                                    <h3 className="mb-2 text-2xl font-bold text-white">
                                        CALIBRAGE TERMINÉ
                                    </h3>
                                    <p className="mb-6 text-neutral-400">
                                        Vos gyroscopes sont parfaitement synchronisés.
                                    </p>
                                    <AlphaButton onClick={startGame}>Recommencer</AlphaButton>
                                </div>
                            )}

                            {gameState === 'playing' && (
                                <div className="flex flex-col items-center py-6">
                                    <h3 className="mb-2 text-xl font-bold text-white">
                                        Niveau {levelIndex + 1} / {LEVELS.length}
                                    </h3>
                                    <div className="mb-8 font-mono text-2xl font-bold text-emerald-400">
                                        {LEVELS[levelIndex].label.toUpperCase()}
                                    </div>

                                    {/* jauge circulaire */}
                                    <div className="relative h-48 w-48">
                                        <svg
                                            className="h-full w-full -rotate-90"
                                            viewBox="0 0 100 100"
                                        >
                                            <circle
                                                cx="50"
                                                cy="50"
                                                r="45"
                                                fill="none"
                                                stroke="#262626"
                                                strokeWidth="10"
                                            />

                                            {/* progression */}
                                            <circle
                                                cx="50"
                                                cy="50"
                                                r="45"
                                                fill="none"
                                                // couleur change si on tourne dans le mauvais sens
                                                stroke={
                                                    !isGoodDirection && Math.abs(totalRotation) > 10
                                                        ? '#ef4444'
                                                        : isTargetReached
                                                          ? '#10b981'
                                                          : '#3b82f6'
                                                }
                                                strokeWidth="10"
                                                strokeDasharray="283"
                                                strokeDashoffset={283 - (283 * progress) / 100}
                                                strokeLinecap="round"
                                            />
                                        </svg>

                                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                                            <span
                                                className={`text-3xl font-bold ${!isGoodDirection && Math.abs(totalRotation) > 10 ? 'text-red-500' : 'text-white'}`}
                                            >
                                                {Math.round(Math.abs(totalRotation))}°
                                            </span>
                                            <span className="text-xs text-neutral-500">
                                                / {Math.abs(currentTarget)}°
                                            </span>
                                        </div>
                                    </div>

                                    {!isGoodDirection && Math.abs(totalRotation) > 10 && (
                                        <p className="mt-4 animate-pulse text-sm font-bold text-red-400">
                                            MAUVAIS SENS !
                                        </p>
                                    )}
                                </div>
                            )}
                        </AlphaCard>
                    </div>

                    <div className="space-y-6">
                        <AlphaCard title="Debug Rotation">
                            <div className="flex flex-col gap-4">
                                <div className="rounded border border-neutral-800 bg-neutral-900 p-4 font-mono text-sm">
                                    <div className="mb-2 flex justify-between">
                                        <span className="text-neutral-500">Alpha Brut :</span>
                                        <span>{Math.round(data.alpha || 0)}°</span>
                                    </div>
                                    <div className="flex justify-between border-t border-neutral-800 pt-2">
                                        <span className="text-neutral-500">Cumulé :</span>
                                        <span
                                            className={
                                                totalRotation < 0
                                                    ? 'text-orange-400'
                                                    : 'text-blue-400'
                                            }
                                        >
                                            {Math.round(totalRotation)}°
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </AlphaCard>
                    </div>
                </AlphaGrid>
            )}
        </>
    );
}
