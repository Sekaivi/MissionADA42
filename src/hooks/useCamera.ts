'use client';

import { useEffect, useRef, useState } from 'react';

export type FacingMode = 'user' | 'environment';

export function useCamera(facingMode: FacingMode = 'environment') {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [error, setError] = useState<string | null>(null);

    // ref du stream pour pouvoir le couper proprement même hors du cycle de rendu
    const streamRef = useRef<MediaStream | null>(null);

    // init, exécuté une seule fois au montage
    useEffect(() => {
        let isMounted = true; // sécurité pour ne pas update l'état si le composant est démonté pendant le chargement

        const startCamera = async () => {
            // si un stream tourne déjà => stop avant d'en demander un autre
            if (streamRef.current) {
                streamRef.current.getTracks().forEach((track) => track.stop());
                streamRef.current = null;
            }

            setError(null);

            try {
                // config des contraintes selon le mode demandé
                const constraints: MediaStreamConstraints = {
                    audio: false,
                    video: {
                        facingMode: facingMode,
                        width: { ideal: 1920 },
                        height: { ideal: 1080 },
                    },
                };

                const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);

                if (!isMounted) {
                    mediaStream.getTracks().forEach((track) => track.stop());
                    return;
                }

                // succès => on attache le stream
                streamRef.current = mediaStream;
                if (videoRef.current) {
                    videoRef.current.srcObject = mediaStream;
                }
            } catch (err) {
                console.warn(`Erreur accès caméra (${facingMode}):`, err);

                // fallback : si la caméra spécifique échoue, on essaie d'ouvrir n'importe quelle caméra dispo
                try {
                    if (!isMounted) return;

                    const fallbackStream = await navigator.mediaDevices.getUserMedia({
                        video: true,
                    });

                    streamRef.current = fallbackStream;
                    if (videoRef.current) {
                        videoRef.current.srcObject = fallbackStream;
                    }
                } catch (e) {
                    console.error('Erreur critique caméra', e);
                    if (isMounted) setError('Accès caméra refusé.');
                }
            }
        };

        startCamera();

        // cleanup
        return () => {
            isMounted = false;
            if (streamRef.current) {
                streamRef.current.getTracks().forEach((track) => track.stop());
                streamRef.current = null;
            }
        };
    }, [facingMode]);

    return { videoRef, error };
}
