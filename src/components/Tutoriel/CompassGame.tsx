'use client';
import React, { useEffect, useState } from 'react';

import Button from '@/components/ui/Button';

// Extension pour TypeScript (car ces propriétés Apple ne sont pas standard)
interface DeviceOrientationEventiOS extends DeviceOrientationEvent {
    requestPermission?: () => Promise<'granted' | 'denied'>;
    webkitCompassHeading?: number;
}

export default function CompassGame({ onSuccess }: { onSuccess: () => void }) {
    const [orientation, setOrientation] = useState(0);
    const [isAligned, setIsAligned] = useState(false);
    const [permissionGranted, setPermissionGranted] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Cible : 190° (Sud-Sud-Ouest) par exemple
    const target = 190;

    // Fonction déclenchée par le CLIC utilisateur (Obligatoire pour iOS)
    const requestAccess = async () => {
        if (
            typeof (DeviceOrientationEvent as unknown as DeviceOrientationEventiOS)
                .requestPermission === 'function'
        ) {
            // Cas iOS 13+
            try {
                const permissionState = await (
                    DeviceOrientationEvent as unknown as DeviceOrientationEventiOS
                ).requestPermission!();
                if (permissionState === 'granted') {
                    setPermissionGranted(true);
                } else {
                    setError('Permission refusée. Vérifiez vos réglages.');
                }
            } catch (e) {
                console.error(e);
                setError('Erreur lors de la demande de permission.');
            }
        } else {
            // Cas Android / iOS < 13 / PC
            setPermissionGranted(true);
        }
    };

    useEffect(() => {
        if (!permissionGranted) return;

        const handleOrientation = (e: DeviceOrientationEventiOS) => {
            let angle = 0;

            // Priorité à la propriété iOS (plus précise)
            if (e.webkitCompassHeading) {
                // Sur iOS, l'angle est inversé par rapport à Android standard parfois
                angle = e.webkitCompassHeading;
            } else if (e.alpha !== null) {
                // Android Standard
                // 360 - alpha pour tourner dans le sens des aiguilles d'une montre
                angle = 360 - e.alpha;
            }

            setOrientation(angle);

            // Logique de victoire
            let diff = Math.abs(angle - target);
            if (diff > 180) diff = 360 - diff; // Gestion du passage 359° -> 0°

            // Marge d'erreur de 15 degrés
            if (diff < 15) {
                setIsAligned(true);
                // Note : On ne déclenche pas onSuccess auto ici pour éviter le skip
            } else {
                setIsAligned(false);
            }
        };

        window.addEventListener('deviceorientation', handleOrientation as EventListener);
        return () =>
            window.removeEventListener('deviceorientation', handleOrientation as EventListener);
    }, [permissionGranted, target]);

    return (
        <div className="flex w-full flex-col items-center">
            <h2 className="mb-4 text-xl font-bold text-orange-600">ÉTAPE 3/5 : GYROSCOPE</h2>

            {!permissionGranted ? (
                <div className="rounded-xl border border-orange-200 bg-orange-50 p-6 text-center">
                    <p className="mb-4 text-sm text-gray-700">
                        Le module de navigation nécessite une calibration manuelle.
                    </p>
                    <Button onClick={requestAccess}>INITIALISER GYROSCOPE</Button>
                    {error && <p className="mt-2 text-xs text-red-500">{error}</p>}
                </div>
            ) : (
                <>
                    <p className="mb-4 text-center text-gray-600">
                        Tournez-vous pour aligner le capteur sur{' '}
                        <span className="font-bold">{target}°</span>.
                    </p>

                    <div
                        className="relative mb-6 flex h-48 w-48 items-center justify-center rounded-full border-4 border-gray-300 bg-white shadow-inner transition-all duration-300"
                        style={{ borderColor: isAligned ? '#22c55e' : '#d1d5db' }}
                    >
                        {/* --- CIBLE VERTE (Fixe sur le cadran, bouge selon la target) --- */}
                        <div
                            className="absolute top-0 z-0 h-6 w-4 rounded bg-green-500/50"
                            style={{
                                transform: `rotate(${target}deg)`,
                                transformOrigin: 'center 96px',
                            }}
                        />

                        {/* --- AIGUILLE ROUGE (Bouge avec le téléphone) --- */}
                        <div
                            className="z-10 h-24 w-2 origin-bottom rounded-full bg-red-600 transition-transform duration-100 ease-out"
                            style={{ transform: `rotate(${orientation}deg) translateY(-50%)` }}
                        />

                        {/* Point central */}
                        <div className="absolute z-20 h-6 w-6 rounded-full border-2 border-white bg-gray-800" />

                        {/* Affichage des degrés au centre si aligné */}
                        {isAligned && (
                            <div className="absolute top-28 rounded bg-white/80 px-2 font-bold text-green-600">
                                OK
                            </div>
                        )}
                    </div>

                    <p className="mb-4 font-mono text-lg text-gray-500">
                        CAP : {orientation.toFixed(0)}°
                    </p>

                    {/* Bouton de validation manuelle */}
                    {isAligned ? (
                        <div className="animate-bounce">
                            <Button onClick={onSuccess}>SIGNAL VERROUILLÉ ➜</Button>
                        </div>
                    ) : (
                        <p className="animate-pulse text-xs text-orange-400">
                            Recherche du signal...
                        </p>
                    )}
                </>
            )}
        </div>
    );
}
