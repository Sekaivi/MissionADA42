// const TARGET = {
//     lat: 45.2031,
//     lon: 5.702213, // Salle 109
// };
//
// function toRad(deg: number) {
//     return (deg * Math.PI) / 180;
// }
//
// function toDeg(rad: number) {
//     return (rad * 180) / Math.PI;
// }
//
// function computeBearing(lat1: number, lon1: number, lat2: number, lon2: number): number {
//     const latActuelle = toRad(lat1);
//     const latCible = toRad(lat2);
//     const diffLong = toRad(lon2 - lon1);
//
//     const y = Math.sin(diffLong) * Math.cos(latCible);
//     const x =
//         Math.cos(latActuelle) * Math.sin(latCible) -
//         Math.sin(latActuelle) * Math.cos(latCible) * Math.cos(diffLong);
//
//     return (toDeg(Math.atan2(y, x)) + 360) % 360;
// }
//
// function angleToDirection8(angle: number) {
//     const directions = ['↑', '↗', '→', '↘', '↓', '↙', '←', '↖'];
//     return directions[Math.round(angle / 45) % 8];
// }

// const compass = useMemo(() => {
//     if (
//         !geolocation.latitude ||
//         !geolocation.longitude ||
//         geolocation.heading === null ||
//         geolocation.accuracy === null ||
//         geolocation.accuracy > 50
//     ) {
//         return null;
//     }
//
//     const bearing = computeBearing(
//         geolocation.latitude,
//         geolocation.longitude,
//         targetLat,
//         targetLong,
//     );
//
//     const relativeAngle = (bearing - geolocation.heading + 360) % 360;
//     const arrow = angleToDirection8(relativeAngle);
//
//     return {
//         bearing,
//         relativeAngle,
//         arrow,
//     };
// }, [geolocation, orientation.heading]);

'use client';

import { AlphaButton } from '@/components/alpha/AlphaButton';
import { AlphaCard } from '@/components/alpha/AlphaCard';
import { AlphaError } from '@/components/alpha/AlphaError';
import { AlphaGrid } from '@/components/alpha/AlphaGrid';
import { AlphaHeader } from '@/components/alpha/AlphaHeader';
import { AlphaInfoRow } from '@/components/alpha/AlphaInfoRow';
import { useGeolocation } from '@/hooks/useGeolocation';
import { useOrientation } from '@/hooks/useOrientation';
import {useCallback, useEffect, useRef, useState} from "react";
import {AlphaSuccess} from "@/components/alpha/AlphaSuccess";

export default function AlphaGPS() {
    const {
        data: orientation,
        permissionGranted: orientationGranted,
        requestPermission: requestOrientationPermission,
        error: orientationError,
    } = useOrientation();

    const {
        compass,
        data: geolocation,
        permissionGranted: locationGranted,
        requestPermission: requestLocationPermission,
        error: locationError,
    } = useGeolocation(45.2031, 5.702213, orientation.heading);

    const SOLVE_DISTANCE = 2;
    const solvedRef = useRef(false);
    const [isSolved, setIsSolved] = useState(false);
    const [solveMessage, setSolveMessage] = useState<string | null>(null);


    useEffect(() => {
        if (!isSolved) return;
        if (solvedRef.current) return;

        solvedRef.current = true;
        onSolve();
    }, [isSolved, onSolve]);

    const onSolve = useCallback(() => {
        if (solvedRef.current) return;

        solvedRef.current = true;
        setIsSolved(true);
        setSolveMessage('🎯 Destination atteinte. GPS validé.');

        console.log('[GPS PUZZLE] SOLVED');
    }, []);


    if (isSolved) {
        return (
            <AlphaSuccess message={solveMessage} />
        );
    }

    useEffect(() => {
        if (
            geolocation.distance !== null &&
            geolocation.distance <= 2
        ) {
            onSolve();
        }
    }, [geolocation.distance, onSolve]);

    if (isSolved) {
        return (
            <>
                <AlphaHeader
                    title="GPS Boussole"
                    subtitle="Navigation directionnelle vers une cible"
                />
                <AlphaSuccess message={solveMessage ?? 'Puzzle GPS validé'} />
            </>
        );
    }
    return (
        <>
            <AlphaHeader title="GPS Boussole" subtitle="Navigation directionnelle vers une cible" />

            {!orientationGranted && (
                <div className="border-border bg-surface rounded-lg border p-8 text-center">
                    <p className="text-muted mb-4">Autorisation requise pour la boussole</p>
                    <AlphaButton onClick={requestOrientationPermission}>
                        Autoriser les capteurs
                    </AlphaButton>
                </div>
            )}

            {!locationGranted && (
                <div className="border-border bg-surface rounded-lg border p-8 text-center">
                    <p className="text-muted mb-4">Autorisation requise pour le GPS</p>
                    <AlphaButton onClick={requestLocationPermission} fullWidth={true}>
                        Autoriser le GPS
                    </AlphaButton>
                </div>
            )}

            <AlphaError message={orientationError || locationError} />

            {locationGranted && (
                <AlphaGrid>
                    {/* VISU */}
                    <AlphaCard title="Direction">
                        <div className="flex h-64 items-center justify-center">
                            <div className="text-[96px] font-black">
                                {compass ? compass.arrow : '•'}
                            </div>
                        </div>
                        <p className="text-muted text-center text-xs">
                            {geolocation.distance ? Math.round(geolocation.distance | 0) : '??'}m
                            jusqu'à la cible.
                        </p>
                    </AlphaCard>

                    {/* DEBUG */}
                    <AlphaCard title="Données GPS & Cap">
                        <div className="space-y-2">
                            <AlphaInfoRow
                                label="Heading"
                                value={`${Math.round(orientation.heading ?? 0)}°`}
                            />
                            <AlphaInfoRow
                                label="Bearing cible"
                                value={`${Math.round(compass?.bearing ?? 0)}°`}
                            />
                            <AlphaInfoRow
                                label="Angle relatif"
                                value={`${Math.round(compass?.relativeAngle ?? 0)}°`}
                            />
                            <AlphaInfoRow
                                label="Accuracy GPS"
                                value={`${Math.round(geolocation.accuracy ?? 0)} m`}
                            />
                        </div>
                    </AlphaCard>
                </AlphaGrid>
            )}
        </>
    );
}

/*
const TARGET = {
    lat: 45.2029882,
    lon: 5.7022892, // Salle 109
};

export default function AlphaGPS() {
    const {
        data: orientation,
        permissionGranted: orientationGranted,
        requestPermission: requestOrientationPermission,
        error: orientationError,
    } = useOrientation();

    const {
        data: location,
        permissionGranted: locationGranted,
        requestPermission: requestLocationPermission,
        error: locationError,
    } = useGeolocation();

    useEffect(() => {
        if (!locationGranted) requestLocationPermission();
    }, [locationGranted, requestLocationPermission]);

    const compass = useMemo(() => {
        if (
            !location.latitude ||
            !location.longitude ||
            orientation.heading === null ||
            location.accuracy === null ||
            location.accuracy > 50
        ) {
            return null;
        }

        const bearing = computeBearing(
            location.latitude,
            location.longitude,
            TARGET.lat,
            TARGET.lon
        );

        const relativeAngle = (bearing - orientation.heading + 360) % 360;
        const arrow = angleToDirection8(relativeAngle);

        return {
            bearing,
            relativeAngle,
            arrow,
        };
    }, [location, orientation.heading]);

    return (
        <>
            <AlphaHeader title="GPS Boussole" subtitle="Navigation directionnelle vers une cible" />

            {!orientationGranted && (
                <div className="border-border bg-surface rounded-lg border p-8 text-center">
                    <p className="text-muted mb-4">Autorisation requise pour la boussole</p>
                    <AlphaButton onClick={requestOrientationPermission}>
                        Autoriser les capteurs
                    </AlphaButton>
                </div>
            )}

            <AlphaError message={orientationError || locationError} />

            {orientationGranted && locationGranted && (
                <AlphaGrid>
                    <AlphaCard title="Direction">
                        <div className="flex h-64 items-center justify-center">
                            <div className="text-[96px] font-black">
                                {compass ? compass.arrow : '•'}
                            </div>
                        </div>
                        <p className="text-muted text-center text-xs">
                            La flèche indique la direction à suivre
                        </p>
                    </AlphaCard>

                    <AlphaCard title="Données GPS & Cap">
                        <div className="space-y-2">
                            <AlphaInfoRow
                                label="Heading"
                                value={`${Math.round(orientation.heading ?? 0)}°`}
                            />
                            <AlphaInfoRow
                                label="Bearing cible"
                                value={`${Math.round(compass?.bearing ?? 0)}°`}
                            />
                            <AlphaInfoRow
                                label="Angle relatif"
                                value={`${Math.round(compass?.relativeAngle ?? 0)}°`}
                            />
                            <AlphaInfoRow
                                label="Accuracy GPS"
                                value={`${Math.round(location.accuracy ?? 0)} m`}
                            />
                        </div>
                    </AlphaCard>
                </AlphaGrid>
            )}
        </>
    );
}
*/
