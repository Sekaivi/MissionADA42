'use client';

import { useEffect, useState } from 'react';

import { AlphaButton } from '@/components/alpha/AlphaButton';
import { AlphaCard } from '@/components/alpha/AlphaCard';
import { AlphaError } from '@/components/alpha/AlphaError';
import { AlphaGrid } from '@/components/alpha/AlphaGrid';
import { AlphaHeader } from '@/components/alpha/AlphaHeader';
import { AlphaInfoRow } from '@/components/alpha/AlphaInfoRow';
import { useOrientation } from '@/hooks/useOrientation';
import { useOrientationGesture } from '@/hooks/useOrientationGesture';

export default function AlphaOrientationDebug() {
    const { data, error, permissionGranted, requestPermission } = useOrientation();

    const { instantDirection, validatedDirection } = useOrientationGesture(data, {
        threshold: 20,
        stableTime: 500,
    });

    const [hasSensorData, setHasSensorData] = useState(false);

    useEffect(() => {
        // check si les données ne sont pas nulles
        if (!hasSensorData && (data.alpha !== 0 || data.beta !== 0 || data.gamma !== 0)) {
            const timer = setTimeout(() => {
                setHasSensorData(true);
            }, 0);
            return () => clearTimeout(timer);
        }
    }, [data, hasSensorData]);

    return (
        <>
            <AlphaHeader
                title="Capteurs d'Orientation"
                subtitle="Debug Gyroscope & Accéléromètre"
            />

            {/* cas iOS demande la permission */}
            {!permissionGranted && !error && (
                <AlphaCard title={'Permissions requises'}>
                    <p className="mb-4">L'accès aux capteurs nécessite une validation.</p>
                    <AlphaButton onClick={requestPermission}>
                        Autoriser l'accès aux capteurs
                    </AlphaButton>
                </AlphaCard>
            )}

            <AlphaError message={error} />

            {/* cas permission OK, mais aucune donnée */}
            {permissionGranted && !hasSensorData && (
                <AlphaError message="En attente de données... (Sur PC : Ouvrez DevTools > Sensors)" />
            )}

            {permissionGranted && (
                <AlphaGrid>
                    {/* col 1 : preview de l'inclinaison */}
                    <div className="space-y-6">
                        <AlphaCard title="Visualisation Temps Réel">
                            <div className="mb-4 flex h-64 items-center justify-center perspective-[800px]">
                                {/* téléphone 2D */}
                                <div
                                    className="border-foreground bg-surface relative flex h-64 w-32 items-center justify-center rounded-3xl border-4 shadow-2xl transition-transform duration-100 ease-out"
                                    style={{
                                        transform: `
                                            /* CORRECTION DU SENS DE ROTATION */
                                            rotateX(${90 - (data.beta || 0)}deg)
                                            rotateY(${-(data.gamma || 0)}deg) 
                                            rotateZ(0deg)
                                        `,
                                    }}
                                >
                                    {/* screen */}
                                    <div className="bg-background/50 flex h-full w-full items-center justify-center overflow-hidden rounded-[20px]">
                                        <div className="text-brand-emerald/50 text-4xl font-black">
                                            {instantDirection === 'Stable'
                                                ? '•'
                                                : instantDirection[0]}
                                        </div>

                                        {/* indicateur rotation z (Alpha - Relatif) */}
                                        <div className="absolute flex h-full w-full items-center justify-center">
                                            <div
                                                className="h-16 w-1 bg-green-500 shadow-[0_0_10px_green]"
                                                style={{
                                                    transform: `rotate(${-(data.alpha ?? 0)}deg)`,
                                                }}
                                            >
                                                <div className="absolute -top-1 left-1/2 h-2 w-2 -translate-x-1/2 rounded-full bg-green-400" />
                                            </div>
                                        </div>

                                        {/* heading absolu/nord */}
                                        <div className="absolute flex h-full w-full items-center justify-center">
                                            <div
                                                className="h-16 w-1 bg-red-500 shadow-[0_0_10px_red]"
                                                style={{
                                                    transform: `rotate(${-(data.heading ?? 0)}deg)`,
                                                }}
                                            >
                                                <div className="absolute -top-1 left-1/2 h-2 w-2 -translate-x-1/2 rounded-full bg-red-400" />
                                            </div>
                                        </div>
                                    </div>

                                    {/* encoche */}
                                    <div className="absolute top-2 h-4 w-12 rounded-full bg-black" />
                                </div>
                            </div>

                            <AlphaInfoRow label={'Rouge'} value={'Nord Magnétique (Heading)'} />
                            <AlphaInfoRow label={'Vert'} value={'Rotation Relative (Alpha)'} />
                        </AlphaCard>
                    </div>

                    {/* col 2 : data */}
                    <div className="space-y-6">
                        <AlphaCard title="Données Brutes (Gyro)">
                            <div className="flex flex-col gap-2">
                                <AlphaInfoRow
                                    label="Heading (Nord)"
                                    value={`${Math.round(data.heading || 0)}°`}
                                />
                                <AlphaInfoRow
                                    label="Alpha (Z)"
                                    value={`${Math.round(data.alpha || 0)}°`}
                                />
                                <AlphaInfoRow
                                    label="Beta (X)"
                                    value={`${Math.round(data.beta || 0)}°`}
                                />
                                <AlphaInfoRow
                                    label="Gamma (Y)"
                                    value={`${Math.round(data.gamma || 0)}°`}
                                />
                            </div>
                        </AlphaCard>

                        <AlphaCard title="Interprétation Gestuelle">
                            <div className="space-y-4">
                                {/* bloc instant */}
                                <AlphaInfoRow
                                    label="Instantanné"
                                    value={instantDirection.toUpperCase()}
                                />
                                <AlphaInfoRow
                                    label="Validé (Stable > 500ms)"
                                    value={validatedDirection.toUpperCase()}
                                    active
                                />

                                <p className="text-muted text-xs">
                                    Maintenez une position pour valider. <br />
                                    Seuil: 20° | Stabilité: 500ms
                                </p>
                            </div>
                        </AlphaCard>
                    </div>
                </AlphaGrid>
            )}
        </>
    );
}
