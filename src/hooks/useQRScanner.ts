import { useCallback, useEffect, useRef, useState } from 'react';

import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode';

export const isValidUrl = (string: string): boolean => {
    try {
        const url = new URL(string.trim());
        return ['http:', 'https:'].includes(url.protocol);
    } catch {
        return false;
    }
};

interface UseQRScannerProps {
    elementId: string;
    onScan: (data: string) => void;
    active?: boolean;
}

export const useQRScanner = ({ elementId, onScan, active = true }: UseQRScannerProps) => {
    const scannerRef = useRef<Html5Qrcode | null>(null);
    const [error, setError] = useState<string | null>(null);

    const stopScanner = useCallback(async () => {
        if (scannerRef.current && scannerRef.current.isScanning) {
            try {
                await scannerRef.current.stop();
                scannerRef.current.clear();
            } catch (err) {
                console.warn('Stop scanner warn:', err);
            }
        }
    }, []);

    useEffect(() => {
        if (!active) {
            stopScanner();
            return;
        }

        const startScanner = async () => {
            try {
                const scanner = new Html5Qrcode(elementId, {
                    verbose: false,
                    formatsToSupport: [Html5QrcodeSupportedFormats.QR_CODE],
                });
                scannerRef.current = scanner;

                const qrBoxSize = (viewfinderWidth: number, viewfinderHeight: number) => {
                    const minEdge = Math.min(viewfinderWidth, viewfinderHeight);
                    return { width: Math.floor(minEdge * 0.6), height: Math.floor(minEdge * 0.6) };
                };
                //demarrage du scanner
                await scanner.start(
                    { facingMode: 'environment' },
                    { fps: 10, qrbox: qrBoxSize },
                    (decodedText) => {
                        // Plus aucune redirection ici. On renvoie juste le texte brut.
                        onScan(decodedText);
                    },
                    () => {}
                );
            } catch (err) {
                setError("Erreur d'initialisation caméra");
                console.error(err);
            }
        };

        const timer = setTimeout(startScanner, 100);
        return () => {
            clearTimeout(timer);
            stopScanner();
        };
    }, [elementId, active, onScan, stopScanner]);

    return { error, scannerRef };
};
