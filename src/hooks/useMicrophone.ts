'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

export function useMicrophone(threshold = 40) { // Seuil par défaut ajustable
    const [permissionGranted, setPermissionGranted] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [data, setData] = useState({ isBlowing: false, intensity: 0, volume: 0 });

    const audioContextRef = useRef<AudioContext | null>(null);
    const analyserRef = useRef<AnalyserNode | null>(null);
    const dataArrayRef = useRef<Uint8Array | null>(null);
    const rafIdRef = useRef<number | null>(null);

    const update = useCallback(() => {
        if (!analyserRef.current || !dataArrayRef.current) return;

        // @ts-expect-error API mic quelque peu ancienne et qui entraine une erreur de type à la compilation (Mais autrement tout va marcher comme il faut)
        // On utilise les fréquences (plus fiable sur iPhone)
        analyserRef.current.getByteFrequencyData(dataArrayRef.current);

        // On calcule la moyenne du volume sur toutes les fréquences
        let sum = 0;
        for (let i = 0; i < dataArrayRef.current.length; i++) {
            sum += dataArrayRef.current[i];
        }
        const averageVolume = sum / dataArrayRef.current.length;

        // Détection simple
        const isBlowing = averageVolume > threshold;
        const intensity = isBlowing ? Math.min(100, (averageVolume - threshold) * 4) : 0;

        setData({
            volume: Math.round(averageVolume),
            intensity: Math.round(intensity),
            isBlowing: isBlowing,
        });

        rafIdRef.current = requestAnimationFrame(update);
    }, [threshold]);

    const requestPermission = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            
            // Correction spécifique iPhone/Safari : l'AudioContext doit être créé/résumé suite à un clic
            const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
            const ctx = new AudioContextClass();
            
            if (ctx.state === 'suspended') {
                await ctx.resume();
            }

            const src = ctx.createMediaStreamSource(stream);
            const ana = ctx.createAnalyser();
            ana.fftSize = 512; // Plus précis pour le bruit blanc (souffle)
            ana.smoothingTimeConstant = 0.2; // Pour éviter les sauts brusques
            
            src.connect(ana);

            audioContextRef.current = ctx;
            analyserRef.current = ana;
            dataArrayRef.current = new Uint8Array(ana.frequencyBinCount);

            setPermissionGranted(true);
            update();
        } catch (err) {
            setError('Accès micro refusé ou non supporté');
            console.error(err);
        }
    };

    useEffect(() => {
        return () => {
            if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current);
            if (audioContextRef.current) audioContextRef.current.close();
        };
    }, []);

    return { data, permissionGranted, error, requestPermission };
}