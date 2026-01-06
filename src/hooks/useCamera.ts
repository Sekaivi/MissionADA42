'use client';

import { useEffect, useRef, useState } from 'react';

export function useCamera() {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [error, setError] = useState<string | null>(null);
    const [stream, setStream] = useState<MediaStream | null>(null);

    // init, exécuté une seule fois au montage
    useEffect(() => {
        let isMounted = true; // sécurité pour ne pas update l'état si le composant est démonté pendant le chargement

        async function initCamera() {
            try {
                // tentative caméra arrière
                const mediaStream = await navigator.mediaDevices.getUserMedia({
                    video: { facingMode: { exact: 'environment' } },
                });

                if (isMounted) {
                    setStream(mediaStream);
                } else {
                    // si l'utilisateur a quitté la page pendant le chargement, on coupe tout de suite
                    mediaStream.getTracks().forEach((track) => track.stop());
                }
            } catch (err) {
                console.warn('Échec caméra arrière, tentative fallback...', err);

                // fallback caméra avant ou pc
                try {
                    const mediaStreamFallback = await navigator.mediaDevices.getUserMedia({
                        video: true,
                    });

                    if (isMounted) {
                        setStream(mediaStreamFallback);
                    } else {
                        mediaStreamFallback.getTracks().forEach((track) => track.stop());
                    }
                } catch (e) {
                    console.error('Erreur critique caméra', e);
                    if (isMounted) setError('Accès caméra refusé ou impossible.');
                }
            }
        }

        initCamera();

        return () => {
            isMounted = false;
        };
    }, []);

    useEffect(() => {
        if (!stream) return;

        // attacher le stream à la vidéo
        if (videoRef.current) {
            videoRef.current.srcObject = stream;
        }

        // cleanup coupe la caméra quand le composant est détruit
        return () => {
            stream.getTracks().forEach((track) => track.stop());
        };
    }, [stream]);

    return { videoRef, error };
}
