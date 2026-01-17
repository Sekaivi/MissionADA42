'use client';

import React, { useState } from 'react';

import { ColorScannerModule } from '@/components/Tutorial/ColorScannerModule';
import { FaceDetectionModule } from '@/components/Tutorial/FaceDetectionModule';
import { GyroscopeModule } from '@/components/Tutorial/GyroscopeModule';
import { AlphaButton } from '@/components/alpha/AlphaButton';
import { AlphaModal } from '@/components/alpha/AlphaModal';
import { AlphaQRScanner } from '@/components/alpha/AlphaQRScanner';
import { MODULES, ModuleId } from '@/data/modules';

/**
 * transforme n'importe quelle donnée en objet JSON valide (Record<string, unknown>)
 * - Si c'est déjà un objet : on le garde
 * - Si c'est une primitive (string, number) ou un array : on l'enrobe dans { value: ... }
 */
const normalizePayload = (data: unknown): Record<string, unknown> => {
    if (data && typeof data === 'object' && !Array.isArray(data)) {
        return data as Record<string, unknown>;
    }
    return { value: data };
};

interface ModuleTestModalProps {
    moduleId: ModuleId | null;
    onClose: () => void;
    onSuccess: (id: ModuleId, data: Record<string, unknown>) => void;
    isTutorial?: boolean;
}

export const ModuleTestModal = ({
    moduleId,
    onClose,
    onSuccess,
    isTutorial = false,
}: ModuleTestModalProps) => {
    const [isSimulating, setIsSimulating] = useState(false);
    const moduleConfig = MODULES.find((m) => m.id === moduleId);

    if (!moduleConfig || !moduleId) return null;

    // Simulation pour les modules non-implémentés
    const startSimulation = () => {
        setIsSimulating(true);
        setTimeout(() => {
            setIsSimulating(false);
            onSuccess(moduleId, { simulated: true, status: 'success' });
        }, 500);
    };

    const renderContent = () => {
        if (moduleId === 'facial_recognition') {
            return (
                <FaceDetectionModule
                    isSolved={false}
                    // DetectedFace est un objet, donc normalizePayload le laissera intact
                    onSolve={(detectedFace) =>
                        onSuccess('facial_recognition', normalizePayload(detectedFace))
                    }
                />
            );
        }

        if (moduleId === 'color_scanner') {
            return (
                <>
                    {isTutorial ? (
                        <p className="text-muted mb-4 text-center text-sm">
                            Calibration requise : Veuillez scanner un élément{' '}
                            <span className="font-bold text-red-500">ROUGE</span>.
                        </p>
                    ) : (
                        <p className="text-muted mb-4 text-center text-sm">
                            Analyseur de spectre actif. Scannez une couleur pour l'enregistrer.
                        </p>
                    )}

                    <ColorScannerModule
                        isSolved={false}
                        // en tuto on vise le rouge, sinon on accepte tout (null/undefined)
                        targetColorId={isTutorial ? 'red' : undefined}
                        // on renvoie la couleur détectée
                        onSolve={(color) => onSuccess('color_scanner', normalizePayload(color))}
                        sequenceHistory={[]}
                    />
                </>
            );
        }

        if (moduleId === 'qr_scanner') {
            return (
                <>
                    {isTutorial ? (
                        <p className="text-muted mb-4 text-center text-sm">
                            Calibration : Scannez{' '}
                            <span className="font-bold">n'importe quel QR Code</span> valide.
                        </p>
                    ) : (
                        <p className="text-muted mb-4 text-center text-sm">
                            Décodeur universel prêt. En attente de cible.
                        </p>
                    )}

                    <AlphaQRScanner
                        onScan={(code) => {
                            if (code && code.length > 0) {
                                // renvoie le contenu du QR Code
                                onSuccess('qr_scanner', { content: code, format: 'qr_code' });
                                return true;
                            }
                            return false;
                        }}
                        // Fallback
                        onSolve={() => onSuccess('qr_scanner', { status: 'manual_override' })}
                    />
                </>
            );
        }

        if (moduleId === 'gyroscope') {
            return (
                <>
                    {isTutorial ? (
                        <p className="text-muted mb-4 text-center text-sm">
                            Calibration : Maintenez votre téléphone{' '}
                            <span className="text-brand-emerald font-bold">
                                parfaitement à plat
                            </span>
                            .
                        </p>
                    ) : (
                        <p className="text-muted mb-4 text-center text-sm">
                            Capteur d'orientation actif.
                        </p>
                    )}

                    <GyroscopeModule
                        onSolve={(orientationData) => {
                            // renvoyer les données brutes
                            onSuccess('gyroscope', normalizePayload(orientationData));
                        }}
                    />
                </>
            );
        }

        // MODULES SIMULÉS (MICROPHONE, ETC)
        return (
            <div className="flex flex-col items-center gap-6 py-4">
                <div
                    className={`bg-surface rounded-full p-4 ${isSimulating ? 'animate-pulse' : ''}`}
                >
                    <moduleConfig.icon
                        className={`h-12 w-12 ${isSimulating ? 'text-brand-orange' : 'text-white'}`}
                    />
                </div>

                {isSimulating ? (
                    <p className="text-brand-orange animate-pulse font-mono">
                        {'>>'} ANALYSE EN COURS...
                    </p>
                ) : (
                    <AlphaButton onClick={startSimulation} size="lg" variant="primary">
                        {isTutorial ? 'Lancer le Diagnostic' : 'Activer le Module'}
                    </AlphaButton>
                )}
            </div>
        );
    };

    // on masque la description statique pour les modules visuels complexes
    const hideDescription = ['facial_recognition', 'color_scanner'].includes(moduleId);

    return (
        <AlphaModal
            isOpen={!!moduleId}
            title={
                isTutorial
                    ? `Calibration : ${moduleConfig.label}`
                    : `Module : ${moduleConfig.label}`
            }
            message={
                hideDescription ? undefined : isTutorial ? moduleConfig.description : undefined
            }
            onClose={onClose}
            hideIcon
        >
            {renderContent()}
        </AlphaModal>
    );
};
