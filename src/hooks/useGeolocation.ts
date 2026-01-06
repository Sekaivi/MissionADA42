'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useOrientation } from '@/hooks/useOrientation';
import {angleToDirection8, computeBearing, computeDistance} from "@/utils/geo";

export interface GeolocationData {
    latitude: number | null;
    longitude: number | null;
    accuracy: number | null;
    altitude: number | null;
    altitudeAccuracy: number | null;
    speed: number | null;
    gpsHeading: number | null;
    distance: number | null;
}

export function useGeolocation(targetLat = 45.2031, targetLong = 5.702213) {
    const { data: orientation } = useOrientation();

    const [data, setData] = useState<GeolocationData>({
        latitude: null,
        longitude: null,
        accuracy: null,
        altitude: null,
        altitudeAccuracy: null,
        speed: null,
        gpsHeading: null,
        distance: null,
    });

    const [error, setError] = useState<string | null>(null);
    const [permissionGranted, setPermissionGranted] = useState(false);
    const watchId = useRef<number | null>(null);

    // Sélection du bon heading
    const heading = useMemo(() => {
        if (data.speed !== null && data.speed > 1 && data.gpsHeading !== null) {
            return data.gpsHeading; // heading GPS fiable en mouvement
        }
        return orientation.heading; // sinon boussole
    }, [data.speed, data.gpsHeading, orientation.heading]);

    // Compass
    const compass = useMemo(() => {
        if (
            data.latitude === null ||
            data.longitude === null ||
            heading === null ||
            data.accuracy === null ||
            data.accuracy > 50
        ) {
            return null;
        }

        const bearing = computeBearing(
            data.latitude,
            data.longitude,
            targetLat,
            targetLong
        );

        const relativeAngle = (bearing - heading + 360) % 360;

        return {
            bearing,
            relativeAngle,
            arrow: angleToDirection8(relativeAngle),
        };
    }, [data, heading, targetLat, targetLong]);

    const onSuccess = useCallback(
        (position: GeolocationPosition) => {
            const { coords } = position;

            setData({
                latitude: coords.latitude,
                longitude: coords.longitude,
                accuracy: coords.accuracy,
                altitude: coords.altitude,
                altitudeAccuracy: coords.altitudeAccuracy,
                speed: coords.speed,
                gpsHeading: coords.heading,
                distance: computeDistance(
                    coords.latitude,
                    coords.longitude,
                    targetLat,
                    targetLong
                ),
            });
        },
        [targetLat, targetLong]
    );

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
            () => setPermissionGranted(true),
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

    return {
        data,
        compass,
        error,
        permissionGranted,
        requestPermission,
    };
}
