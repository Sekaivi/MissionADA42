'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';

import { ArrowPathIcon, ArrowUpIcon, ExclamationTriangleIcon } from '@heroicons/react/24/solid';
import clsx from 'clsx';
import { motion } from 'framer-motion';

import { AlphaButton } from '@/components/alpha/AlphaButton';
import { AlphaCard } from '@/components/alpha/AlphaCard';
import { AlphaCircularGauge } from '@/components/alpha/AlphaCircularGauge';
import { AlphaError } from '@/components/alpha/AlphaError';
import AlphaFeedbackPill from '@/components/alpha/AlphaFeedbackPill';
import { PuzzleProps } from '@/components/puzzles/PuzzleRegistry';
import { useOrientation } from '@/hooks/useOrientation';

export const GyroscopeModule: React.FC<PuzzleProps> = ({ onSolve, isSolved }) => {
    const { data, error, permissionGranted, requestPermission } = useOrientation();
    const [progress, setProgress] = useState(0);
    const [hasActivatedSensor, setHasActivatedSensor] = useState(false);

    // ref pour ne pas spammer onSolve quand on reste stable à 100%
    const hasTriggeredRef = useRef(false);

    const [visualHeading, setVisualHeading] = useState(0);
    const prevHeadingRef = useRef(0);

    const beta = data.beta ?? 0;
    const gamma = data.gamma ?? 0;
    const alpha = data.alpha ?? 0;

    const rawHeading =
        data.heading !== null && data.heading !== undefined ? data.heading : 360 - alpha;

    // calcul rotation cumulative pour le Nord
    useEffect(() => {
        const current = rawHeading;
        const previous = prevHeadingRef.current;
        let delta = current - previous;
        if (delta < -180) delta += 360;
        else if (delta > 180) delta -= 360;
        setVisualHeading((prev) => prev + delta);
        prevHeadingRef.current = current;
    }, [rawHeading]);

    // seuils
    const currentTilt = Math.max(Math.abs(beta), Math.abs(gamma));
    const FLAT_THRESHOLD = 5;
    const ACTIVATION_THRESHOLD = 15;
    const isFlatInstant = currentTilt < FLAT_THRESHOLD;
    const isTiltedInstant = currentTilt > ACTIVATION_THRESHOLD;

    const hasData = useMemo(() => {
        return data.alpha !== null || data.beta !== null || data.gamma !== null;
    }, [data]);

    useEffect(() => {
        const interval = setInterval(() => {
            // activation
            if (!hasActivatedSensor) {
                if (isTiltedInstant && hasData) {
                    setHasActivatedSensor(true);
                }
                return;
            }

            // progression
            setProgress((prev) => {
                let next: number;
                if (isFlatInstant && hasData) {
                    next = Math.min(100, prev + 1); // +1% par tick
                } else {
                    next = Math.max(0, prev - 3); // -3% par tick
                }

                // gestion du seuil 100%
                if (next >= 100) {
                    // si on vient d'atteindre 100% pour la première fois
                    if (!hasTriggeredRef.current) {
                        if (navigator.vibrate) navigator.vibrate(200);
                        onSolve();
                        hasTriggeredRef.current = true; // lock pour ne pas rappeler onSolve
                    }
                    return 100; // on reste à 100 tant qu'on est stable
                } else {
                    // si on redescend en dessous de 95%, on réarme le trigger pour pouvoir revalider plus tard si besoin
                    if (next < 95) {
                        hasTriggeredRef.current = false;
                    }
                    return next;
                }
            });
        }, 20);

        return () => clearInterval(interval);
    }, [hasActivatedSensor, isTiltedInstant, isFlatInstant, hasData, onSolve]);

    if (!permissionGranted && !error) {
        return (
            <AlphaCard title="Accès Gyroscope Requis">
                <div className="flex flex-col items-center gap-6 py-4 text-center">
                    <ExclamationTriangleIcon className="text-brand-orange h-12 w-12 animate-pulse" />
                    <p className="text-sm">Accès aux capteurs requis pour le calibrage.</p>
                    <AlphaButton onClick={requestPermission} size="lg">
                        Autoriser
                    </AlphaButton>
                </div>
            </AlphaCard>
        );
    }

    if (error || (!hasData && permissionGranted)) {
        return (
            <AlphaCard title="Erreur Capteur">
                <div className="flex flex-col items-center gap-4 py-4 text-center">
                    <ExclamationTriangleIcon className="text-brand-error h-12 w-12" />
                    <p className="text-sm text-neutral-300">Aucune donnée détectée.</p>
                    {error && <AlphaError message={error} />}
                </div>
            </AlphaCard>
        );
    }

    const getGaugeVariant = () => {
        if (!hasActivatedSensor) return 'default';
        if (isFlatInstant) return 'success';
        if (currentTilt < 15) return 'warning';
        return 'error';
    };

    const maxOffset = 80;
    const bubbleX = Math.max(-maxOffset, Math.min(maxOffset, gamma * 4));
    const bubbleY = Math.max(-maxOffset, Math.min(maxOffset, beta * 4));

    return (
        <div className="space-y-6">
            <AlphaFeedbackPill
                message={
                    !hasActivatedSensor
                        ? 'INCLINEZ POUR ACTIVER'
                        : progress >= 100
                          ? 'CALIBRATION OPTIMALE'
                          : isFlatInstant
                            ? 'MAINTENEZ STABLE...'
                            : "AJUSTEZ L'INCLINAISON"
                }
                type={
                    !hasActivatedSensor
                        ? 'info'
                        : progress >= 100
                          ? 'success'
                          : isFlatInstant
                            ? 'success'
                            : 'error'
                }
                isLoading={hasActivatedSensor && isFlatInstant && progress < 100}
                pulse={!hasActivatedSensor}
            />

            <div className="bg-surface relative flex h-64 w-full items-center justify-center overflow-hidden rounded-lg border">
                <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] [mask-image:radial-gradient(ellipse_at_center,black_40%,transparent_100%)] bg-[size:20px_20px]" />

                {!hasActivatedSensor && (
                    <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center">
                        <motion.div
                            animate={{ rotate: [0, 15, -15, 0] }}
                            transition={{ repeat: Infinity, duration: 1.5 }}
                            className="opacity-30"
                        >
                            <ArrowPathIcon className="h-32 w-32 text-white" />
                        </motion.div>
                    </div>
                )}

                {hasActivatedSensor && (
                    <motion.div
                        className="border-border absolute z-0 flex h-48 w-48 items-start justify-center rounded-full border"
                        animate={{ rotate: -visualHeading }}
                        transition={{ type: 'spring', stiffness: 50, damping: 20 }}
                    >
                        <div className="relative -top-3 flex flex-col items-center">
                            <span className="text-xs font-bold text-red-500">N</span>
                            <ArrowUpIcon className="h-4 w-4 text-red-500" />
                        </div>
                        <div className="text-muted absolute top-1/2 right-[-10px] -translate-y-1/2 rotate-90 font-mono text-xs">
                            E
                        </div>
                        <div className="text-muted absolute bottom-[-10px] left-1/2 -translate-x-1/2 font-mono text-xs">
                            S
                        </div>
                        <div className="text-muted absolute top-1/2 left-[-10px] -translate-y-1/2 -rotate-90 font-mono text-xs">
                            O
                        </div>
                    </motion.div>
                )}

                {hasActivatedSensor && (
                    <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center">
                        <div
                            className={clsx(
                                'absolute h-12 w-12 rounded-full border-2 transition-colors duration-300',
                                isFlatInstant
                                    ? 'border-brand-emerald bg-brand-emerald/10'
                                    : 'border-muted'
                            )}
                        />

                        <motion.div
                            className={clsx(
                                'border-border h-8 w-8 rounded-full border backdrop-blur-md',
                                isFlatInstant ? 'bg-brand-emerald' : 'bg-surface-highlight'
                            )}
                            animate={{ x: bubbleX, y: bubbleY }}
                            transition={{
                                type: 'spring',
                                stiffness: 150,
                                damping: 20,
                                mass: 0.5,
                            }}
                        />
                    </div>
                )}

                <div className="z-20 scale-90">
                    <AlphaCircularGauge
                        value={Math.round(currentTilt)}
                        max={20}
                        variant={getGaugeVariant()}
                        showGlow={isFlatInstant}
                        size="h-40 w-40"
                        animate={false}
                    >
                        <div className="flex flex-col items-center drop-shadow-md">
                            <span
                                className={clsx(
                                    'font-mono text-3xl font-bold tabular-nums',
                                    isFlatInstant && 'text-brand-emerald'
                                )}
                            >
                                {Math.round(currentTilt)}°
                            </span>
                        </div>
                    </AlphaCircularGauge>
                </div>
            </div>

            <div className="bg-surface-highlight relative h-2 w-full overflow-hidden rounded-full">
                <motion.div
                    className="bg-brand-emerald h-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.1 }}
                />
            </div>

            <div className="text-muted flex justify-between font-mono text-xs uppercase">
                <span>NORD: {Math.round(rawHeading)}°</span>

                {hasActivatedSensor ? (
                    <div
                        className={clsx(
                            'font-mono text-xs transition-colors',
                            progress >= 100 || isSolved
                                ? 'text-brand-emerald font-bold'
                                : 'text-muted'
                        )}
                    >
                        {isSolved ? 'SYNC' : `${Math.round(progress)}%`}
                    </div>
                ) : (
                    <span className={'text-brand-orange'}>INACTIF</span>
                )}
            </div>
        </div>
    );
};
