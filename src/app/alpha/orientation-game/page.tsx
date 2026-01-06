'use client';

import React, { useCallback, useEffect, useState } from 'react';

import {
    ArrowDownIcon,
    ArrowLeftIcon,
    ArrowRightIcon,
    ArrowUpIcon,
    StopCircleIcon,
} from '@heroicons/react/24/solid';

import { AlphaButton } from '@/components/alpha/AlphaButton';
import { AlphaCard } from '@/components/alpha/AlphaCard';
import { AlphaError } from '@/components/alpha/AlphaError';
import { AlphaGrid } from '@/components/alpha/AlphaGrid';
import { AlphaHeader } from '@/components/alpha/AlphaHeader';
import { useOrientation } from '@/hooks/useOrientation';
import { useOrientationGesture } from '@/hooks/useOrientationGesture';
import { Direction } from '@/types/orientation';

// config du mini jeu
const GAME_LENGTH = 5;
const POSSIBLE_DIRECTIONS: Direction[] = ['Haut', 'Bas', 'Gauche', 'Droite'];

const DIRECTION_CONFIG: Record<
    string,
    { label: string; Icon: React.ElementType; color: string; border: string }
> = {
    // couleurs brutes
    Haut: {
        label: 'HAUT',
        Icon: ArrowUpIcon,
        color: 'text-blue-400',
        border: 'border-blue-500',
    },
    Droite: {
        label: 'DROITE',
        Icon: ArrowRightIcon,
        color: 'text-purple-400',
        border: 'border-purple-500',
    },
    Bas: {
        label: 'BAS',
        Icon: ArrowDownIcon,
        color: 'text-orange-400',
        border: 'border-orange-500',
    },
    Gauche: {
        label: 'GAUCHE',
        Icon: ArrowLeftIcon,
        color: 'text-pink-400',
        border: 'border-pink-500',
    },
    Stable: {
        label: 'STABLE',
        Icon: StopCircleIcon,
        color: 'text-muted',
        border: 'border-border',
    },
};

export default function OrientationGame() {
    const { data, error, permissionGranted, requestPermission } = useOrientation();

    const { instantDirection, validatedDirection } = useOrientationGesture(data, {
        threshold: 30,
        stableTime: 500,
    });

    // states
    const [gameState, setGameState] = useState<'intro' | 'playing' | 'won'>('intro');
    const [sequence, setSequence] = useState<Direction[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [hasSensorData, setHasSensorData] = useState(false);

    useEffect(() => {
        if (!hasSensorData && (data.alpha !== 0 || data.beta !== 0 || data.gamma !== 0)) {
            const timer = setTimeout(() => setHasSensorData(true), 0);
            return () => clearTimeout(timer);
        }
    }, [data, hasSensorData]);

    // jeu
    const generateSequence = useCallback(() => {
        const newSeq: Direction[] = [];
        let lastDir: Direction | null = null;

        for (let i = 0; i < GAME_LENGTH; i++) {
            let nextDir: Direction;
            do {
                nextDir =
                    POSSIBLE_DIRECTIONS[Math.floor(Math.random() * POSSIBLE_DIRECTIONS.length)];
            } while (nextDir === lastDir);

            newSeq.push(nextDir);
            lastDir = nextDir;
        }
        setSequence(newSeq);
    }, []);

    const startGame = () => {
        generateSequence();
        setCurrentIndex(0);
        setGameState('playing');
    };

    // boucle de validation
    useEffect(() => {
        if (gameState !== 'playing') return;

        const targetDirection = sequence[currentIndex];

        if (validatedDirection === targetDirection) {
            const timer = setTimeout(() => {
                const nextIndex = currentIndex + 1;

                setCurrentIndex(nextIndex);

                if (nextIndex >= sequence.length) {
                    setGameState('won');
                }
            }, 200);

            return () => clearTimeout(timer);
        }
    }, [validatedDirection, currentIndex, gameState, sequence]);

    // helpers pour l'affichage
    const currentDir = sequence[currentIndex];
    // fallback safe si l'index dépasse la taille du tableau (écran de victoire)
    const targetConfig = currentDir ? DIRECTION_CONFIG[currentDir] : DIRECTION_CONFIG['Stable'];

    const TargetIcon = targetConfig.Icon;
    const CurrentGestureIcon = DIRECTION_CONFIG[instantDirection].Icon;
    const ValidatedGestureIcon = DIRECTION_CONFIG[validatedDirection].Icon;

    return (
        <>
            <AlphaHeader
                title="Séquenceur Gyroscopique"
                subtitle="Orientez votre appareil pour valider la séquence de sécurité."
            />

            {!permissionGranted && !error && (
                <div className="border-border bg-surface flex flex-col items-center justify-center rounded-lg border p-10 text-center">
                    <p className="text-muted mb-4">Accès gyroscope requis pour le protocole.</p>
                    <AlphaButton onClick={requestPermission}>Initialiser les Capteurs</AlphaButton>
                </div>
            )}

            <AlphaError message={error} />

            {permissionGranted && !hasSensorData && (
                <AlphaError message="En attente de signal... (Sur PC : Ouvrez DevTools > Sensors)" />
            )}

            {permissionGranted && (
                <AlphaGrid>
                    {/* col 1 : mini jeu */}
                    <div className="space-y-6">
                        <AlphaCard
                            title={`Séquence de Sécurité [${currentIndex}/${sequence.length}]`}
                        >
                            {gameState === 'intro' && (
                                <div className="py-8 text-center">
                                    <div className="mb-4 text-6xl">📱</div>
                                    <p className="text-muted mb-6">
                                        Une série de directions va s'afficher.
                                        <br />
                                        Inclinez votre appareil pour les valider une par une.
                                    </p>
                                    <AlphaButton onClick={startGame}>
                                        Démarrer la Séquence
                                    </AlphaButton>
                                </div>
                            )}

                            {gameState === 'won' && (
                                <div className="py-8 text-center">
                                    <div className="mb-4 animate-bounce text-6xl">🎉</div>
                                    <h3 className="text-brand-emerald mb-2 text-2xl font-bold">
                                        ACCÈS AUTORISÉ
                                    </h3>
                                    <p className="text-muted mb-6">
                                        Protocole complété avec succès.
                                    </p>
                                    <AlphaButton onClick={startGame}>Nouvelle Séquence</AlphaButton>
                                </div>
                            )}

                            {gameState === 'playing' && sequence.length > 0 && (
                                <div className="flex flex-col items-center justify-center py-4">
                                    {/* mouvement cible à effectuer */}
                                    <div
                                        className={`bg-surface relative mb-8 flex h-40 w-40 items-center justify-center rounded-full border-4 shadow-[0_0_30px_rgba(0,0,0,0.2)] transition-colors duration-300 ${DIRECTION_CONFIG[sequence[currentIndex]].border}`}
                                    >
                                        <TargetIcon
                                            className={`h-24 w-24 transition-colors ${DIRECTION_CONFIG[sequence[currentIndex]].color}`}
                                        />
                                        <span className="text-foreground absolute -bottom-10 font-mono text-lg font-bold">
                                            {sequence[currentIndex].toUpperCase()}
                                        </span>
                                    </div>

                                    {/* barre de progression (dots) */}
                                    <div className="mt-4 flex gap-2">
                                        {sequence.map((dir, idx) => (
                                            <div
                                                key={idx}
                                                className={`h-3 w-3 rounded-full transition-all duration-300 ${
                                                    idx < currentIndex
                                                        ? 'bg-brand-emerald shadow-[0_0_8px_var(--color-brand-emerald)]' // validé
                                                        : idx === currentIndex
                                                          ? 'bg-foreground scale-125 animate-pulse' // current
                                                          : 'bg-surface-highlight' // next
                                                }`}
                                            />
                                        ))}
                                    </div>
                                </div>
                            )}
                        </AlphaCard>
                    </div>

                    {/* col 2 : feedback */}
                    <div className="space-y-6">
                        <AlphaCard title="État des Capteurs">
                            <div className="flex flex-col items-center gap-4 py-2">
                                <div className="border-border bg-surface-highlight/30 relative flex h-32 w-32 items-center justify-center rounded-full border-2 border-dashed">
                                    {/* réticule */}
                                    <div className="bg-border absolute h-full w-[1px]" />
                                    <div className="bg-border absolute h-[1px] w-full" />

                                    <CurrentGestureIcon
                                        className={`h-16 w-16 transition-all duration-200 ${
                                            instantDirection !== 'Stable'
                                                ? DIRECTION_CONFIG[instantDirection].color
                                                : 'text-muted'
                                        }`}
                                    />
                                </div>

                                <div className="w-full space-y-2">
                                    <div className="bg-surface-highlight flex justify-between rounded p-2 text-sm">
                                        <span className="text-muted">Détecté :</span>
                                        <span
                                            className={`flex items-center gap-2 font-bold ${instantDirection !== 'Stable' ? 'text-brand-blue' : 'text-muted'}`}
                                        >
                                            <CurrentGestureIcon className="h-4 w-4" />
                                            {instantDirection}
                                        </span>
                                    </div>
                                    <div className="bg-surface-highlight flex justify-between rounded p-2 text-sm">
                                        <span className="text-muted">Validé :</span>
                                        <span
                                            className={`flex items-center gap-2 font-bold ${validatedDirection !== 'Stable' ? 'text-brand-emerald' : 'text-muted'}`}
                                        >
                                            <ValidatedGestureIcon className="h-4 w-4" />
                                            {validatedDirection}
                                        </span>
                                    </div>
                                </div>

                                <p className="text-muted text-center text-xs">
                                    Maintenez l'inclinaison jusqu'à ce que la validation passe au
                                    vert.
                                </p>
                            </div>
                        </AlphaCard>
                    </div>
                </AlphaGrid>
            )}
        </>
    );
}
