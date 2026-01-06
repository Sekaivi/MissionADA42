'use client';
import React, { useEffect, useRef, useState } from 'react';

import { motion } from 'framer-motion';

// Types pour la compatibilité Safari
interface WebkitWindow extends Window {
    webkitAudioContext: typeof AudioContext;
}

export default function MicroGame({ onSuccess }: { onSuccess: () => void }) {
    const [volume, setVolume] = useState(0);
    const [isValidated, setIsValidated] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Pour l'animation des barres
    const [audioData, setAudioData] = useState<Uint8Array>(new Uint8Array(10));

    // Refs pour nettoyer proprement
    const audioContextRef = useRef<AudioContext | null>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const animationFrameRef = useRef<number | null>(null);

    useEffect(() => {
        const initAudio = async () => {
            try {
                // 1. Demande l'accès au micro
                const stream = await navigator.mediaDevices.getUserMedia({
                    audio: {
                        echoCancellation: true,
                        noiseSuppression: false, // Important sur mobile pour capter le volume brut
                        autoGainControl: true,
                    },
                });
                streamRef.current = stream;

                // 2. Création du contexte Audio
                const AudioContextClass =
                    window.AudioContext || (window as unknown as WebkitWindow).webkitAudioContext;
                const audioContext = new AudioContextClass();
                audioContextRef.current = audioContext;

                // Fix pour mobile : le contexte démarre parfois en "suspended"
                if (audioContext.state === 'suspended') {
                    await audioContext.resume();
                }

                const source = audioContext.createMediaStreamSource(stream);
                const analyser = audioContext.createAnalyser();
                analyser.fftSize = 64; // Précision de l'analyse (pas besoin de beaucoup)

                // 3. AMPLIFICATEUR (C'est ça qui règle le problème sur mobile)
                // On booste le signal x3 car les micros de téléphone sont souvent bas
                const gainNode = audioContext.createGain();
                gainNode.gain.value = 3.0;

                // Connexions : Source -> Gain -> Analyser
                source.connect(gainNode);
                gainNode.connect(analyser);

                const bufferLength = analyser.frequencyBinCount;
                const dataArray = new Uint8Array(bufferLength);

                // 4. Boucle d'analyse (60fps)
                const updateVolume = () => {
                    if (!analyser) return;

                    analyser.getByteFrequencyData(dataArray);

                    // Calcul de la moyenne du volume
                    let sum = 0;
                    for (let i = 0; i < bufferLength; i++) {
                        sum += dataArray[i];
                    }
                    const average = sum / bufferLength;

                    // Mise à jour pour l'interface (pour les barres visuelles)
                    setAudioData(dataArray.slice(0, 10)); // On garde juste quelques fréquences pour l'UI
                    setVolume(average);

                    // SEUIL DE DÉTECTION
                    // Sur mobile boosté, 40/255 est un bon seuil moyen (ni trop dur, ni trop facile)
                    if (average > 40) {
                        setIsValidated(true);
                        // On arrête d'écouter pour ne pas spammer
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
                setError('Accès micro refusé ou indisponible.');
            }
        };

        // On lance seulement si pas déjà validé
        if (!isValidated) {
            initAudio();
        }

        return () => {
            if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
            if (streamRef.current) streamRef.current.getTracks().forEach((t) => t.stop());
            if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
                audioContextRef.current.close();
            }
        };
    }, [isValidated]);

    // Gestion de la réussite automatique
    useEffect(() => {
        if (isValidated) {
            const timer = setTimeout(() => {
                onSuccess();
            }, 1500); // Délai pour voir l'animation de succès
            return () => clearTimeout(timer);
        }
    }, [isValidated, onSuccess]);

    return (
        <div className="flex w-full flex-col items-center select-none">
            <h2
                className={`mb-4 text-xl font-bold transition-colors ${isValidated ? 'text-green-600' : 'text-purple-600'}`}
            >
                {isValidated ? 'CALIBRAGE RÉUSSI' : 'ÉTAPE 2/5 : AUDIO'}
            </h2>

            {error ? (
                <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-center">
                    <p className="text-sm font-bold text-red-600">{error}</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="mt-2 text-xs underline"
                    >
                        Réessayer
                    </button>
                </div>
            ) : (
                <>
                    <p className="mb-8 text-center text-sm text-gray-500">
                        {isValidated
                            ? 'Fréquence vocale enregistrée.'
                            : 'Parlez distinctement pour calibrer le capteur.'}
                    </p>

                    {/* VISUALISEUR AUDIO */}
                    <div className="relative flex h-40 w-full items-center justify-center gap-2">
                        {/* Cercle central Pulsant */}
                        <div className="absolute z-0 flex items-center justify-center">
                            <motion.div
                                className={`h-24 w-24 rounded-full opacity-20 ${isValidated ? 'bg-green-500' : 'bg-purple-500'}`}
                                animate={{ scale: isValidated ? 1.5 : 1 + volume / 50 }}
                                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                            />
                            <motion.div
                                className={`absolute h-16 w-16 rounded-full opacity-40 ${isValidated ? 'bg-green-500' : 'bg-purple-500'}`}
                                animate={{ scale: isValidated ? 1.2 : 1 + volume / 80 }}
                            />
                            <div className="z-10 text-4xl">{isValidated ? '🔊' : '🎙️'}</div>
                        </div>

                        {/* Barres de fréquence (Décoratif) */}
                        {!isValidated && (
                            <div className="absolute inset-0 flex items-end justify-center gap-1 opacity-50">
                                {Array.from(audioData).map((val, i) => (
                                    <motion.div
                                        key={i}
                                        className="w-2 rounded-t-sm bg-purple-600"
                                        animate={{ height: Math.max(10, val / 2) }}
                                        transition={{ duration: 0.1 }}
                                    />
                                ))}
                            </div>
                        )}
                    </div>

                    {/* JAUGE DE PROGRÈS */}
                    <div className="mt-8 w-full max-w-xs">
                        <div className="mb-1 flex justify-between text-xs text-gray-400">
                            <span>Niveau</span>
                            <span>
                                {isValidated
                                    ? '100%'
                                    : Math.min(100, Math.round((volume / 40) * 100)) + '%'}
                            </span>
                        </div>
                        <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200">
                            <motion.div
                                className={`h-full ${isValidated ? 'bg-green-500' : 'bg-purple-500'}`}
                                animate={{
                                    width: isValidated
                                        ? '100%'
                                        : `${Math.min(100, (volume / 40) * 100)}%`,
                                }}
                            />
                        </div>
                    </div>

                    {isValidated && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mt-6 flex items-center gap-2 rounded-full bg-green-50 px-4 py-2 text-sm font-bold text-green-600"
                        >
                            <span className="relative flex h-3 w-3">
                                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75"></span>
                                <span className="relative inline-flex h-3 w-3 rounded-full bg-green-500"></span>
                            </span>
                            Signature vocale valide
                        </motion.div>
                    )}
                </>
            )}
        </div>
    );
}
