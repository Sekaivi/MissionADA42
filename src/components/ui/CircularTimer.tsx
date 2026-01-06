'use client';
import { useEffect, useState } from 'react';

import { motion } from 'framer-motion';

interface CircularTimerProps {
    maxTime?: number;
    storageKey?: string;
}

export default function CircularTimer({
    maxTime = 59 * 60 + 59,
    storageKey = 'debugStartTime',
}: CircularTimerProps) {
    const [timeLeft, setTimeLeft] = useState(maxTime);
    const [showTimer, setShowTimer] = useState(false);
    const [mounted, setMounted] = useState(false);

    const radius = 46;
    const circumference = 2 * Math.PI * radius;

    useEffect(() => {
        if (typeof window === 'undefined') return;
        setMounted(true);

        const start = localStorage.getItem(storageKey);
        if (!start) return;

        setShowTimer(true);
        const startTime = Number(start);

        const updateTimer = () => {
            const elapsed = Math.floor((Date.now() - startTime) / 1000);
            const remaining = Math.max(maxTime - elapsed, 0);
            setTimeLeft(remaining);
            return remaining === 0;
        };

        if (updateTimer()) {
            localStorage.removeItem(storageKey);
            return;
        }

        const interval = setInterval(() => {
            const isFinished = updateTimer();
            if (isFinished) {
                clearInterval(interval);
                localStorage.removeItem(storageKey);
            }
        }, 1000);

        return () => clearInterval(interval);
    }, [maxTime, storageKey]);

    if (!showTimer || !mounted) return null;

    const minutes = String(Math.floor(timeLeft / 60)).padStart(2, '0');
    const seconds = String(timeLeft % 60).padStart(2, '0');

    // Calcul de l'offset cible
    const currentOffset = circumference - (timeLeft / maxTime) * circumference;

    return (
        <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15 }}
            className="fixed top-6 right-6 z-50 h-28 w-28"
        >
            <svg width={112} height={112} className="drop-shadow-2xl">
                <defs>
                    <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#8B5CF6" />
                        <stop offset="50%" stopColor="#EC4899" />
                        <stop offset="100%" stopColor="#3B82F6" />
                    </linearGradient>
                    <filter id="glow">
                        <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                        <feMerge>
                            <feMergeNode in="coloredBlur" />
                            <feMergeNode in="SourceGraphic" />
                        </feMerge>
                    </filter>
                </defs>

                {/* Cercle de fond (gris) */}
                <circle
                    cx="56"
                    cy="56"
                    r={radius}
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="none"
                    className="text-gray-700/30" // J'ai mis un gris un peu plus visible
                />

                {/* CERCLE ANIMÉ (CORRECTION ICI) 
                   On utilise motion.circle pour animer l'attribut strokeDashoffset
                */}
                <motion.circle
                    cx="56"
                    cy="56"
                    r={radius}
                    stroke="url(#gradient)"
                    strokeWidth="8"
                    fill="none"
                    strokeDasharray={circumference}
                    strokeLinecap="round"
                    transform="rotate(-90 56 56)"
                    filter="url(#glow)"
                    // C'est ici que la magie opère :
                    initial={{ strokeDashoffset: circumference }} // Commence vide (ou plein selon préférence)
                    animate={{ strokeDashoffset: currentOffset }} // Va vers la nouvelle valeur
                    transition={{ duration: 1, ease: 'linear' }} // Prend exactement 1 seconde pour y aller (fluide)
                />

                <text
                    x="50%"
                    y="50%"
                    dominantBaseline="middle"
                    textAnchor="middle"
                    fontSize="18"
                    fontWeight="bold"
                    fill="currentColor"
                    className="text-foreground font-mono"
                >
                    {minutes}:{seconds}
                </text>
            </svg>
        </motion.div>
    );
}
