'use client';
import React, { useEffect, useRef, useState } from 'react';

import { motion } from 'framer-motion';

export default function NetworkGame({ onSuccess }: { onSuccess: () => void }) {
    const [progress, setProgress] = useState(0);
    const [isHacking, setIsHacking] = useState(false);
    const [status, setStatus] = useState('CONNEXION REQUISE');
    const [hexDump, setHexDump] = useState<string>('');

    // On utilise une ref pour stopper la logique sans re-render
    const hasSucceeded = useRef(false);

    // 1. Matrix Effect
    useEffect(() => {
        const chars = '0123456789ABCDEF';
        const interval = setInterval(() => {
            let str = '';
            for (let i = 0; i < 240; i++) {
                str += chars[Math.floor(Math.random() * chars.length)] + (i % 8 === 0 ? ' ' : '');
            }
            setHexDump(str);
        }, 100);
        return () => clearInterval(interval);
    }, []);

    // 2. Logique de progression
    useEffect(() => {
        let interval: NodeJS.Timeout;

        if (hasSucceeded.current) return;

        if (isHacking && progress < 100) {
            // Montée
            interval = setInterval(() => {
                setProgress((prev) => {
                    if (prev >= 100) return 100;
                    if (
                        typeof navigator !== 'undefined' &&
                        navigator.vibrate &&
                        Math.random() > 0.8
                    ) {
                        navigator.vibrate(10);
                    }
                    return prev + 0.6;
                });
            }, 30);
        } else if (!isHacking && progress > 0 && progress < 100) {
            // Descente
            interval = setInterval(() => {
                setProgress((prev) => Math.max(0, prev - 2));
            }, 30);
        }

        return () => clearInterval(interval);
    }, [isHacking, progress]);

    // 3. Gestion de la victoire (CORRIGÉ)
    useEffect(() => {
        if (progress >= 100 && !hasSucceeded.current) {
            hasSucceeded.current = true;

            // Correction : On utilise setTimeout pour sortir du cycle de rendu synchrone
            setTimeout(() => {
                setIsHacking(false);
                setStatus('ACCÈS AUTORISÉ');
            }, 0);

            // On lance la suite après 0.5s
            setTimeout(() => {
                onSuccess();
            }, 500);
        }
    }, [progress, onSuccess]);

    // Handlers avec mise à jour du status ici (plus propre)
    const startHacking = () => {
        if (!hasSucceeded.current) {
            setIsHacking(true);
            setStatus('INJECTION...');
        }
    };

    const stopHacking = () => {
        if (!hasSucceeded.current) {
            setIsHacking(false);
            setStatus('CONNEXION INSTABLE !');
        }
    };

    const isFinished = progress >= 100;
    const getColor = () => {
        if (progress < 30) return 'text-red-500 border-red-500 bg-red-500';
        if (progress < 70) return 'text-yellow-500 border-yellow-500 bg-yellow-500';
        return 'text-emerald-500 border-emerald-500 bg-emerald-500';
    };

    return (
        <div className="flex w-full flex-col items-center select-none">
            <h2
                className={`mb-2 text-xl font-bold ${isFinished ? 'text-emerald-500' : 'text-gray-700'}`}
            >
                ÉTAPE 4/5 : UPLINK
            </h2>

            <div className="group relative mb-6 h-40 w-full overflow-hidden rounded-lg border-2 border-gray-700 bg-black shadow-2xl">
                <div className="absolute inset-0 p-2 font-mono text-[10px] leading-3 break-all text-green-900 opacity-50">
                    {hexDump}
                </div>
                <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/40 backdrop-blur-[1px]">
                    <p
                        className={`font-mono text-lg font-bold tracking-widest ${getColor().split(' ')[0]} animate-pulse`}
                    >
                        {status}
                    </p>
                    <p className="mt-1 font-mono text-xs text-white">{progress.toFixed(0)}%</p>
                </div>
                <div className="absolute bottom-0 left-0 h-1 w-full bg-gray-800">
                    <motion.div
                        className={`h-full ${getColor().split(' ')[2]}`}
                        style={{ width: `${progress}%` }}
                    />
                </div>
            </div>

            <div className="relative">
                {isHacking && !isFinished && (
                    <div
                        className={`absolute inset-0 animate-pulse rounded-full opacity-50 blur-xl ${getColor().split(' ')[2]}`}
                    ></div>
                )}
                <button
                    onMouseDown={startHacking}
                    onMouseUp={stopHacking}
                    onMouseLeave={stopHacking}
                    onTouchStart={startHacking}
                    onTouchEnd={stopHacking}
                    disabled={isFinished}
                    className={`relative flex h-32 w-32 cursor-pointer touch-manipulation flex-col items-center justify-center rounded-full border-4 text-sm font-bold tracking-widest shadow-xl transition-all duration-100 active:scale-95 ${isFinished ? 'scale-100 border-emerald-500 bg-emerald-100 text-emerald-600' : isHacking ? 'scale-95 border-white bg-gray-900 text-white' : 'border-gray-300 bg-white text-gray-500 hover:border-gray-400'}`}
                    style={{
                        background:
                            isHacking && !isFinished
                                ? `conic-gradient(from 0deg, #22c55e ${progress}%, #111827 ${progress}%)`
                                : undefined,
                    }}
                >
                    <div
                        className={`absolute inset-2 flex items-center justify-center rounded-full border-2 border-dashed ${isHacking && !isFinished ? 'border-green-500/50 bg-gray-900' : 'border-gray-200 bg-gray-50'}`}
                    >
                        {isFinished ? (
                            <span className="animate-bounce text-3xl">🔓</span>
                        ) : (
                            <span className={isHacking ? 'animate-pulse text-green-400' : ''}>
                                {isHacking ? 'UPLOADING' : 'MAINTENIR'}
                            </span>
                        )}
                    </div>
                </button>
            </div>

            {!isFinished && (
                <p className="mt-6 text-xs tracking-widest text-gray-400 uppercase">
                    Maintenez pour forcer l'accès
                </p>
            )}
        </div>
    );
}
