'use client';

import { useEffect, useRef, useState } from 'react';

import { OrientationData } from '@/types/orientation';

interface FirewallLogicProps {
    isActive: boolean;
    orientation: OrientationData;
    isBlowing: boolean;
    onWin: () => void;
}

export function useFirewallLogic({ isActive, orientation, isBlowing, onWin }: FirewallLogicProps) {
    const [temp, setTemp] = useState(200);
    const [stabilityProgress, setStabilityProgress] = useState(0);

    const stateRef = useRef({
        isActive,
        orientation,
        isBlowing,
        onWin,
        lastPos: { beta: 0, gamma: 0 },
        stabilityStartTime: null as number | null,
    });

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

            // LOGIQUE DE STABILITÉ
            const delta =
                Math.abs(beta - current.lastPos.beta) + Math.abs(gamma - current.lastPos.gamma);
            current.lastPos = { beta, gamma };

            let isCurrentlyStable = false;
            let newProgress = 0;

            // "threshold aka la tolerence de mouvement"
            if (delta > 1.5) {
                current.stabilityStartTime = null;
            } else {
                if (!current.stabilityStartTime) {
                    current.stabilityStartTime = Date.now();
                }
                const elapsed = Date.now() - current.stabilityStartTime;
                newProgress = Math.min((elapsed / 3000) * 100, 100); // 3000ms = 3s
                isCurrentlyStable = newProgress === 100;
            }

            // LOGIQUE DE TEMPERATURE
            setTemp((prev) => {
                let nextTemp = prev + 0.15;

                if (isCurrentlyStable && current.isBlowing) {
                    nextTemp -= 0.9;
                }

                if (nextTemp <= 50) {
                    current.onWin();
                    return 50;
                }
                return nextTemp;
            });

            setStabilityProgress(Math.floor(newProgress));
        }, 100);

        return () => clearInterval(gameLoop);
    }, [isActive]);

    return {
        temp,
        stabilityProgress,
        isStable: stabilityProgress === 100,
    };
}
