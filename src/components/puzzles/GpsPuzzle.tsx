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
    } = useGeolocation(45.2031, 5.702213);

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
                            {geolocation.distance !== null
                                ? `${Math.round(geolocation.distance)} m jusqu'à la cible`
                                : 'Distance inconnue'}
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
