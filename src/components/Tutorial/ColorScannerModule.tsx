'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';

import {
    ArrowPathIcon,
    CheckCircleIcon,
    CheckIcon,
    FingerPrintIcon,
    XCircleIcon,
} from '@heroicons/react/24/solid';
import clsx from 'clsx';
import { AnimatePresence, motion } from 'framer-motion';

import { AlphaButton } from '@/components/alpha/AlphaButton';
import { AlphaError } from '@/components/alpha/AlphaError';
import { AlphaVideoContainer } from '@/components/alpha/AlphaVideoContainer';
import { useCamera } from '@/hooks/useCamera';
import { useColorDetection } from '@/hooks/useColorDetection';
import { ColorDefinition } from '@/types/colorDetection';
import { PRESETS } from '@/utils/colorPresets';

interface ColorScannerProps {
    onSolve: (detectedColor: ColorDefinition) => void;
    isSolved?: boolean;
    targetColorId?: string;
    onFail?: () => void;
    sequenceHistory?: string[];
}

const SequenceHistoryBar: React.FC<{ history: string[]; activePresets: ColorDefinition[] }> = ({
    history,
    activePresets,
}) => {
    if (!history || history.length === 0) return null;

    return (
        <div className="scrollbar-hide border-border bg-surface mb-2 flex items-center gap-2 overflow-x-auto rounded-lg border-b p-2">
            <span className="text-muted mr-1 font-mono text-xs uppercase">Séquence</span>
            <div className="flex items-center gap-2 pr-4">
                {history.map((colorId, idx) => {
                    const colorDef = activePresets.find((p) => p.id === colorId);
                    return (
                        <motion.div
                            key={`${colorId}-${idx}`}
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="border-border relative h-5 w-5 flex-shrink-0 rounded-full border"
                            style={{ backgroundColor: colorDef?.displayHex || '#333' }}
                        >
                            <div className="absolute inset-0 flex items-center justify-center">
                                <CheckIcon className="h-3 w-3 text-white drop-shadow-md" />
                            </div>
                        </motion.div>
                    );
                })}
            </div>
        </div>
    );
};

const MiniRGBBar: React.FC<{ channel: 'r' | 'g' | 'b'; value: number }> = ({ channel, value }) => {
    const config = {
        r: { bg: 'bg-red-500' },
        g: { bg: 'bg-green-500' },
        b: { bg: 'bg-blue-500' },
    }[channel];

    return (
        <div className="border-border bg-surface flex h-12 w-2 flex-col justify-end overflow-hidden rounded-full border">
            <motion.div
                className={clsx('w-full opacity-80', config.bg)}
                animate={{ height: `${(value / 255) * 100}%` }}
                transition={{ duration: 0.1 }}
            />
        </div>
    );
};

export const ColorScannerModule: React.FC<ColorScannerProps> = ({
    onSolve,
    targetColorId,
    onFail,
    sequenceHistory,
}) => {
    const { videoRef, error, activeFacingMode, toggleCamera } = useCamera();
    const debugCanvasRef = useRef<HTMLCanvasElement>(null);

    const activePresets = useMemo(() => Object.values(PRESETS), []);
    const scanConfig = useMemo(() => ({ size: 100, xOffset: 0, yOffset: 0 }), []);

    const { detectedId, debug: debugData } = useColorDetection(
        videoRef,
        activePresets,
        true,
        scanConfig,
        debugCanvasRef
    );

    const [isValidating, setIsValidating] = useState(false);
    const [isFailing, setIsFailing] = useState(false);
    const [progress, setProgress] = useState(0);

    const [isScanningActive, setIsScanningActive] = useState(false);
    const [isLocked, setIsLocked] = useState(false);

    const processingLockRef = useRef(false);

    const detectedPreset = activePresets.find((p) => p.id === detectedId);
    const isTargetMatchRef = useRef(false);

    const startScanning = () => {
        setIsScanningActive(true);
    };

    const stopScanning = () => {
        setIsScanningActive(false);
        processingLockRef.current = false;
        setIsLocked(false);
        setProgress(0);
    };

    // logique de cible
    useEffect(() => {
        if (!detectedPreset) {
            isTargetMatchRef.current = false;
        } else if (!targetColorId) {
            isTargetMatchRef.current = true;
        } else {
            isTargetMatchRef.current = detectedPreset.id === targetColorId;
        }
    }, [targetColorId, detectedPreset]);

    useEffect(() => {
        if (isValidating || isFailing) return;

        const interval = setInterval(() => {
            if (processingLockRef.current) return;

            if (isScanningActive && detectedPreset) {
                setProgress((prev) => {
                    const next = Math.min(100, prev + 5);

                    if (next >= 100) {
                        processingLockRef.current = true;
                        clearInterval(interval);
                        setIsLocked(true);

                        if (isTargetMatchRef.current) {
                            // succès
                            setIsValidating(true);
                            if (navigator.vibrate) navigator.vibrate(200);

                            setTimeout(() => {
                                onSolve(detectedPreset);
                            }, 0);

                            setTimeout(() => setIsValidating(false), 1500);
                        } else {
                            // échec
                            setIsFailing(true);
                            if (navigator.vibrate) navigator.vibrate([100, 50, 100]);

                            if (onFail) {
                                setTimeout(() => {
                                    onFail();
                                }, 0);
                            }

                            setTimeout(() => setIsFailing(false), 1500);
                        }
                        return 100;
                    }
                    return next;
                });
            } else {
                setProgress((prev) => Math.max(0, prev - 10));
            }
        }, 40);

        return () => clearInterval(interval);
    }, [detectedPreset, isValidating, isFailing, onSolve, onFail, isScanningActive]);

    const getScanStatus = () => {
        if (isValidating) return 'success';
        if (isFailing) return 'error';
        if (isLocked) return 'warning';
        if (isScanningActive) return 'scanning';
        if (detectedPreset) return 'detected';
        return 'idle';
    };

    if (error) return <AlphaError message={error} />;

    return (
        <>
            {/* historique de la séquence */}
            {sequenceHistory && (
                <SequenceHistoryBar history={sequenceHistory} activePresets={activePresets} />
            )}

            <AlphaVideoContainer
                videoRef={videoRef}
                isMirrored={activeFacingMode === 'user'}
                label={
                    isLocked
                        ? 'RELÂCHEZ LE BOUTON'
                        : isValidating
                          ? 'ACQUISITION CONFIRMÉE'
                          : isFailing
                            ? 'ERREUR DE CIBLE'
                            : isScanningActive
                              ? 'ANALYSE EN COURS...'
                              : detectedPreset
                                ? 'CIBLE DÉTECTÉE'
                                : targetColorId
                                  ? 'RECHERCHE CIBLE...'
                                  : 'PRÊT À SCANNER'
                }
                scanSettings={scanConfig}
                scanStatus={getScanStatus()}
            >
                <div className={'absolute top-4 right-4'}>
                    <AlphaButton onClick={toggleCamera} variant="primary" className="!p-2">
                        <ArrowPathIcon className="h-5 w-5" />
                    </AlphaButton>
                </div>

                {/* color preview */}
                <div className="border-border bg-surface/70 absolute bottom-4 left-4 flex items-center gap-2 rounded-lg border p-1.5 backdrop-blur-sm">
                    <div className="border-border h-8 w-8 overflow-hidden rounded border bg-black">
                        <canvas
                            ref={debugCanvasRef}
                            className={clsx(
                                'h-full w-full object-cover',
                                activeFacingMode === 'user' && 'rotate-y-180'
                            )}
                        />
                    </div>
                    <div className="px-1 font-mono text-sm font-bold text-white uppercase">
                        {detectedPreset?.name || '---'}
                    </div>
                </div>

                {/* barres rgb */}
                <div className="border-border bg-surface/50 absolute right-4 bottom-4 flex gap-1 rounded-lg border p-1.5 backdrop-blur-sm">
                    <MiniRGBBar channel="r" value={debugData?.rgbAverage.r || 0} />
                    <MiniRGBBar channel="g" value={debugData?.rgbAverage.g || 0} />
                    <MiniRGBBar channel="b" value={debugData?.rgbAverage.b || 0} />
                </div>

                <AnimatePresence>
                    {isValidating && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0 }}
                            className="bg-surface/70 absolute inset-0 flex flex-col items-center justify-center backdrop-blur-sm"
                        >
                            <CheckCircleIcon className="text-brand-emerald h-20 w-20" />
                            <span className="text-brand-emerald mt-2 text-xl font-bold uppercase">
                                ACQUISITION
                            </span>
                        </motion.div>
                    )}
                </AnimatePresence>

                <AnimatePresence>
                    {isFailing && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0 }}
                            className="border-brand-error bg-surface/70 absolute inset-0 z-50 flex flex-col items-center justify-center border-4 backdrop-blur-sm"
                        >
                            <XCircleIcon className="text-brand-error h-20 w-20 animate-pulse" />
                            <span className="text-brand-error mt-2 text-xl font-bold uppercase">
                                INCORRECT
                            </span>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* scanning progress bar */}
                <AnimatePresence>
                    {progress > 0 && !isValidating && !isFailing && (
                        <motion.div
                            initial={{ opacity: 0, width: '0%' }}
                            animate={{ opacity: 1, width: '100%' }}
                            exit={{ opacity: 0 }}
                            className="absolute right-0 bottom-0 left-0 h-2 bg-neutral-900"
                        >
                            <motion.div
                                className="bg-brand-emerald h-full shadow-[0_0_10px_#10b981]"
                                initial={{ width: 0 }}
                                animate={{ width: `${progress}%` }}
                                transition={{ ease: 'linear', duration: 0.1 }}
                            />
                        </motion.div>
                    )}
                </AnimatePresence>
            </AlphaVideoContainer>

            <AlphaButton
                variant={isLocked ? 'warning' : isScanningActive ? 'primary' : 'secondary'}
                className={'mx-auto'}
                // bloque le clic droit
                onContextMenu={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    return false;
                }}
                onMouseDown={startScanning}
                onMouseUp={stopScanning}
                onMouseLeave={stopScanning}
                onTouchStart={startScanning}
                onTouchEnd={stopScanning}
                aria-label="Maintenir pour scanner"
            >
                {isLocked ? (
                    <ArrowPathIcon className="mr-2 h-6 w-6 animate-pulse" />
                ) : (
                    <FingerPrintIcon
                        className={clsx('mr-2 h-6 w-6', isScanningActive && 'animate-pulse')}
                    />
                )}

                <span className="text-sm font-bold">
                    {isLocked
                        ? 'RELÂCHEZ LE BOUTON'
                        : isScanningActive
                          ? 'ANALYSE EN COURS...'
                          : 'MAINTENIR POUR SCANNER'}
                </span>
            </AlphaButton>
        </>
    );
};
