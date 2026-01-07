'use client';

import { useEffect, useRef, useState } from 'react';

import { OrientationData } from '@/types/orientation';

interface StabilityConfig {
    threshold: number;
    requiredTime: number;
}

export function useStability(
    data: OrientationData,
    config: StabilityConfig = { threshold: 1.5, requiredTime: 3000 }
) {
    const [progress, setProgress] = useState(0);
    const lastPos = useRef({ beta: 0, gamma: 0 });
    const stabilityStartTime = useRef<number | null>(null);

    // Utilisation de refs pour toujours avoir accès aux dernières données
    // sans dépendre des rendus react
    const currentDataRef = useRef(data);
    useEffect(() => {
        currentDataRef.current = data;
    }, [data]);

    const isStable = progress === 100;

    useEffect(() => {
        let rafId: number;

        const update = () => {
            const { beta, gamma } = currentDataRef.current;

            if (beta === null || gamma === null) {
                rafId = requestAnimationFrame(update);
                return;
            }

            // Calcul du delta
            const delta =
                Math.abs(beta - lastPos.current.beta) + Math.abs(gamma - lastPos.current.gamma);
            lastPos.current = { beta, gamma };

            // 2. Logique de stabilité
            if (delta > config.threshold) {
                stabilityStartTime.current = null;
                // uodate du state que si nécessaire pour économiser du CPU
                setProgress((prev) => (prev === 0 ? 0 : 0));
            } else {
                if (stabilityStartTime.current === null) {
                    stabilityStartTime.current = Date.now();
                }

                const elapsed = Date.now() - stabilityStartTime.current;
                const newProgress = Math.min((elapsed / config.requiredTime) * 100, 100);

                // arrondissement pour éviter des rafraichissements de micro variations
                setProgress(Math.floor(newProgress));
            }

            rafId = requestAnimationFrame(update);
        };

        rafId = requestAnimationFrame(update);
        return () => cancelAnimationFrame(rafId);
    }, [config.threshold, config.requiredTime]);

    return { isStable, progress };
}
