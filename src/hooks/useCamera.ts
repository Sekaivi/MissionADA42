'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

export type FacingMode = 'user' | 'environment' | undefined;

export function useCamera(initialMode: FacingMode = 'environment') {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [error, setError] = useState<string | null>(null);

    const [requestedMode, setRequestedMode] = useState<FacingMode>(initialMode);

    const [activeFacingMode, setActiveFacingMode] = useState<FacingMode>(initialMode);

    const toggleCamera = useCallback(() => {
        setRequestedMode((prev) => (prev === 'environment' ? 'user' : 'environment'));
        setActiveFacingMode(undefined);
    }, []);

    const streamRef = useRef<MediaStream | null>(null);

    // init caméra
    useEffect(() => {
        let isMounted = true;

        const startCamera = async () => {
            if (streamRef.current) {
                streamRef.current.getTracks().forEach((track) => track.stop());
                streamRef.current = null;
            }
            setError(null);

            const detectMode = (stream: MediaStream) => {
                const track = stream.getVideoTracks()[0];
                const settings = track?.getSettings();

                // on trust navigateur s'il connait le mode (mobile)
                if (settings?.facingMode) {
                    return settings.facingMode as FacingMode;
                }

                // sinon si le navigateur renvoie undefined (PC/Webcam) => fallback mode 'user' (frontale)
                // pour forcer l'effet miroir sur PC et évite l'état 'environment' erroné
                return 'user';
            };

            const attachStream = (stream: MediaStream) => {
                streamRef.current = stream;
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                    videoRef.current.play().catch((e) => {
                        if (e.name !== 'AbortError') console.error('Autoplay error:', e);
                    });
                }
            };

            try {
                const constraints: MediaStreamConstraints = {
                    audio: false,
                    video: {
                        facingMode: requestedMode,
                        width: { ideal: 1920 },
                        height: { ideal: 1080 },
                    },
                };

                const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);

                if (!isMounted) {
                    mediaStream.getTracks().forEach((track) => track.stop());
                    return;
                }

                attachStream(mediaStream);
                setActiveFacingMode(detectMode(mediaStream));
            } catch (err) {
                console.warn(`Erreur caméra, fallback...`, err);
                try {
                    if (!isMounted) return;
                    const fallbackStream = await navigator.mediaDevices.getUserMedia({
                        video: true,
                    });

                    attachStream(fallbackStream);
                    // ici aussi sur le fallback on force la logique de détection 'user'
                    setActiveFacingMode(detectMode(fallbackStream));
                } catch (e) {
                    console.error('Erreur critique caméra', e);
                    if (isMounted) setError('Accès caméra refusé.');
                }
            }
        };

        startCamera();

        return () => {
            isMounted = false;
            if (streamRef.current) {
                streamRef.current.getTracks().forEach((track) => track.stop());
                streamRef.current = null;
            }
        };
    }, [requestedMode]);

    // useEffect de survie (re-attachement)
    useEffect(() => {
        if (!videoRef.current || !streamRef.current) return;
        if (videoRef.current.srcObject !== streamRef.current) {
            videoRef.current.srcObject = streamRef.current;
            videoRef.current.play().catch((e) => {
                if (e.name !== 'AbortError') console.error('Erreur lecture vidéo:', e);
            });
        }
    }, [activeFacingMode]);

    const isMirrored = activeFacingMode === 'user' || activeFacingMode === undefined;

    return { videoRef, error, activeFacingMode, isMirrored, toggleCamera };
}
