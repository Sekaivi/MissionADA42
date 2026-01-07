'use client';

import { useState, useEffect, useRef } from 'react';
import { OrientationData } from '@/types/orientation';

export function useFirewallGame(orientation: OrientationData, mic: { isBlowing: boolean, intensity: number, isCalibrated: boolean }) {
    const [temp, setTemp] = useState(200);
    const [stabilityProgress, setStabilityProgress] = useState(0);
    const [status, setStatus] = useState<'IDLE' | 'CALIBRATING' | 'PLAYING' | 'WIN'>('IDLE');
    
    // On utilise une Ref pour stocker les valeurs précédentes sans déclencher de re-render
    const lastPosRef = useRef({ beta: 0, gamma: 0 });
    const stateRef = useRef({ orientation, mic, stabilityProgress: 0 });
    const lastUpdate = useRef(Date.now());

    // On synchronise les données entrantes avec notre Ref de lecture
    useEffect(() => {
        stateRef.current.orientation = orientation;
        stateRef.current.mic = mic;
    }, [orientation, mic]);

    const startSession = () => setStatus('CALIBRATING');

    useEffect(() => {
        if (status !== 'PLAYING' && status !== 'CALIBRATING') return;

        const loop = () => {
            const now = Date.now();
            const dt = (now - lastUpdate.current) / 1000;
            lastUpdate.current = now;

            const currentBeta = stateRef.current.orientation.beta || 0;
            const currentGamma = stateRef.current.orientation.gamma || 0;

            // 1. CALCUL DE LA STABILITÉ
            // On calcule l'écart avec la position de la frame précédente
            const movementDelta = Math.abs(currentBeta - lastPosRef.current.beta) + 
                                 Math.abs(currentGamma - lastPosRef.current.gamma);

            // On met à jour l'historique pour la prochaine frame
            lastPosRef.current = { beta: currentBeta, gamma: currentGamma };

            // On considère stable si le téléphone n'a pas bougé de plus de 1.2 degrés ce cycle
            const isCurrentlyStable = movementDelta < 1.2;

            if (isCurrentlyStable) {
                stateRef.current.stabilityProgress = Math.min(stateRef.current.stabilityProgress + dt * 1000, 3000);
            } else {
                stateRef.current.stabilityProgress = 0;
            }
            
            setStabilityProgress(stateRef.current.stabilityProgress);

            // 2. LOGIQUE DE JEU
            if (status === 'PLAYING') {
                const isStable = stateRef.current.stabilityProgress >= 3000;
                const isBlowing = stateRef.current.mic.isBlowing;

                setTemp(prev => {
                    let nextTemp = prev + (2.5 * dt); // Chauffe constante
                    
                    if (isStable && isBlowing && stateRef.current.mic.isCalibrated) {
                        // On augmente radicalement le refroidissement pour que ce soit gratifiant
                        const coolingPower = (30 + stateRef.current.mic.intensity * 1.2) * dt;
                        nextTemp -= coolingPower;
                    }
                    
                    if (nextTemp <= 50) {
                        setStatus('WIN');
                        return 50;
                    }
                    return nextTemp > 400 ? 350 : nextTemp;
                });
            } else if (status === 'CALIBRATING' && stateRef.current.mic.isCalibrated) {
                setStatus('PLAYING');
            }

            if (status !== 'WIN') {
                requestAnimationFrame(loop);
            }
        };

        const raf = requestAnimationFrame(loop);
        return () => cancelAnimationFrame(raf);
    }, [status]);

    return { 
        temp, 
        stabilityProgress, 
        status, 
        startSession, 
        isStable: stabilityProgress >= 3000 
    };
}