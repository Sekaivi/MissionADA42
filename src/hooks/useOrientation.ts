'use client';

import { useCallback, useEffect, useState } from 'react';

import { OrientationData, OrientationState } from '@/types/orientation';

// interface native étendue pour ajouter requestPermission (spécifique iOS)
interface DeviceOrientationEventiOS extends DeviceOrientationEvent {
    requestPermission?: () => Promise<'granted' | 'denied'>;
    webkitCompassHeading?: number;
}

export function useOrientation(): OrientationState {
    const [data, setData] = useState<OrientationData>({ alpha: 0, beta: 0, gamma: 0, heading: 0 });
    const [error, setError] = useState<string | null>(null);
    const [permissionGranted, setPermissionGranted] = useState(false);

    const handleOrientation = useCallback((event: DeviceOrientationEvent) => {
        let heading: number | null = null;
        const iosEvent = event as DeviceOrientationEventiOS;

        // calcul du Nord
        if (iosEvent.webkitCompassHeading !== undefined) {
            // iOS : fourni directement (0 = Nord, 90 = Est)
            heading = iosEvent.webkitCompassHeading;
        } else if (event.alpha !== null) {
            // Android / Standard : Alpha est en sens trigo (Anti-horaire : 0=N, 90=Ouest)
            // Pour avoir un cap boussole (Horaire : 0=N, 90=Est) => on inverse
            heading = 360 - event.alpha;
        }

        setData({
            alpha: event.alpha,
            beta: event.beta,
            gamma: event.gamma,
            heading: heading,
        });
    }, []);

    const requestPermission = async () => {
        const requestPermissionFn = (DeviceOrientationEvent as unknown as DeviceOrientationEventiOS)
            .requestPermission;

        if (typeof requestPermissionFn === 'function') {
            try {
                const permissionState = await requestPermissionFn();
                if (permissionState === 'granted') {
                    setPermissionGranted(true);
                } else {
                    setError("Permission refusée par l'utilisateur.");
                }
            } catch (e) {
                console.error(e);
                setError('Erreur lors de la demande de permission.');
            }
        } else {
            // non-iOS ou vieux appareils
            setPermissionGranted(true);
        }
    };

    useEffect(() => {
        if (permissionGranted) {
            window.addEventListener('deviceorientation', handleOrientation);
            return () => {
                window.removeEventListener('deviceorientation', handleOrientation);
            };
        }
    }, [permissionGranted, handleOrientation]);

    // tentative d'auto-détection pour android et desktop
    useEffect(() => {
        const requestPermissionFn = (DeviceOrientationEvent as unknown as DeviceOrientationEventiOS)
            .requestPermission;

        // si la fonction n'existe pas, c'est qu'on est sur android ou desktop => pas besoin de permission
        if (typeof requestPermissionFn !== 'function') {
            const timer = setTimeout(() => {
                setPermissionGranted(true);
            }, 0);
            return () => clearTimeout(timer);
        }
    }, []);

    return { data, error, permissionGranted, requestPermission };
}
