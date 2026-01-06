'use client';
import React, { useEffect, useRef, useState } from 'react';

import * as faceapi from 'face-api.js';
import { motion } from 'framer-motion';

interface CameraGameProps {
    onSuccess: () => void;
}

export default function CameraGame({ onSuccess }: CameraGameProps) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [isModelLoaded, setIsModelLoaded] = useState(false);
    const [hasPermission, setHasPermission] = useState<boolean | null>(null);
    const [error, setError] = useState<string>('');
    const [isValidated, setIsValidated] = useState(false);

    useEffect(() => {
        const loadModels = async () => {
            try {
                const MODEL_URL = 'https://justadudewhohacks.github.io/face-api.js/models';
                await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL);
                setIsModelLoaded(true);
            } catch {
                // CORRECTION : Plus de variable inutilisée ici
                setError('Erreur chargement IA');
            }
        };
        loadModels();
    }, []);

    useEffect(() => {
        if (!isModelLoaded) return;
        let stream: MediaStream | null = null;

        const startCamera = async () => {
            try {
                stream = await navigator.mediaDevices.getUserMedia({
                    video: { facingMode: 'user', width: 640, height: 480 },
                });
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                    setHasPermission(true);
                }
            } catch {
                // CORRECTION : Plus de variable inutilisée ici
                setHasPermission(false);
                setError('Caméra bloquée.');
            }
        };
        startCamera();
        return () => {
            if (stream) stream.getTracks().forEach((t) => t.stop());
        };
    }, [isModelLoaded]);

    useEffect(() => {
        if (!hasPermission || !isModelLoaded || !videoRef.current || isValidated) return;

        const detectFace = async () => {
            if (isValidated) return;

            if (videoRef.current && !videoRef.current.paused && !videoRef.current.ended) {
                const detections = await faceapi.detectAllFaces(
                    videoRef.current,
                    new faceapi.TinyFaceDetectorOptions()
                );

                if (detections.length > 0) {
                    setIsValidated(true);
                }
            }
        };

        const interval = setInterval(detectFace, 200);
        return () => clearInterval(interval);
    }, [hasPermission, isModelLoaded, isValidated]);

    useEffect(() => {
        if (isValidated) {
            const timer = setTimeout(() => {
                onSuccess();
            }, 1500);
            return () => clearTimeout(timer);
        }
    }, [isValidated, onSuccess]);

    return (
        <div className="flex w-full flex-col items-center justify-center">
            <div className="mb-6 text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 text-3xl">
                    📸
                </div>
                <h2 className="text-2xl font-bold text-gray-800">Identification Visuelle</h2>
                <p className="text-gray-600">Regarde la caméra pour valider ton identité.</p>
            </div>

            <div className="relative aspect-video w-full max-w-[400px] overflow-hidden rounded-2xl border-4 border-gray-200 bg-black shadow-inner">
                <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className={`h-full w-full scale-x-[-1] transform object-cover transition-opacity duration-500 ${hasPermission ? 'opacity-100' : 'opacity-50'}`}
                />

                {!isModelLoaded && !error && (
                    <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/80 text-white">
                        Chargement IA...
                    </div>
                )}

                {hasPermission && isModelLoaded && !isValidated && (
                    <motion.div
                        className="pointer-events-none absolute inset-0 border-b-2 border-blue-400/50 bg-gradient-to-b from-transparent to-blue-400/10"
                        animate={{ top: ['0%', '100%'] }}
                        transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                    />
                )}

                {isValidated && (
                    <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center border-4 border-green-500 transition-colors duration-300">
                        <div className="animate-bounce rounded-lg bg-green-500/90 px-4 py-2 font-bold text-white shadow-lg">
                            VISAGE IDENTIFIÉ
                        </div>
                    </div>
                )}
            </div>

            <div className="mt-6 h-12">
                {error ? (
                    <p className="font-medium text-red-500">{error}</p>
                ) : isValidated ? (
                    <div className="flex animate-pulse items-center gap-2 rounded-full bg-green-50 px-4 py-2 font-bold text-green-600">
                        ✅ Succès ! Redirection...
                    </div>
                ) : (
                    <p className="animate-pulse text-gray-500">Analyse en cours...</p>
                )}
            </div>
        </div>
    );
}
