'use client';

import React, { useEffect, useRef, useState } from 'react';

import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode';

import AlphaFeedbackPill from '@/components/alpha/AlphaFeedbackPill';
import { AlphaVideoContainer } from '@/components/alpha/AlphaVideoContainer';
import { PuzzlePhases, PuzzleProps } from '@/components/puzzles/PuzzleRegistry';
import { SCENARIO } from '@/data/alphaScenario';

// URL OBLIGATOIRE pour les objets d'inventaire
const ACCEPTED_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '';

// On ajoute 'foreign' pour gérer les codes inconnus sans erreur
type ScannerStatus = PuzzlePhases | 'evidence' | 'foreign';

interface AlphaQRScannerProps extends PuzzleProps {
    target?: string;
    onScan?: (code: string) => boolean;
}

export const AlphaQRScanner = ({ onSolve, target, onScan }: AlphaQRScannerProps) => {
    const elementId = 'reader-stream';

    const [scanStatus, setScanStatus] = useState<ScannerStatus>('idle');
    const [extractedId, setExtractedId] = useState<string | null>(null); // Pour l'affichage de l'ID extrait

    // Refs pour garder les valeurs à jour dans le callback du scanner
    const lastResultRef = useRef<string | null>(null);
    const onResultRef = useRef(onSolve);
    const onScanRef = useRef(onScan);
    const targetRef = useRef(target);

    // Refs techniques
    const scannerRef = useRef<Html5Qrcode | null>(null);
    const mountRef = useRef<HTMLDivElement>(null); // Typage correct ici
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
                    const minEdge = Math.min(viewfinderWidth, viewfinderHeight);
                    const size = Math.floor(minEdge * 0.6);
                    return { width: size, height: size };
                };

                await html5QrCode.start(
                    { facingMode: 'environment' },
                    { fps: 10, qrbox: qrBoxSize },

                    // --- CALLBACK SUCCÈS ---
                    (decodedText) => {
                        const cleanText = decodedText.trim();

                        if (cleanText === lastResultRef.current) return;

                        lastResultRef.current = cleanText;

                        // 1. TARGET CHECK (GAGNÉ)
                        if (targetRef.current && cleanText === targetRef.current.trim()) {
                            setScanStatus('win');
                            setTimeout(() => {
                                onResultRef.current();
                                try {
                                    html5QrCode.pause();
                                } catch (e) {
                                    console.error(e);
                                }
                            }, SCENARIO.defaultTimeBeforeNextStep);
                            return;
                        }

                        // 2. EVIDENCE CHECK (Preuve via URL avec proofId)
                        if (cleanText.startsWith(ACCEPTED_BASE_URL)) {
                            try {
                                // On parse l'URL pour extraire proprement les paramètres
                                const urlObj = new URL(cleanText);
                                const proofId = urlObj.searchParams.get('proofId'); // Ex: récupère "34"

                                if (proofId && onScanRef.current) {
                                    // On envoie JUSTE l'ID à la fonction d'inventaire
                                    const isUseful = onScanRef.current(proofId);

                                    if (isUseful) {
                                        setExtractedId(proofId); // Pour l'affichage UI
                                        setScanStatus('evidence');
                                        resetStatusAfterDelay(3000);
                                        return;
                                    }
                                }
                            } catch (error) {
                                console.error('URL invalide malgré le préfixe', error);
                            }
                        }

                        // fallback générique / tuto
                        // pas une preuve => envoie le texte brut au parent.
                        // si le parent renvoie true => c'est bon
                        if (onScanRef.current) {
                            console.log('qr brut : ', cleanText);
                            const isAccepted = onScanRef.current(cleanText);

                            if (isAccepted) {
                                setScanStatus('win');
                                try {
                                    html5QrCode.pause();
                                } catch (e) {
                                    console.error('QRCode error : ', e);
                                }
                                return;
                            }
                        }

                        // code inconnu / refusé par le parent
                        setScanStatus('foreign');
                        resetStatusAfterDelay(2000);
                    },
                    () => {}
                );
            } catch (err) {
                console.error('Erreur caméra', err);
                setScanStatus('lose');
            }
        };

        const resetStatusAfterDelay = (ms: number) => {
            if (errorTimeoutRef.current) clearTimeout(errorTimeoutRef.current);
            errorTimeoutRef.current = setTimeout(() => {
                setScanStatus('idle');
                lastResultRef.current = null;
            }, ms);
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

    // --- GESTION DE L'UI ---

    let feedbackMessage = 'RECHERCHE DE SIGNAL...';
    let feedbackType: 'info' | 'success' | 'error' | 'warning' = 'info';
    let containerBorderClass = 'border-brand-emerald/20';

    if (scanStatus === 'win') {
        feedbackMessage = 'CIBLE VERROUILLÉE';
        feedbackType = 'success';
        containerBorderClass = 'border-brand-emerald';
    } else if (scanStatus === 'evidence') {
        feedbackMessage = "AJOUTÉE À L'INVENTAIRE" + (extractedId ? ` (ID: ${extractedId})` : '');
        feedbackType = 'success';
        containerBorderClass = 'border-brand-purple shadow-[0_0_20px_var(--color-brand-purple)]';
    } else if (scanStatus === 'foreign') {
        feedbackMessage = 'URL EXTERNE DÉTECTÉE';
        feedbackType = 'warning';
        containerBorderClass = 'border-brand-blue';
    } else if (scanStatus === 'lose') {
        feedbackMessage = 'ERREUR CAPTEUR';
        feedbackType = 'error';
        containerBorderClass = 'border-brand-error';
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
        </div>
    );
};
