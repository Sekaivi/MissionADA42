'use client';

import { useEffect, useMemo, useState } from 'react';

import { Direction, OrientationData } from '@/types/orientation';

interface GestureConfig {
    threshold: number;
    stableTime: number;
}

const getInstantDirection = (
    beta: number | null,
    gamma: number | null,
    threshold: number
): Direction => {
    if (!beta || !gamma) return 'Stable';

    if (Math.abs(beta) > Math.abs(gamma)) {
        if (beta > threshold) return 'Haut';
        if (beta < -threshold) return 'Bas';
    } else {
        if (gamma > threshold) return 'Droite';
        if (gamma < -threshold) return 'Gauche';
    }
    return 'Stable';
};

export function useOrientationGesture(
    data: OrientationData,
    config: GestureConfig = { threshold: 20, stableTime: 300 }
) {
    const [validatedDirection, setValidatedDirection] = useState<Direction>('Stable');

    // calcul immédiat de la direction
    const instantDirection = useMemo(() => {
        return getInstantDirection(data.beta, data.gamma, config.threshold);
    }, [data.beta, data.gamma, config.threshold]);

    // logique de validation (Debounce)
    useEffect(() => {
        // si on vise une direction : on attend le stableTime pour valider
        // si on revient au centre ('Stable') alors on n'attend pas (0ms)
        const delay = instantDirection === 'Stable' ? 0 : config.stableTime;

        const timer = setTimeout(() => {
            setValidatedDirection(instantDirection);
        }, delay);

        return () => clearTimeout(timer);
    }, [instantDirection, config.stableTime]);

    return {
        instantDirection, // feedback visuel immédiat
        validatedDirection, // action validée (après délai)
    };
}
