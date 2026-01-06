'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

export interface GeolocationData {
    latitude: number | null;
    longitude: number | null;
    accuracy: number | null;
    altitude: number | null;
    altitudeAccuracy: number | null;
    heading: number | null;
    speed: number | null;
}

export interface GeolocationState {
    data: GeolocationData;
    error: string | null;
    permissionGranted: boolean;
    requestPermission: () => void;
}

export function useGeolocation(): GeolocationState {
    const [data, setData] = useState<GeolocationData>({
        latitude: null,
        longitude: null,
        accuracy: null,
        altitude: null,
        altitudeAccuracy: null,
        heading: null,
        speed: null,
    });

    const [error, setError] = useState<string | null>(null);
    const [permissionGranted, setPermissionGranted] = useState(false);
    const watchId = useRef<number | null>(null);

    const onSuccess = useCallback((position: GeolocationPosition) => {
        const { coords } = position;

        setData({
            latitude: coords.latitude,
            longitude: coords.longitude,
            accuracy: coords.accuracy,
            altitude: coords.altitude,
            altitudeAccuracy: coords.altitudeAccuracy,
            heading: coords.heading,
            speed: coords.speed,
        });
    }, []);

    const onError = useCallback((err: GeolocationPositionError) => {
        switch (err.code) {
            case err.PERMISSION_DENIED:
                setError('Permission de localisation refusée.');
                break;
            case err.POSITION_UNAVAILABLE:
                setError('Position indisponible.');
                break;
            case err.TIMEOUT:
                setError("Délai d'obtention de la position dépassé.");
                break;
            default:
                setError('Erreur inconnue de géolocalisation.');
        }
    }, []);

    const requestPermission = useCallback(() => {
        if (!('geolocation' in navigator)) {
            setError("La géolocalisation n'est pas supportée par ce navigateur.");
            return;
        }

        navigator.geolocation.getCurrentPosition(
            () => {
                setPermissionGranted(true);
            },
            onError,
            { enableHighAccuracy: true }
        );
    }, [onError]);

    useEffect(() => {
        if (!permissionGranted) return;

        watchId.current = navigator.geolocation.watchPosition(onSuccess, onError, {
            enableHighAccuracy: true,
            maximumAge: 1000,
            timeout: 10000,
        });

        return () => {
            if (watchId.current !== null) {
                if (typeof watchId.current === 'number') {
                    navigator.geolocation.clearWatch(watchId.current);
                }
            }
        };
    }, [permissionGranted, onSuccess, onError]);

    return { data, error, permissionGranted, requestPermission };
}
