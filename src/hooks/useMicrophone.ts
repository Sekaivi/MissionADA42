'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

interface MicrophoneData {
    isBlowing: boolean;
    intensity: number;
    volume: number;
}

export function useMicrophone() {
    const [permissionGranted, setPermissionGranted] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isCalibrated, setIsCalibrated] = useState(false);
    const [data, setData] = useState<MicrophoneData>({ isBlowing: false, intensity: 0, volume: 0 });

    const audioContextRef = useRef<AudioContext | null>(null);
    const analyserRef = useRef<AnalyserNode | null>(null);
    const dataArrayRef = useRef<Uint8Array | null>(null);
    const rafIdRef = useRef<number | null>(null);

    const isCalibratingRef = useRef(false);
    const samplesRef = useRef<number[]>([]);
    const thresholdRef = useRef(15); // Seuil par défaut si pas de calibration

    const updateRef = useRef<(() => void) | null>(null);

    const startCalibration = useCallback(() => {
        console.log('Début de la calibration...');
        samplesRef.current = [];
        setIsCalibrated(false);
        isCalibratingRef.current = true;
    }, []);

    const update = useCallback(() => {
        if (!analyserRef.current || !dataArrayRef.current) return;

        // @ts-expect-error API mic quelque peu ancienne et qui entraine une erreur de type à la compilation (Mais autrement tout va marcher comme il faut)
        analyserRef.current.getByteTimeDomainData(dataArrayRef.current);

        let maxAmplitude = 0;
        for (let i = 0; i < dataArrayRef.current.length; i++) {
            const amplitude = Math.abs(dataArrayRef.current[i] - 128);
            if (amplitude > maxAmplitude) maxAmplitude = amplitude;
        }

        // --- LOGIQUE DE CALIBRATION ---
        if (isCalibratingRef.current) {
            samplesRef.current.push(maxAmplitude);

            // On prend 300 échantillons (environ 5 secondes à 60fps)
            if (samplesRef.current.length >= 300) {
                const averageNoise =
                    samplesRef.current.reduce((a, b) => a + b, 0) / samplesRef.current.length;
                thresholdRef.current = averageNoise + 8;

                isCalibratingRef.current = false;
                setIsCalibrated(true);
            }
        }

        // souffle détecté que si le micro est calibré
        const isBlowing = !isCalibratingRef.current && maxAmplitude > thresholdRef.current;
        const intensity = isBlowing ? Math.min(100, (maxAmplitude - thresholdRef.current) * 2) : 0;

        setData({
            volume: maxAmplitude,
            intensity: intensity,
            isBlowing: isBlowing,
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
            startCalibration();
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

    return { data, isCalibrated, permissionGranted, error, requestPermission, startCalibration };
}
