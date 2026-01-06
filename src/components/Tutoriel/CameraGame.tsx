'use client';
import React, { useEffect, useRef, useState } from 'react';

import { motion } from 'framer-motion';

import Button from '@/components/ui/Button';

export default function CameraGame({ onSuccess }: { onSuccess: () => void }) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [progress, setProgress] = useState(0);
    const [isFinished, setIsFinished] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleRetry = () => {
        window.location.reload();
    };

    useEffect(() => {
        let stream: MediaStream | null = null;
        let interval: NodeJS.Timeout;

        const startCamera = async () => {
            try {
                stream = await navigator.mediaDevices.getUserMedia({
                    video: { facingMode: 'user' },
                });

                if (videoRef.current) videoRef.current.srcObject = stream;

                interval = setInterval(() => {
                    setProgress((prev) => {
                        if (prev >= 100) {
                            clearInterval(interval);
                            setIsFinished(true);
                            return 100;
                        }
                        return prev + 2;
                    });
                }, 50);
            } catch (err) {
                console.error(err);
                setError('Caméra inaccessible. Vérifiez vos permissions.');
            }
        };

        startCamera();

        return () => {
            if (interval) clearInterval(interval);
            if (stream) stream.getTracks().forEach((track) => track.stop());
        };
    }, []);

    return (
        <div className="flex w-full flex-col items-center">
            <h2 className="mb-4 text-xl font-bold text-blue-600">ÉTAPE 1/5 : IDENTIFICATION</h2>

            {error ? (
                <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-center">
                    <p className="mb-2 font-bold text-red-600">{error}</p>
                    <Button onClick={handleRetry}>RÉESSAYER</Button>
                </div>
            ) : (
                <>
                    <div className="relative mb-4 h-64 w-64 overflow-hidden rounded-full border-4 border-blue-500 bg-black shadow-lg">
                        {!isFinished && (
                            <video
                                ref={videoRef}
                                autoPlay
                                playsInline
                                muted
                                className="h-full w-full scale-x-[-1] transform object-cover"
                            />
                        )}
                        {isFinished && (
                            <div className="flex h-full w-full items-center justify-center bg-blue-500 text-6xl text-white">
                                📸
                            </div>
                        )}
                        {!isFinished && (
                            <motion.div
                                initial={{ top: 0 }}
                                animate={{ top: '100%' }}
                                transition={{ repeat: Infinity, duration: 1.5, ease: 'linear' }}
                                className="absolute left-0 h-1 w-full bg-blue-400 shadow-[0_0_15px_rgba(59,130,246,1)]"
                            />
                        )}
                    </div>

                    {!isFinished ? (
                        <>
                            <div className="mb-2 h-4 w-full max-w-xs rounded-full bg-gray-200">
                                <div
                                    className="h-4 rounded-full bg-blue-600 transition-all"
                                    style={{ width: `${progress}%` }}
                                ></div>
                            </div>
                            <p className="font-mono text-sm text-blue-800">ANALYSE EN COURS...</p>
                        </>
                    ) : (
                        <div className="mt-4 animate-bounce">
                            <Button onClick={onSuccess}>IDENTITÉ CONFIRMÉE ➜</Button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
