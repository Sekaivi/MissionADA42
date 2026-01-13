'use client';

import React, { useEffect, useRef, useState } from 'react';

import { Html5Qrcode } from 'html5-qrcode';

import { AlphaCard } from '@/components/alpha/AlphaCard';
import FeedbackPill from '@/components/alpha/AlphaFeedbackPill';
import { AlphaVideoContainer } from '@/components/alpha/AlphaVideoContainer';
import { PuzzleProps } from '@/components/puzzles/PuzzleRegistry';
import { PuzzlePhases } from '@/components/puzzles/PuzzleRegistry';
import { SCENARIO } from '@/data/alphaScenario';

interface AlphaQRScannerProps extends PuzzleProps {
    target: string;
}

export const AlphaQRScanner = ({ onSolve, target }: AlphaQRScannerProps) => {
    const elementId = 'reader-stream';

    const [lastResult, setLastResult] = useState<string | null>(null);
    const [scanStatus, setScanStatus] = useState<PuzzlePhases>('idle');

    const lastResultRef = useRef<string | null>(null);
    const onResultRef = useRef(onSolve);
    const scannerRef = useRef<Html5Qrcode | null>(null);

    const mountRef = useRef<HTMLDivElement>(null);

    const errorTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        onResultRef.current = onSolve;
    }, [onSolve]);

    useEffect(() => {
        if (!mountRef.current) return;

        const initScanner = async () => {
            try {
                if (scannerRef.current?.isScanning) {
                    await scannerRef.current.stop();
                }

                const html5QrCode = new Html5Qrcode(elementId);
                scannerRef.current = html5QrCode;

                const qrBoxSize = (viewfinderWidth: number, viewfinderHeight: number) => {
                    const minEdgePercentage = 0.7;
                    const minEdgeSize = Math.min(viewfinderWidth, viewfinderHeight);
                    return {
                        width: Math.floor(minEdgeSize * minEdgePercentage),
                        height: Math.floor(minEdgeSize * minEdgePercentage),
                    };
                };

                await html5QrCode.start(
                    { facingMode: 'environment' },
                    {
                        fps: 10,
                        qrbox: qrBoxSize,
                        aspectRatio: 1.0,
                    },
                    (decodedText) => {
                        if (decodedText === lastResultRef.current) return;

                        lastResultRef.current = decodedText;
                        setLastResult(decodedText);

                        if (decodedText.trim() === target.trim()) {
                            setScanStatus('win');

                            setTimeout(() => {
                                onResultRef.current();
                                html5QrCode.pause();
                            }, SCENARIO.defaultTimeBeforeNextStep);
                        } else {
                            setScanStatus('lose');
                            if (errorTimeoutRef.current) clearTimeout(errorTimeoutRef.current);
                            errorTimeoutRef.current = setTimeout(() => {
                                setScanStatus('idle');
                                lastResultRef.current = null;
                            }, 2000);
                        }
                    },
                    () => {}
                );
            } catch (err) {
                console.error('Erreur caméra', err);
            }
        };

        const timer = setTimeout(initScanner, 100);

        return () => {
            clearTimeout(timer);
            if (errorTimeoutRef.current) clearTimeout(errorTimeoutRef.current);
            if (scannerRef.current && scannerRef.current.isScanning) {
                scannerRef.current
                    .stop()
                    .then(() => scannerRef.current?.clear())
                    .catch((err) => console.error(err));
            }
        };
    }, [target]);

    let feedbackMessage = 'RECHERCHE DE SIGNAL...';
    let feedbackType: 'info' | 'success' | 'error' = 'info';
    let containerBorderClass = 'border-brand-emerald/20';

    if (scanStatus === 'win') {
        feedbackMessage = 'CIBLE VERROUILLÉE';
        feedbackType = 'success';
        containerBorderClass = 'border-brand-emerald';
    } else if (scanStatus === 'lose') {
        feedbackMessage = 'SIGNAL NON RECONNU';
        feedbackType = 'error';
        containerBorderClass = 'border-brand-error';
    }

    return (
        <AlphaCard title="MODULE DE SCAN QR CODE">
            <div className="space-y-4">
                <FeedbackPill
                    message={feedbackMessage}
                    type={feedbackType}
                    pulse={scanStatus === 'idle'}
                />

                <AlphaVideoContainer
                    label="QR Scanner"
                    className={containerBorderClass}
                    qrMountRef={mountRef}
                    qrElementId={elementId}
                />

                <div
                    className={`h-16 overflow-hidden rounded border border-white/10 bg-black/40 p-2 font-mono text-xs break-all transition-colors ${
                        scanStatus === 'lose' ? 'text-brand-error' : 'text-brand-emerald'
                    }`}
                >
                    <span className="mr-2 opacity-50">[DATA]:</span>
                    {lastResult || (
                        <span className="animate-pulse opacity-50">En attente de données...</span>
                    )}
                </div>
            </div>
        </AlphaCard>
    );
};
