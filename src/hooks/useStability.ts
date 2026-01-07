'use client';

import { useRef } from 'react';
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
    // On utilise des Refs pour mémoriser les états entre les rendus SANS déclencher de cycles
    const lastPos = useRef({ beta: 0, gamma: 0 });
    const stabilityStartTime = useRef<number | null>(null);

    // 1. EXTRACTION DES DONNÉES
    const { beta, gamma } = data;

    // 2. LOGIQUE DE CALCUL DU MOUVEMENT (Directement dans le corps du hook)
    let currentProgress = 0;

    if (!config.enabled || beta === null || gamma === null) {
        stabilityStartTime.current = null;
    } else {
        // Calcul du delta par rapport au dernier rendu
        const delta = Math.abs(beta - lastPos.current.beta) + Math.abs(gamma - lastPos.current.gamma);
        
        // Mise à jour de la position de référence pour le prochain passage
        lastPos.current = { beta, gamma };

        if (delta > config.threshold) {
            // Trop de mouvement : on reset le chrono
            stabilityStartTime.current = null;
        } else {
            // C'est stable : on initialise le chrono si besoin
            if (stabilityStartTime.current === null) {
                stabilityStartTime.current = Date.now();
            }
            
            // On calcule la progression basée sur le temps écoulé depuis le début de la stabilité
            const elapsed = Date.now() - stabilityStartTime.current;
            currentProgress = Math.floor(Math.min((elapsed / config.requiredTime) * 100, 100));
        }
    }

    // 3. RÉSULTATS DÉRIVÉS
    // Pas besoin de state : 'progress' est recalculé à chaque fois que 'data' change
    const progress = currentProgress;
    const isStable = progress === 100;

    return { isStable, progress };
}