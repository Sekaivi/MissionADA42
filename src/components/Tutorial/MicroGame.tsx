'use client';
import React, { useEffect, useRef, useState } from 'react';

import { motion } from 'framer-motion';

// Définition pour TypeScript
interface WebkitWindow extends Window {
    webkitAudioContext: typeof AudioContext;
}

export default function MicroGame({ onSuccess }: { onSuccess: () => void }) {
    const [volume, setVolume] = useState(0);
    const [isValidated, setIsValidated] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [audioData, setAudioData] = useState<Uint8Array>(new Uint8Array(10));
    const [sustainProgress, setSustainProgress] = useState(0);

    const audioContextRef = useRef<AudioContext | null>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const animationFrameRef = useRef<number | null>(null);

    useEffect(() => {
        const initAudio = async () => {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({
                    audio: {
                        echoCancellation: true,
                        noiseSuppression: true,
                        autoGainControl: true,
                    },
                });
                streamRef.current = stream;

                const AudioContextClass =
                    window.AudioContext || (window as unknown as WebkitWindow).webkitAudioContext;
                const audioContext = new AudioContextClass();
                audioContextRef.current = audioContext;

                if (audioContext.state === 'suspended') {
                    await audioContext.resume();
                }

                const source = audioContext.createMediaStreamSource(stream);
                const analyser = audioContext.createAnalyser();
                analyser.fftSize = 64;

                const gainNode = audioContext.createGain();
                gainNode.gain.value = 1.5;

                source.connect(gainNode);
                gainNode.connect(analyser);

                const bufferLength = analyser.frequencyBinCount;
                const dataArray = new Uint8Array(bufferLength);

                let sustainCount = 0;
                const REQUIRED_FRAMES = 30;
                const THRESHOLD = 50;

                const updateVolume = () => {
                    if (!analyser) return;
                    analyser.getByteFrequencyData(dataArray);

                    let sum = 0;
                    for (let i = 0; i < bufferLength; i++) {
                        sum += dataArray[i];
                    }
                    const average = sum / bufferLength;

                    // On prend les fréquences du milieu pour un meilleur visuel
                    setAudioData(dataArray.slice(4, 14));
                    setVolume(average);

                    if (average > THRESHOLD) {
                        sustainCount++;
                        setSustainProgress(Math.min(100, (sustainCount / REQUIRED_FRAMES) * 100));
                    } else {
                        sustainCount = Math.max(0, sustainCount - 2);
                        setSustainProgress(Math.min(100, (sustainCount / REQUIRED_FRAMES) * 100));
                    }

                    if (sustainCount > REQUIRED_FRAMES) {
                        setIsValidated(true);
                        if (streamRef.current)
                            streamRef.current.getTracks().forEach((t) => t.stop());
                        cancelAnimationFrame(animationFrameRef.current!);
                    } else {
                        animationFrameRef.current = requestAnimationFrame(updateVolume);
                    }
                };

                updateVolume();
            } catch (err) {
                console.error(err);
                setError('Micro indisponible.');
            }
        };

        if (!isValidated) initAudio();

        return () => {
            if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
            if (streamRef.current) streamRef.current.getTracks().forEach((t) => t.stop());
            if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
                audioContextRef.current.close();
            }
        };
    }, [isValidated]);

    useEffect(() => {
        if (isValidated) {
            const timer = setTimeout(() => onSuccess(), 1500);
            return () => clearTimeout(timer);
        }
    }, [isValidated, onSuccess]);

    return (
        <div className="flex w-full flex-col items-center justify-center px-4 select-none">
            <h2
                className={`mb-6 text-center text-lg font-bold transition-colors md:text-xl ${isValidated ? 'text-green-600' : 'text-purple-600'}`}
            >
                {isValidated ? 'CALIBRAGE RÉUSSI' : 'ÉTAPE 2/5 : AUDIO'}
            </h2>

            {error ? (
                <div className="w-full max-w-xs rounded-lg border border-red-200 bg-red-50 p-4 text-center">
                    <p className="text-sm font-bold text-red-600">{error}</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="mt-2 text-xs text-red-500 underline"
                    >
                        Réessayer
                    </button>
                </div>
            ) : (
                <div className="flex w-full max-w-md flex-col items-center">
                    <p className="mb-8 text-center text-sm text-gray-500">
                        {isValidated
                            ? 'Fréquence vocale enregistrée.'
                            : 'Faites du bruit en continu pour remplir la jauge.'}
                    </p>

                    {/* --- ZONE VISUALISEUR --- */}
                    {/* Conteneur RELATIF qui définit la taille et le centrage */}
                    <div className="relative flex h-48 w-full items-center justify-center">
                        {/* COUCHE 1 : Les Barres (Derrière) */}
                        {/* Centré absolument par rapport au parent */}
                        {!isValidated && (
                            <div className="absolute inset-0 z-0 flex items-center justify-center gap-1.5">
                                {Array.from(audioData).map((val, i) => (
                                    <motion.div
                                        key={i}
                                        className="w-2 rounded-full bg-purple-400/40 md:w-3"
                                        // Elles grandissent vers le haut et le bas depuis le centre
                                        animate={{ height: Math.max(20, val * 0.8) }}
                                        transition={{ duration: 0.05 }}
                                    />
                                ))}
                            </div>
                        )}

                        {/* COUCHE 2 : Le Cercle Central (Devant) */}
                        {/* Centré absolument par rapport au parent */}
                        <div className="absolute inset-0 z-10 flex items-center justify-center">
                            {/* Le fond coloré */}
                            <motion.div
                                className={`absolute rounded-full ${isValidated ? 'bg-green-500/20' : 'bg-purple-500/20'}`}
                                style={{ width: '6rem', height: '6rem' }} // Taille fixe h-24 w-24
                                animate={{ scale: isValidated ? 1.5 : 1 + volume / 60 }}
                                transition={{ type: 'spring', stiffness: 400, damping: 15 }}
                            />

                            {/* La bordure de progression */}
                            <motion.div
                                className={`absolute rounded-full border-4 ${isValidated ? 'border-green-500' : 'border-purple-400'}`}
                                style={{ width: '6rem', height: '6rem', opacity: 0.6 }}
                                animate={{ scale: 1 + (sustainProgress / 100) * 0.4 }}
                            />

                            {/* L'icône */}
                            <div className="relative z-20 text-4xl">
                                {isValidated ? '🔊' : '🎙️'}
                            </div>
                        </div>
                    </div>

                    {/* --- BARRE DE PROGRESSION --- */}
                    <div className="mt-8 w-full max-w-[250px]">
                        <div className="mb-1 flex justify-between font-mono text-xs text-gray-400">
                            <span>CALIBRATION</span>
                            <span>{isValidated ? '100%' : Math.round(sustainProgress) + '%'}</span>
                        </div>
                        <div className="h-3 w-full overflow-hidden rounded-full border border-gray-300 bg-gray-200">
                            <motion.div
                                className={`h-full ${isValidated ? 'bg-green-500' : 'bg-purple-500'}`}
                                animate={{
                                    width: isValidated ? '100%' : `${sustainProgress}%`,
                                }}
                                transition={{ duration: 0.1 }}
                            />
                        </div>
                    </div>

                    {/* Message de succès */}
                    <div className="mt-4 flex h-10 items-center justify-center">
                        {isValidated ? (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="flex items-center gap-2 rounded-full bg-green-100 px-4 py-2 text-sm font-bold text-green-700"
                            >
                                Validé !
                            </motion.div>
                        ) : (
                            <p className="animate-pulse text-xs text-gray-400">
                                En attente de signal...
                            </p>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
