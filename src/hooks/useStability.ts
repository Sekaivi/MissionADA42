'use client';

import { useEffect, useRef, useState } from 'react';

import { OrientationData } from '@/types/orientation';

interface StabilityConfig {
    threshold: number;
    requiredTime: number;
    enabled: boolean;
}

export function useStability(
    data: OrientationData,
    config: StabilityConfig = { threshold: 1.5, requiredTime: 3000, enabled: true }
) {
    const [progress, setProgress] = useState(0);

    // Les Refs ne sont modifiées que dans le useEffect
    const lastPos = useRef({ beta: 0, gamma: 0 });
    const stabilityStartTime = useRef<number | null>(null);

    // Extraction pour éviter de mettre 'data' entier en dépendance si on veut être précis
    const { beta, gamma } = data;

    useEffect(() => {
        // 1. Si désactivé ou données incomplètes, on reset
        if (!config.enabled || beta === null || gamma === null) {
            stabilityStartTime.current = null;
            setProgress(0);
            return;
        }

        // 2. Calcul du mouvement (Delta)
        const delta =
            Math.abs(beta - lastPos.current.beta) + Math.abs(gamma - lastPos.current.gamma);

        // Mise à jour de la position de référence (Side-effect légal ici)
        lastPos.current = { beta, gamma };

        if (delta > config.threshold) {
            // Trop de mouvement : Reset
            stabilityStartTime.current = null;
            setProgress(0);
        } else {
            // C'est stable : on gère le chrono
            const now = Date.now(); // Date.now() est légal dans un useEffect

            if (stabilityStartTime.current === null) {
                stabilityStartTime.current = now;
            }

            const elapsed = now - stabilityStartTime.current;
            const newProgress = Math.floor(Math.min((elapsed / config.requiredTime) * 100, 100));

            // On ne met à jour le state que si la valeur entière a changé
            setProgress(newProgress);
        }

        // On dépend de beta/gamma pour recalculer à chaque mouvement du capteur
    }, [beta, gamma, config.enabled, config.threshold, config.requiredTime]);

    // 3. RÉSULTATS DÉRIVÉS (Calculés pendant le rendu, mais basés sur le state stable)
    const isStable = progress === 100;

    return { isStable, progress };
}
