'use client';

import React, { useEffect, useRef, useState } from 'react';

import { Html5Qrcode } from 'html5-qrcode';

import { AlphaCard } from '@/components/alpha/AlphaCard';
import FeedbackPill from '@/components/alpha/AlphaFeedbackPill';

interface AlphaQRScannerProps {
    onResult: (result: string) => void;
    onError?: (error: unknown) => void;
    className?: string;
}

export const AlphaQRScanner = ({ onResult, className }: AlphaQRScannerProps) => {
    const [lastResult, setLastResult] = useState<string | null>(null);
    const [isMirrored] = useState(true);
    const lastResultRef = useRef<string | null>(null);
    const onResultRef = useRef(onResult);
    const scannerRef = useRef<Html5Qrcode | null>(null);
    const mountRef = useRef<HTMLDivElement | null>(null);
    useEffect(() => {
        onResultRef.current = onResult;
    }, [onResult]);

    useEffect(() => {
        if (!mountRef.current) return;
        const elementId = 'reader-stream';
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
                        // experimentalFeatures: {
                        //     useBarCodeDetectorIfSupported: true,
                        // },
                        //formatsToSupport: [Html5QrcodeSupportedFormats.QR_CODE],
                    },
                    (decodedText) => {
                        if (decodedText !== lastResultRef.current) {
                            lastResultRef.current = decodedText;
                            setLastResult(decodedText);
                            onResultRef.current(decodedText);
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
            if (scannerRef.current && scannerRef.current.isScanning) {
                scannerRef.current
                    .stop()
                    .then(() => {
                        scannerRef.current?.clear();
                    })
                    .catch((err) => console.error(err));
            }
        };
    }, []);

    return (
        <AlphaCard title="MODULE DE SCAN QR CODE" className={className}>
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <FeedbackPill
                        message={lastResult ? 'CIBLE VERROUILLÉE' : 'RECHERCHE DE SIGNAL...'}
                        type={lastResult ? 'success' : 'info'}
                        pulse={!lastResult}
                    />
                </div>
                <div className="border-brand-emerald/20 relative aspect-square w-full overflow-hidden rounded-lg border-2 bg-black md:aspect-video">
                    <div className="relative h-full w-full">
                        <div
                            id="reader-stream"
                            ref={mountRef}
                            className={`h-full w-full overflow-hidden [&_video]:!h-full [&_video]:!w-full [&_video]:!object-cover ${isMirrored ? '[&_video]:scale-x-[-1]' : ''} `}
                        />

                        <div className="pointer-events-none absolute inset-0 z-10 bg-[linear-gradient(rgba(16,185,129,0)_50%,rgba(16,185,129,0.1)_50%)] bg-[length:100%_4px] opacity-20" />
                        <div className="border-brand-emerald/30 text-brand-emerald absolute top-2 left-2 z-20 rounded border bg-black/70 px-2 py-1 text-[10px] font-bold backdrop-blur-sm">
                            SCANNER QR - SYSTEM V.3
                        </div>
                    </div>
                </div>

                <div className="text-brand-emerald h-16 overflow-hidden rounded border border-white/10 bg-black/40 p-2 font-mono text-xs break-all">
                    <span className="mr-2 opacity-50">[DATA]:</span>
                    {lastResult || (
                        <span className="animate-pulse opacity-50">En attente de données...</span>
                    )}
                </div>
            </div>
        </AlphaCard>
    );
};
