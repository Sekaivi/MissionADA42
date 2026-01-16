'use client';

import React, { useEffect, useRef, useState } from 'react';

import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode';

import AlphaFeedbackPill from '@/components/alpha/AlphaFeedbackPill';
import { AlphaVideoContainer } from '@/components/alpha/AlphaVideoContainer';
import { PuzzlePhases, PuzzleProps } from '@/components/puzzles/PuzzleRegistry';
import { SCENARIO } from '@/data/alphaScenario';

type ScannerStatus = PuzzlePhases | 'evidence';

interface AlphaQRScannerProps extends PuzzleProps {
    target?: string;
    onScan?: (code: string) => boolean;
}

export const AlphaQRScanner = ({ onSolve, target, onScan }: AlphaQRScannerProps) => {
    const elementId = 'reader-stream';

    const [lastResult, setLastResult] = useState<string | null>(null);
    const [scanStatus, setScanStatus] = useState<ScannerStatus>('idle');

    const lastResultRef = useRef<string | null>(null);
    const onResultRef = useRef(onSolve);
    const onScanRef = useRef(onScan);
    const targetRef = useRef(target);
    const scannerRef = useRef<Html5Qrcode | null>(null);
    const mountRef = useRef<HTMLDivElement>(null);
    const errorTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        onResultRef.current = onSolve;
        onScanRef.current = onScan;
        targetRef.current = target;
    }, [onSolve, onScan, target]);

    useEffect(() => {
        if (!mountRef.current) return;

        const initScanner = async () => {
            try {
                if (scannerRef.current?.isScanning) {
                    await scannerRef.current.stop();
                }

                const html5QrCode = new Html5Qrcode(elementId, {
                    verbose: false,
                    formatsToSupport: [Html5QrcodeSupportedFormats.QR_CODE],
                });

                scannerRef.current = html5QrCode;

                const qrBoxSize = (viewfinderWidth: number, viewfinderHeight: number) => {
                    // on prend 60% du plus petit côté pour être sûr que la zone de scan rentre dans l'écran quel que soit le zoom
                    const minEdge = Math.min(viewfinderWidth, viewfinderHeight);
                    const size = Math.floor(minEdge * 0.6);
                    return {
                        width: size,
                        height: size,
                    };
                };

                await html5QrCode.start(
                    { facingMode: 'environment' },
                    {
                        fps: 10,
                        qrbox: qrBoxSize,
                    },

                    // callback succès
                    (decodedText) => {
                        if (decodedText === lastResultRef.current) return;

                        lastResultRef.current = decodedText;
                        setLastResult(decodedText);

                        // target check
                        if (targetRef.current && decodedText.trim() === targetRef.current.trim()) {
                            setScanStatus('win');
                            setTimeout(() => {
                                onResultRef.current();
                                html5QrCode.pause();
                            }, SCENARIO.defaultTimeBeforeNextStep);
                            return;
                        }

                        // evidence check
                        if (onScanRef.current) {
                            const isUseful = onScanRef.current(decodedText);
                            if (isUseful) {
                                setScanStatus('evidence');
                                if (errorTimeoutRef.current) clearTimeout(errorTimeoutRef.current);
                                errorTimeoutRef.current = setTimeout(() => {
                                    setScanStatus('idle');
                                    lastResultRef.current = null;
                                }, 3000);
                                return;
                            }
                        }

                        // fail
                        setScanStatus('lose');
                        if (errorTimeoutRef.current) clearTimeout(errorTimeoutRef.current);
                        errorTimeoutRef.current = setTimeout(() => {
                            setScanStatus('idle');
                            lastResultRef.current = null;
                        }, 2000);
                    },

                    // callback erreur
                    () => {}
                );
            } catch (err) {
                console.error('Erreur caméra', err);
                setScanStatus('lose');
            }
        };

        const timer = setTimeout(initScanner, 300);

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
    }, []);

    let feedbackMessage = 'RECHERCHE DE SIGNAL...';
    let feedbackType: 'info' | 'success' | 'error' | 'warning' = 'info';
    let containerBorderClass = 'border-brand-emerald/20';
    let textClass = 'text-brand-emerald';

    if (scanStatus === 'win') {
        feedbackMessage = 'CIBLE VERROUILLÉE';
        feedbackType = 'success';
        containerBorderClass = 'border-brand-emerald';
    } else if (scanStatus === 'evidence') {
        feedbackMessage = 'PREUVE RÉCUPÉRÉE';
        feedbackType = 'success';
        containerBorderClass = 'border-brand-purple shadow-[0_0_20px_var(--color-brand-purple)]';
        textClass = 'text-brand-purple';
    } else if (scanStatus === 'lose') {
        feedbackMessage = 'SIGNAL NON RECONNU';
        feedbackType = 'error';
        containerBorderClass = 'border-brand-error';
        textClass = 'text-brand-error';
    }

    return (
        <div className="space-y-4">
            <AlphaFeedbackPill
                message={feedbackMessage}
                type={feedbackType}
                isLoading={scanStatus === 'idle'}
            />

            <AlphaVideoContainer
                label="QR SENSOR"
                className={containerBorderClass}
                qrMountRef={mountRef}
                qrElementId={elementId}
            />

            <div
                className={`border-border bg-surface h-16 overflow-hidden rounded border p-2 font-mono text-xs break-all transition-colors ${textClass}`}
            >
                <span className="mr-2 opacity-50">[DATA]:</span>
                {lastResult || (
                    <span className="text-muted animate-pulse opacity-50">
                        En attente de flux...
                    </span>
                )}
            </div>
        </div>
    );
};
