'use client';

import React, { useEffect } from 'react';

import { AlphaButton } from '@/components/alpha/AlphaButton';
import { AlphaCard } from '@/components/alpha/AlphaCard';
import { AlphaError } from '@/components/alpha/AlphaError';
import { AlphaGrid } from '@/components/alpha/AlphaGrid';
import { AlphaHeader } from '@/components/alpha/AlphaHeader';
import { AlphaInfoRow } from '@/components/alpha/AlphaInfoRow';
import { AlphaSuccess } from '@/components/alpha/AlphaSuccess';
import { DialogueBox } from '@/components/dialogueBox';
import { PuzzlePhases, PuzzleProps } from '@/components/puzzles/PuzzleRegistry';
import { SCENARIO } from '@/data/alphaScenario';
import { useGameScenario, useScenarioTransition } from '@/hooks/useGameScenario';
import { useGeolocation } from '@/hooks/useGeolocation';
import { useOrientation } from '@/hooks/useOrientation';

export type GpsPuzzlePhases = PuzzlePhases;

interface GpsConfig{
    lat: number;
    long: number;
}

export default function GpsGame({ onSolve, isSolved, scripts = {}, puzzleConfig }: PuzzleProps<GpsPuzzlePhases,GpsConfig>) {
    const { gameState, triggerPhase, isDialogueOpen, currentScript, onDialogueComplete } =
        useGameScenario<GpsPuzzlePhases>(scripts);

    useScenarioTransition(gameState, isDialogueOpen, {
        idle: () => {
            triggerPhase('intro');
        },
        intro: () => {
            triggerPhase('playing');
        },
        win: () => {
            setTimeout(() => onSolve(), SCENARIO.defaultTimeBeforeNextStep);
        },
    });

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
    } = useGeolocation(puzzleConfig?.lat, puzzleConfig?.long, orientation);

    useEffect(() => {
        if (
            geolocation.distance !== null &&
            geolocation.distance <= 8 &&
            geolocation.accuracy != null &&
            geolocation.accuracy < 15
        ) {
            triggerPhase('win');
        }
    }, [geolocation.distance, geolocation.accuracy, triggerPhase]);

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
                <DialogueBox
                    isOpen={isDialogueOpen}
                    script={currentScript}
                    onComplete={onDialogueComplete}
                />

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
                        <div className="">
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
                        </div>
                    </AlphaCard>
                </AlphaGrid>
            )}
        </>
    );
}
