'use client';

import { useEffect, useRef, useState } from 'react';
import { OrientationData } from '@/types/orientation';

interface FirewallLogicProps {
    isActive: boolean;
    orientation: OrientationData; // On ajoute l'orientation en entrée
    isBlowing: boolean;
    onWin: () => void;
}

export function useFirewallLogic({ isActive, orientation, isBlowing, onWin }: FirewallLogicProps) {
    const [temp, setTemp] = useState(200);
    const [stabilityProgress, setStabilityProgress] = useState(0);

    // On stocke TOUT dans une ref pour que le setInterval accède aux valeurs réelles
    const stateRef = useRef({ 
        isActive, 
        orientation, 
        isBlowing, 
        onWin,
        lastPos: { beta: 0, gamma: 0 },
        stabilityStartTime: null as number | null 
    });

    // Synchronisation des refs à chaque rendu
    useEffect(() => {
        stateRef.current.isActive = isActive;
        stateRef.current.orientation = orientation;
        stateRef.current.isBlowing = isBlowing;
        stateRef.current.onWin = onWin;
    });

    useEffect(() => {
        if (!isActive) return;

        const gameLoop = setInterval(() => {
            const current = stateRef.current;
            if (!current.isActive) return;

            const { beta, gamma } = current.orientation;
            if (beta === null || gamma === null) return;

            // --- 1. LOGIQUE DE STABILITÉ ---
            // Calcul de la différence de mouvement
            const delta = Math.abs(beta - current.lastPos.beta) + Math.abs(gamma - current.lastPos.gamma);
            current.lastPos = { beta, gamma };

            let isCurrentlyStable = false;
            let newProgress = 0;

            if (delta > 1.5) {
                // Trop de mouvement : Reset du chrono interne
                current.stabilityStartTime = null;
            } else {
                // Stable : On calcule le temps écoulé
                if (!current.stabilityStartTime) {
                    current.stabilityStartTime = Date.now();
                }
                const elapsed = Date.now() - current.stabilityStartTime;
                newProgress = Math.min((elapsed / 3000) * 100, 100); // 3000ms = 3s
                isCurrentlyStable = newProgress === 100;
            }

            // --- 2. LOGIQUE DE TEMPÉRATURE ---
            setTemp((prev) => {
                let nextTemp = prev + 0.15; // Chauffe naturelle légèrement plus rapide

                // On ne refroidit que si STABLE (100%) ET SOUFFLE
                if (isCurrentlyStable && current.isBlowing) {
                    nextTemp -= 0.9; // Refroidissement plus puissant
                }

                if (nextTemp <= 50) {
                    current.onWin();
                    return 50;
                }
                return nextTemp;
            });

            // Mise à jour de la barre de progression dans l'UI
            setStabilityProgress(Math.floor(newProgress));

        }, 100);

        return () => clearInterval(gameLoop);
    }, [isActive]);

    return { 
        temp, 
        stabilityProgress, 
        isStable: stabilityProgress === 100 
    };
}