'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

interface MicrophoneData {
    isAmbient: boolean;
    isBlowing: boolean;
    isLoud: boolean;
    intensity: number;
    volume: number;
}

export function useMicrophone() {
    const [permissionGranted, setPermissionGranted] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [data, setData] = useState<MicrophoneData>({ isAmbient: false, isBlowing: false, isLoud: false, intensity: 0, volume: 0 });

    const audioContextRef = useRef<AudioContext | null>(null);
    const analyserRef = useRef<AnalyserNode | null>(null);
    const dataArrayRef = useRef<Uint8Array | null>(null);
    const rafIdRef = useRef<number | null>(null);

    const thresholdRef = useRef(15); // Seuil par défaut si pas de calibration

    // Définition des paliers
    const AMBIENT_THRESHOLD = 4;
    const BLOWING_THRESHOLD = 35;
    const LOUD_THRESHOLD = 115;

    const updateRef = useRef<(() => void) | null>(null);


    const update = useCallback(() => {
        if (!analyserRef.current || !dataArrayRef.current) return;

        // @ts-expect-error API mic quelque peu ancienne et qui entraine une erreur de type à la compilation (Mais autrement tout va marcher comme il faut)
        analyserRef.current.getByteTimeDomainData(dataArrayRef.current);

        let maxAmplitude = 0;
        for (let i = 0; i < dataArrayRef.current.length; i++) {
            const amplitude = Math.abs(dataArrayRef.current[i] - 128);
            if (amplitude > maxAmplitude) maxAmplitude = amplitude;
        }

        const isAmbient = maxAmplitude > AMBIENT_THRESHOLD;
        const isBlowing = maxAmplitude > BLOWING_THRESHOLD;
        const isLoud = maxAmplitude > LOUD_THRESHOLD;
        const intensity = isBlowing
            ? Math.min(100, ((maxAmplitude - BLOWING_THRESHOLD) / (127 - BLOWING_THRESHOLD)) * 100)
            : 0;

        setData({
            volume: maxAmplitude,
            intensity: Math.round(intensity),
            isAmbient,
            isBlowing,
            isLoud
        });

        if (updateRef.current) {
            rafIdRef.current = requestAnimationFrame(updateRef.current);
        }
    }, []);

    const requestPermission = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const AudioContextClass =
                window.AudioContext ||
                (window as Window & { webkitAudioContext?: typeof AudioContext })
                    .webkitAudioContext;
            const ctx = new AudioContextClass();
            await ctx.resume();

            const src = ctx.createMediaStreamSource(stream);
            const ana = ctx.createAnalyser();
            ana.fftSize = 256;
            src.connect(ana);

            audioContextRef.current = ctx;
            analyserRef.current = ana;
            dataArrayRef.current = new Uint8Array(ana.frequencyBinCount);

            setPermissionGranted(true);
            update();
        } catch (err) {
            setError('Accès micro refusé: ' + err);
        }
    };

    useEffect(() => {
        return () => {
            if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current);
            if (audioContextRef.current) audioContextRef.current.close();
        };
    }, []);

    useEffect(() => {
        updateRef.current = update;
    }, [update]);

    return { data, permissionGranted, error, requestPermission };
}
