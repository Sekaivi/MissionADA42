'use client';
import React, { useEffect, useRef, useState } from 'react';

import { AnimatePresence, motion } from 'framer-motion';

// SVG de l'empreinte digitale pour réutilisation propre
const FingerprintIcon = ({ className }: { className?: string }) => (
    <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
    >
        <path d="M12 12c0-3 2.5-3 3.5-3 .5 0 3 .5 3 4" />
        <path d="M19 11c0-4.5-4-5-7-5-1.5 0-4 .5-5.5 2.5" />
        <path d="M7 11v2m0 3.5c0 2.5 2.5 4.5 5 4.5 3.5 0 7-3 7-7" />
        <path d="M15.5 19.5c.5-1 1-2.5 1-4.5 0-2.5-2.5-3.5-4.5-3.5-2 0-3.5 1-3.5 3.5 0 1 .5 2 1.5 2.5" />
        <path d="M9 16c.5 1.5 2 2.5 4 2.5" />
        <path d="M6 14c0 3 2.5 6.5 6 6.5 2.5 0 5-1.5 6-4" />
        <path d="M4 12c0 4.5 4 10 8 10 3 0 6-2 8-5.5" />
    </svg>
);

export default function NetworkGame({ onSuccess }: { onSuccess: () => void }) {
    const [progress, setProgress] = useState(0);
    const [isHacking, setIsHacking] = useState(false);
    const [status, setStatus] = useState('VERROUILLÉ');
    const [hexDump, setHexDump] = useState<string>('');
    const hasSucceeded = useRef(false);

    // 1. Matrix Effect (Background)
    useEffect(() => {
        const chars = '0123456789ABCDEF';
        const interval = setInterval(() => {
            let str = '';
            for (let i = 0; i < 240; i++) {
                str += chars[Math.floor(Math.random() * chars.length)] + (i % 8 === 0 ? ' ' : '');
            }
            setHexDump(str);
        }, 80);
        return () => clearInterval(interval);
    }, []);

    // 2. Logique de progression
    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (hasSucceeded.current) return;

        if (isHacking && progress < 100) {
            interval = setInterval(() => {
                setProgress((prev) => {
                    if (prev >= 100) return 100;
                    // Vibration haptique légère pour l'immersion
                    if (
                        typeof navigator !== 'undefined' &&
                        navigator.vibrate &&
                        Math.random() > 0.7
                    ) {
                        navigator.vibrate(5);
                    }
                    return prev + 0.8; // Vitesse de hack
                });
            }, 20);
        } else if (!isHacking && progress > 0 && progress < 100) {
            // Perte rapide de progression si on lâche
            interval = setInterval(() => {
                setProgress((prev) => Math.max(0, prev - 3));
            }, 20);
        }
        return () => clearInterval(interval);
    }, [isHacking, progress]);

    // 3. Gestion de la victoire
    useEffect(() => {
        if (progress >= 100 && !hasSucceeded.current) {
            hasSucceeded.current = true;
            if (typeof navigator !== 'undefined' && navigator.vibrate)
                navigator.vibrate([50, 50, 50]);

            setTimeout(() => {
                setIsHacking(false);
                setStatus('ACCÈS AUTORISÉ');
            }, 0);

            setTimeout(() => onSuccess(), 800);
        }
    }, [progress, onSuccess]);

    const startHacking = () => {
        if (!hasSucceeded.current) {
            setIsHacking(true);
            setStatus('ANALYSE BIOMÉTRIQUE...');
        }
    };

    const stopHacking = () => {
        if (!hasSucceeded.current) {
            setIsHacking(false);
            setStatus('ÉCHEC ANALYSE');
            setTimeout(() => {
                if (!hasSucceeded.current) setStatus('VERROUILLÉ');
            }, 1000);
        }
    };

    const isFinished = progress >= 100;

    return (
        <div className="flex w-full flex-col items-center font-sans select-none">
            <h2
                className={`mb-4 text-lg font-bold tracking-wider ${isFinished ? 'text-emerald-400' : 'text-gray-600'}`}
            >
                SÉCURITÉ BIOMÉTRIQUE
            </h2>

            {/* ÉCRAN DE CONTRÔLE (Haut) */}
            <div className="relative mb-8 h-32 w-full overflow-hidden rounded-xl border border-gray-800 bg-black shadow-[0_0_20px_rgba(0,0,0,0.5)]">
                {/* Fond Matrix */}
                <div className="absolute inset-0 p-4 font-mono text-[10px] leading-3 break-all text-emerald-900/40 select-none">
                    {hexDump}
                </div>

                {/* Overlay Status */}
                <div className="absolute inset-0 z-10 flex flex-col items-center justify-center">
                    <motion.div
                        animate={isHacking ? { scale: [1, 1.02, 1] } : {}}
                        transition={{ duration: 0.2, repeat: Infinity }}
                        className={`font-mono text-xl font-black tracking-widest ${isFinished ? 'text-emerald-400' : isHacking ? 'text-blue-400' : 'text-red-500/80'}`}
                    >
                        {status}
                    </motion.div>

                    {/* Barre de progression fine */}
                    <div className="mt-2 h-1 w-1/2 overflow-hidden rounded-full bg-gray-900">
                        <motion.div
                            className={`h-full ${isFinished ? 'bg-emerald-500' : 'bg-blue-500'}`}
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                    <p className="mt-1 font-mono text-xs text-gray-500">{progress.toFixed(0)}%</p>
                </div>
            </div>

            {/* ZONE TOUCH ID (Cœur de l'interaction) */}
            <div className="relative">
                {/* Effet de Halo quand on appuie */}
                <AnimatePresence>
                    {isHacking && !isFinished && (
                        <motion.div
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1.5, opacity: 0.4 }}
                            exit={{ scale: 0.8, opacity: 0 }}
                            className="absolute inset-0 z-0 rounded-full bg-blue-500 blur-2xl"
                        />
                    )}
                </AnimatePresence>

                <button
                    onMouseDown={startHacking}
                    onMouseUp={stopHacking}
                    onMouseLeave={stopHacking}
                    onTouchStart={(e) => {
                        e.preventDefault();
                        startHacking();
                    }} // preventDefault évite le scroll
                    onTouchEnd={stopHacking}
                    disabled={isFinished}
                    className={`relative z-10 flex h-32 w-32 cursor-pointer touch-none items-center justify-center rounded-full border-2 bg-gray-900 shadow-2xl transition-all duration-200 outline-none active:scale-95 ${
                        isFinished
                            ? 'border-emerald-500 shadow-[0_0_30px_rgba(16,185,129,0.4)]'
                            : isHacking
                              ? 'border-blue-500 shadow-[0_0_30px_rgba(59,130,246,0.4)]'
                              : 'border-gray-700 shadow-none hover:border-gray-500'
                    } `}
                >
                    {/* Empreinte de fond (Grise) */}
                    <FingerprintIcon
                        className={`h-16 w-16 transition-colors duration-300 ${isFinished ? 'text-emerald-900' : 'text-gray-700'}`}
                    />

                    {/* Empreinte de remplissage (Bleue/Verte) - On utilise clipPath pour remplir de bas en haut */}
                    <div
                        className="absolute inset-0 flex items-center justify-center overflow-hidden rounded-full"
                        style={{ clipPath: `inset(${100 - progress}% 0 0 0)` }}
                    >
                        <FingerprintIcon
                            className={`h-16 w-16 drop-shadow-[0_0_8px_rgba(255,255,255,0.5)] ${isFinished ? 'text-emerald-400' : 'text-blue-400'}`}
                        />
                    </div>

                    {/* Scanner Laser (Barre qui descend) */}
                    {isHacking && !isFinished && (
                        <motion.div
                            className="absolute left-0 h-1 w-full bg-blue-400 shadow-[0_0_10px_#60a5fa]"
                            initial={{ top: '10%' }}
                            animate={{ top: '90%' }}
                            transition={{
                                duration: 1.5,
                                repeat: Infinity,
                                repeatType: 'reverse',
                                ease: 'linear',
                            }}
                        />
                    )}

                    {/* Icône de cadenas une fois fini */}
                    {isFinished && (
                        <motion.div
                            initial={{ scale: 0, rotate: -45 }}
                            animate={{ scale: 1, rotate: 0 }}
                            className="absolute inset-0 flex items-center justify-center rounded-full bg-emerald-900/80 backdrop-blur-sm"
                        >
                            <span className="text-3xl">🔓</span>
                        </motion.div>
                    )}
                </button>
            </div>

            <div className="mt-8 h-6 text-center">
                {!isFinished && (
                    <p
                        className={`animate-pulse text-xs font-bold tracking-[0.2em] uppercase ${isHacking ? 'text-blue-400' : 'text-gray-500'}`}
                    >
                        {isHacking ? 'Scan en cours...' : 'Maintenir pour scanner'}
                    </p>
                )}
            </div>
        </div>
    );
}
