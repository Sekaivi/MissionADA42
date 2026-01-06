// utilisation du gps vers les coordonées GPS de la salle 115

'use client';

import { useEffect } from 'react';

import { AlphaButton } from '@/components/alpha/AlphaButton';
import { AlphaCard } from '@/components/alpha/AlphaCard';
import { AlphaError } from '@/components/alpha/AlphaError';
import { AlphaGrid } from '@/components/alpha/AlphaGrid';
import { AlphaHeader } from '@/components/alpha/AlphaHeader';
import { AlphaInfoRow } from '@/components/alpha/AlphaInfoRow';
import { useGeolocation } from '@/hooks/useGeolocation';

export default function AlphaGeolocationDebug() {
    const { data, error, permissionGranted, requestPermission } = useGeolocation();

    useEffect(() => {
        requestPermission();
    });

    return (
        <>
            <AlphaHeader
                title="Capteurs d'Orientation"
                subtitle="Debug Gyroscope & Accéléromètre"
            />

            {/* cas iOS demande la permission */}
            {!permissionGranted && !error && (
                <div className="border-border bg-surface flex flex-col items-center justify-center rounded-lg border p-10">
                    <p className="text-muted mb-4">
                        L'accès aux capteurs nécessite une validation. Pensez à activer votre
                        géolocalisation.
                    </p>
                    <AlphaButton onClick={requestPermission}>
                        Autoriser l'accès aux capteurs
                    </AlphaButton>
                </div>
            )}

            <AlphaError message={error} />

            {permissionGranted && (
                <AlphaGrid>
                    {/* col 1 : data */}
                    <div className="space-y-6">
                        <AlphaCard title="Données Brutes (GPS)">
                            <div className="flex flex-col gap-2">
                                <AlphaInfoRow
                                    label="Longitude"
                                    value={`${data.longitude || 0}`}
                                />
                                <AlphaInfoRow
                                    label="Latitude"
                                    value={`${data.latitude || 0}`}
                                />
                                <AlphaInfoRow
                                    label="Altitude"
                                    value={`${data.altitude || 0}`}
                                />
                                <AlphaInfoRow
                                    label="Accuracy"
                                    value={`${data.accuracy || 0}`}
                                />
                            </div>
                        </AlphaCard>
                    </div>
                </AlphaGrid>
            )}
        </>
    );
}
