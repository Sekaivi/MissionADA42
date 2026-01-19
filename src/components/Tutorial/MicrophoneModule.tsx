'use client';

import React, { useEffect, useRef, useState } from 'react';

import { MicrophoneIcon, SpeakerWaveIcon } from '@heroicons/react/24/solid';
import clsx from 'clsx';
import { motion } from 'framer-motion';

import { AlphaButton } from '@/components/alpha/AlphaButton';
import { AlphaCard } from '@/components/alpha/AlphaCard';
import { AlphaError } from '@/components/alpha/AlphaError';
import AlphaFeedbackPill from '@/components/alpha/AlphaFeedbackPill';
import { AlphaModal } from '@/components/alpha/AlphaModal';
import { AlphaSuccess } from '@/components/alpha/AlphaSuccess';
import { PuzzleProps } from '@/components/puzzles/PuzzleRegistry';
import { SCENARIO } from '@/data/alphaScenario';
import { useMicrophone } from '@/hooks/useMicrophone';

export const MicrophoneModule: React.FC<PuzzleProps> = ({ onSolve, isSolved }) => {
    const { data, isCalibrated, permissionGranted, error, requestPermission, startCalibration } =
        useMicrophone();

    const [isValidating, setIsValidating] = useState(false);

    const dataRef = useRef(data);
    useEffect(() => {
        dataRef.current = data;
    }, [data]);

    const isCalibratedRef = useRef(isCalibrated);
    useEffect(() => {
        isCalibratedRef.current = isCalibrated;
    }, [isCalibrated]);

    const hasTriggeredRef = useRef(false);

    useEffect(() => {
        if (isSolved) return;

        const interval = setInterval(() => {
            const currentData = dataRef.current;
            const currentCalibrated = isCalibratedRef.current;

            if (!currentCalibrated || hasTriggeredRef.current) return;

            if (currentData.isBlowing) {
                hasTriggeredRef.current = true;
                setIsValidating(true);

                setTimeout(() => {
                    onSolve();
                }, SCENARIO.defaultTimeBeforeNextStep);

                clearInterval(interval);
            }
        }, 100);

        return () => clearInterval(interval);
    }, [isSolved, onSolve]);

    let feedbackMsg = 'Recherche du signal...';
    if (isValidating) {
        feedbackMsg = 'Flux détecté !';
    } else if (!permissionGranted) {
        feedbackMsg = 'Autorisation requise';
    } else if (!isCalibrated) {
        feedbackMsg = 'Calibration...';
    } else {
        feedbackMsg = 'Parlez.';
    }

    if (isSolved) {
        return <AlphaSuccess message={'ANALYSE SONORE COMPLÈTE'} />;
    }

    if (error) {
        return (
            <div className="space-y-4">
                <AlphaError message={error} />
                {!permissionGranted && (
                    <AlphaButton onClick={requestPermission} variant="primary">
                        Réessayer l&apos;autorisation
                    </AlphaButton>
                )}
            </div>
        );
    }

    if (!permissionGranted) {
        return (
            <AlphaCard title="ACCÈS MICROPHONE REQUIS">
                <div className="flex flex-col items-center gap-6 py-6">
                    <MicrophoneIcon className="text-muted h-16 w-16 animate-pulse" />
                    <p className="text-muted text-center text-sm">
                        Le module nécessite une analyse de l'environnement sonore. Veuillez activer
                        le capteur audio.
                    </p>
                    <AlphaButton onClick={requestPermission} variant="primary">
                        ACTIVER LE CAPTEUR
                    </AlphaButton>
                </div>
            </AlphaCard>
        );
    }

    return (
        <div className="space-y-6">
            <AlphaModal
                isOpen={isValidating}
                variant="success"
                title="FLUX D'AIR CONFIRMÉ"
                message="Analyse Terminée"
                subMessage="Le système de ventilation a été réactivé."
                Icon={SpeakerWaveIcon}
                autoCloseDuration={SCENARIO.defaultTimeBeforeNextStep}
                durationUnit={'ms'}
            />

            {/* visualiseur audio */}
            <div className="border-border relative flex h-64 w-full flex-col items-center justify-center gap-6 rounded-xl border">
                <AlphaFeedbackPill
                    message={feedbackMsg}
                    isLoading={!isCalibrated}
                    type={isValidating ? 'info' : isCalibrated ? 'success' : 'warning'}
                />

                {/* cercle réactif */}
                <div className="relative z-10">
                    <motion.div
                        className={clsx(
                            'absolute inset-0 rounded-full blur-xl',
                            data.isBlowing ? 'bg-brand-emerald/30' : 'bg-brand-blue/30'
                        )}
                        animate={{
                            scale: 1 + data.volume / 50,
                            opacity: 0.3 + data.volume / 100,
                        }}
                    />

                    {/* indicateur */}
                    <div
                        className={clsx(
                            'relative z-20 flex h-32 w-32 items-center justify-center rounded-full border-4 transition-colors duration-200',
                            data.isBlowing
                                ? 'border-brand-emerald bg-brand-emerald/10'
                                : 'border-brand-blue bg-brand-blue/10'
                        )}
                    >
                        <MicrophoneIcon
                            className={clsx(
                                'h-12 w-12 transition-colors duration-200',
                                data.isBlowing ? 'text-brand-emerald' : 'text-brand-blue'
                            )}
                        />
                    </div>

                    {/* ondes */}
                    {isCalibrated && (
                        <>
                            <motion.div
                                className="border-brand-blue/50 absolute top-0 left-0 h-32 w-32 rounded-full border"
                                animate={{ scale: [1, 1.5], opacity: [0.5, 0] }}
                                transition={{
                                    duration: 1,
                                    repeat: Infinity,
                                    ease: 'easeOut',
                                }}
                            />

                            {data.volume > 10 && (
                                <motion.div
                                    className="border-brand-emerald/30 absolute top-0 left-0 h-32 w-32 rounded-full border-2"
                                    animate={{ scale: [1, 2], opacity: [0.8, 0] }}
                                    transition={{
                                        duration: 0.5,
                                        repeat: Infinity,
                                        ease: 'easeOut',
                                    }}
                                />
                            )}
                        </>
                    )}
                </div>

                {/* spectre */}
                <div className="right-4 bottom-4 left-4 flex h-2 items-end justify-center gap-1">
                    {Array.from({ length: 20 }).map((_, i) => {
                        const pseudoRandom = (Math.sin(i * 12.9898 + data.volume) + 1) / 2;

                        return (
                            <motion.div
                                key={i}
                                className={clsx(
                                    'w-2 rounded-t-sm',
                                    data.isBlowing
                                        ? 'bg-brand-emerald'
                                        : i < data.volume / 5
                                          ? 'bg-brand-blue'
                                          : 'bg-neutral-800'
                                )}
                                animate={{
                                    height: Math.max(4, Math.min(24, data.volume * pseudoRandom)),
                                }}
                                transition={{ duration: 0.1 }}
                            />
                        );
                    })}
                </div>
            </div>

            <div className="flex justify-center">
                <AlphaButton variant="secondary" onClick={startCalibration}>
                    {isCalibrated ? 'Recalibrer le capteur' : 'Calibration en cours...'}
                </AlphaButton>
            </div>
        </div>
    );
};
