'use client';

import { useEffect } from 'react';

import { AlphaButton } from '@/components/alpha/AlphaButton';
import { AlphaCard } from '@/components/alpha/AlphaCard';
import { AlphaError } from '@/components/alpha/AlphaError';
import { AlphaGrid } from '@/components/alpha/AlphaGrid';
import { AlphaHeader } from '@/components/alpha/AlphaHeader';
import { AlphaInfoRow } from '@/components/alpha/AlphaInfoRow';
import { AlphaSuccess } from '@/components/alpha/AlphaSuccess';
import { PuzzleProps } from '@/components/puzzles/PuzzleRegistry';
import { useGeolocation } from '@/hooks/useGeolocation';
import { useOrientation } from '@/hooks/useOrientation';

export default function GpsPuzzle({ onSolve, isSolved }: PuzzleProps) {
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
    } = useGeolocation(45.20365424982078, 5.7013579371490986, orientation);

    useEffect(() => {
        if (
            geolocation.distance !== null &&
            geolocation.distance <= 8 &&
            geolocation.accuracy != null &&
            geolocation.accuracy < 15
        ) {
            onSolve();
        }
    }, [geolocation.distance, geolocation.accuracy, onSolve]);

    if (isSolved) {
        return (
            <>
                <AlphaHeader
                    title="GPS Boussole"
                    subtitle="Navigation directionnelle vers une cible"
                />
                <AlphaSuccess message="Destination atteinte" />
            </>
        );
    }

    return (
        <>
            <div className="space-y-4">
                {!orientationGranted && (
                    <div className="border-border bg-surface rounded-lg border p-8 text-center">
                        <p className="text-muted mb-4">Autorisation requise pour la boussole</p>
                        <AlphaButton onClick={requestOrientationPermission} fullWidth={true}>
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
            </div>

            <AlphaError message={orientationError || locationError} />

            {/* Afficher le diagnostic dès qu'une permission est accordée */}
            {(locationGranted || orientationGranted) && (
                <AlphaGrid>
                    {/* VISU */}
                    <AlphaCard title="Direction">
                        <div className="flex h-64 items-center justify-center">
                            <div className="text-[96px] font-black">
                                {compass ? compass.arrow : '•'}
                            </div>
                        </div>
                        <p className="text-muted text-center text-xs">
                            {geolocation.distance !== null
                                ? `${Math.round(geolocation.distance)} m jusqu'à la cible`
                                : 'Distance inconnue'}
                        </p>
                    </AlphaCard>

                    {/* DEBUG */}
                    <AlphaCard title="Données GPS & Cap">
                        <div className="space-y-2">
                            <AlphaInfoRow
                                label="Position"
                                value={
                                    geolocation.latitude && geolocation.longitude
                                        ? `${geolocation.latitude.toFixed(6)}, ${geolocation.longitude.toFixed(6)}`
                                        : 'En attente...'
                                }
                            />
                            <AlphaInfoRow
                                label="Heading"
                                value={
                                    orientation.heading !== null
                                        ? `${Math.round(orientation.heading)}°`
                                        : 'N/A'
                                }
                            />
                            <AlphaInfoRow
                                label="Bearing cible"
                                value={compass ? `${Math.round(compass.bearing)}°` : 'N/A'}
                            />
                            <AlphaInfoRow
                                label="Angle relatif"
                                value={compass ? `${Math.round(compass.relativeAngle)}°` : 'N/A'}
                            />
                            <AlphaInfoRow
                                label="Accuracy GPS"
                                value={
                                    geolocation.accuracy !== null
                                        ? `${Math.round(geolocation.accuracy)} m`
                                        : 'N/A'
                                }
                            />
                            <AlphaInfoRow
                                label="Distance"
                                value={
                                    geolocation.distance !== null
                                        ? `${Math.round(geolocation.distance)} m`
                                        : 'N/A'
                                }
                            />
                        </div>
                    </AlphaCard>

                    {/*
                    // Diagnostic
                    <AlphaCard title="🔍 Diagnostic Compass">
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span>Permission Orientation:</span>
                                <span
                                    className={
                                        orientationGranted ? 'text-green-500' : 'text-red-500'
                                    }
                                >
                                    {orientationGranted ? '✅ OUI' : '❌ NON'}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span>Permission GPS:</span>
                                <span
                                    className={locationGranted ? 'text-green-500' : 'text-red-500'}
                                >
                                    {locationGranted ? '✅ OUI' : '❌ NON'}
                                </span>
                            </div>
                            <div className="flex justify-between border-t pt-2">
                                <span>Latitude OK:</span>
                                <span
                                    className={
                                        geolocation.latitude !== null
                                            ? 'text-green-500'
                                            : 'text-red-500'
                                    }
                                >
                                    {geolocation.latitude !== null ? '✅' : '❌'}{' '}
                                    {geolocation.latitude !== null ? 'OUI' : 'NON'}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span>Longitude OK:</span>
                                <span
                                    className={
                                        geolocation.longitude !== null
                                            ? 'text-green-500'
                                            : 'text-red-500'
                                    }
                                >
                                    {geolocation.longitude !== null ? '✅' : '❌'}{' '}
                                    {geolocation.longitude !== null ? 'OUI' : 'NON'}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span>Orientation.heading:</span>
                                <span
                                    className={
                                        orientation.heading !== null
                                            ? 'text-green-500'
                                            : 'text-red-500'
                                    }
                                >
                                    {orientation.heading !== null ? '✅' : '❌'}
                                    {orientation.heading !== null
                                        ? ` ${Math.round(orientation.heading)}°`
                                        : ' NULL'}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span>GPS heading:</span>
                                <span
                                    className={
                                        geolocation.gpsHeading !== null
                                            ? 'text-green-500'
                                            : 'text-yellow-500'
                                    }
                                >
                                    {geolocation.gpsHeading !== null
                                        ? `✅ ${Math.round(geolocation.gpsHeading)}°`
                                        : '⚠️ NULL'}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span>Speed:</span>
                                <span className="text-blue-500">
                                    {geolocation.speed !== null
                                        ? `${geolocation.speed.toFixed(2)} m/s`
                                        : 'NULL'}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span>Accuracy OK:</span>
                                <span
                                    className={
                                        geolocation.accuracy !== null && geolocation.accuracy <= 100
                                            ? 'text-green-500'
                                            : 'text-red-500'
                                    }
                                >
                                    {geolocation.accuracy !== null && geolocation.accuracy <= 100
                                        ? '✅'
                                        : '❌'}
                                    {geolocation.accuracy !== null
                                        ? ` ${geolocation.accuracy <= 100 ? 'OUI' : 'NON'} (${Math.round(geolocation.accuracy)}m)`
                                        : ' NULL'}
                                </span>
                            </div>
                            <div className="flex justify-between border-t pt-2 font-bold">
                                <span>Compass:</span>
                                <span
                                    className={compass !== null ? 'text-green-500' : 'text-red-500'}
                                >
                                    {compass !== null ? '✅ ACTIF' : '❌ INACTIF'}
                                </span>
                            </div>
                        </div>
                    </AlphaCard>
                    */}
                </AlphaGrid>
            )}
        </>
    );
}
