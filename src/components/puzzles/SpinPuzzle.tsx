'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';

import { ArrowPathIcon } from '@heroicons/react/24/solid';

import { AlphaButton } from '@/components/alpha/AlphaButton';
import { AlphaCard } from '@/components/alpha/AlphaCard';
import { AlphaCircularGauge } from '@/components/alpha/AlphaCircularGauge';
import { AlphaError } from '@/components/alpha/AlphaError';
import AlphaFeedbackPill from '@/components/alpha/AlphaFeedbackPill';
import { AlphaGrid } from '@/components/alpha/AlphaGrid';
import { AlphaInfoRow } from '@/components/alpha/AlphaInfoRow';
import { AlphaModal } from '@/components/alpha/AlphaModal';
import { AlphaSuccess } from '@/components/alpha/AlphaSuccess';
import { PuzzleProps } from '@/components/puzzles/PuzzleRegistry';
import { SCENARIO } from '@/data/alphaScenario';
import { useOrientation } from '@/hooks/useOrientation';

const LEVELS = [
    { target: 360, label: '1 Tour à Droite', direction: 'right' },
    { target: -360, label: '1 Tour à Gauche', direction: 'left' },
    { target: 720, label: '2 Tours à Droite', direction: 'right' },
];

export const SpinPuzzle: React.FC<PuzzleProps> = ({ onSolve, isSolved }) => {
    const { data, error, permissionGranted, requestPermission } = useOrientation();
    const [levelIndex, setLevelIndex] = useState(0);
    const [gameState, setGameState] = useState<'intro' | 'playing' | 'won'>('intro');
    const [totalRotation, setTotalRotation] = useState(0);
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

    // calcul de rotation
    useEffect(() => {
        if (gameState !== 'playing' || data.alpha === null) return;
        const currentAlpha = data.alpha;
        const lastAlpha = lastAlphaRef.current;

        if (lastAlpha !== null) {
            let delta = lastAlpha - currentAlpha;
            if (delta > 180) delta -= 360;
            else if (delta < -180) delta += 360;
            setTotalRotation((prev) => prev + delta);
        }
        lastAlphaRef.current = currentAlpha;
    }, [data.alpha, gameState]);

    const currentTarget = LEVELS[levelIndex].target;

    // détection des erreurs de sens
    const isWrongDirection =
        Math.abs(totalRotation) > 10 &&
        Math.sign(currentTarget) !== Math.sign(totalRotation) &&
        totalRotation !== 0;

    const isTargetReached =
        Math.abs(totalRotation) >= Math.abs(currentTarget) - 20 && !isWrongDirection;

    // calcul de la variante de couleur pour la jauge
    const getGaugeVariant = () => {
        if (isWrongDirection) return 'error';
        if (isTargetReached) return 'success';
        return 'default';
    };

    useEffect(() => {
        if (isTargetReached && gameState === 'playing') {
            const timer = setTimeout(nextLevel, 500);
            return () => clearTimeout(timer);
        }
    }, [isTargetReached, gameState, nextLevel]);

    if (isSolved) return <AlphaSuccess message={'SÉQUENCE VALIDÉE'} />;

    return (
        <>
            {/* cas iOS demande la permission */}
            {!permissionGranted && !error && (
                <AlphaCard title={'Permissions requises'}>
                    <p className="mb-4">Accès gyroscope requis pour le protocole.</p>
                    <AlphaButton onClick={requestPermission}>Initialiser les Capteurs</AlphaButton>
                </AlphaCard>
            )}

            <AlphaError message={error} />

            {permissionGranted && (
                <AlphaGrid>
                    <div className="space-y-6">
                        <AlphaCard title="Objectif de Rotation">
                            {gameState === 'intro' && (
                                <div className="space-y-6 text-center">
                                    <ArrowPathIcon className="text-muted mx-auto mb-4 h-16 w-16" />
                                    <p>
                                        Vous allez devoir tourner sur vous-même.
                                        <br />
                                        Faites de la place autour de vous !
                                    </p>
                                    <AlphaButton onClick={startGame}>Commencer</AlphaButton>
                                </div>
                            )}

                            <AlphaModal
                                isOpen={gameState === 'won'}
                                message={'Protocole complété avec succès.'}
                                autoCloseDuration={SCENARIO.defaultTimeBeforeNextStep}
                                durationUnit={'ms'}
                                onAutoClose={onSolve}
                            />

                            {gameState === 'won' && (
                                <div className="my-6 space-y-6 text-center">
                                    <AlphaSuccess message={'Protocole complété avec succès.'} />
                                    <AlphaButton onClick={startGame}>Recommencer</AlphaButton>
                                </div>
                            )}

                            {gameState === 'playing' && (
                                <div className="flex flex-col items-center space-y-6">
                                    <div className={'space-y-2 text-center font-bold'}>
                                        <h3 className="text-xl">
                                            Niveau {levelIndex + 1} / {LEVELS.length}
                                        </h3>
                                        <div className="text-brand-emerald text-2xl">
                                            {LEVELS[levelIndex].label.toUpperCase()}
                                        </div>
                                    </div>

                                    <AlphaCircularGauge
                                        value={Math.abs(totalRotation)}
                                        max={Math.abs(currentTarget)}
                                        variant={getGaugeVariant()}
                                        showGlow={isTargetReached}
                                        size="h-56 w-56"
                                    >
                                        <span
                                            className={`text-3xl font-bold ${isWrongDirection ? 'text-brand-error' : 'text-foreground'}`}
                                        >
                                            {Math.round(Math.abs(totalRotation))}°
                                        </span>
                                        <span className="text-muted text-sm">
                                            / {Math.abs(currentTarget)}°
                                        </span>
                                    </AlphaCircularGauge>

                                    {isWrongDirection && (
                                        <AlphaFeedbackPill
                                            message={'Mauvais sens !'}
                                            type={'error'}
                                            className={'animate-pulse'}
                                        />
                                    )}
                                </div>
                            )}
                        </AlphaCard>
                    </div>

                    <AlphaCard title="Debug Rotation">
                        <AlphaInfoRow
                            label={'Alpha Brut :'}
                            value={`${Math.round(data.alpha || 0)}°`}
                        />
                        <AlphaInfoRow
                            label={'Cumulé :'}
                            value={`${Math.round(totalRotation)}°`}
                            active
                        />
                    </AlphaCard>
                </AlphaGrid>
            )}
        </>
    );
};
