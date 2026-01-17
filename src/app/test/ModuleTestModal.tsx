'use client';

import React, { useState } from 'react';

import { ColorScannerModule } from '@/components/Tutorial/ColorScannerModule';
import { FaceDetectionModule } from '@/components/Tutorial/FaceDetectionModule';
import { GyroscopeModule } from '@/components/Tutorial/GyroscopeModule';
import { AlphaButton } from '@/components/alpha/AlphaButton';
import { AlphaModal } from '@/components/alpha/AlphaModal';
import { AlphaQRScanner } from '@/components/alpha/AlphaQRScanner';
import { MODULES, ModuleId } from '@/data/modules';

interface ModuleTestModalProps {
    moduleId: ModuleId | null;
    onClose: () => void;
    onSuccess: (id: ModuleId) => void;
}

export const ModuleTestModal = ({ moduleId, onClose, onSuccess }: ModuleTestModalProps) => {
    // État pour la simulation des autres modules
    const [isSimulating, setIsSimulating] = useState(false);

    const moduleConfig = MODULES.find((m) => m.id === moduleId);

    if (!moduleConfig || !moduleId) return null;

    // Fonction de simulation pour les modules pas encore codés
    const startSimulation = () => {
        setIsSimulating(true);
        setTimeout(() => {
            setIsSimulating(false);
            onSuccess(moduleId);
        }, 500);
    };

    const renderContent = () => {
        // Reconnaissance Faciale
        // if (moduleId === 'facial_recognition') {
        //     return (
        //         <FaceDetectionModule
        //             isSolved={false}
        //             onSolve={() => onSuccess('facial_recognition')}
        //         />
        //     );
        // }
        //
        // // Scanner de couleurs
        // if (moduleId === 'color_scanner') {
        //     return (
        //         <>
        //             <p className="text-muted mb-4 text-center text-sm">
        //                 Calibration requise : Veuillez scanner un élément{' '}
        //                 <span className="font-bold text-red-500">ROUGE</span>.
        //             </p>
        //
        //             <ColorScannerModule
        //                 isSolved={false}
        //                 targetColorId="red"
        //                 onSolve={() => onSuccess('color_scanner')}
        //                 sequenceHistory={[]}
        //             />
        //         </>
        //     );
        // }
        //
        // // QR Scanner
        // if (moduleId === 'qr_scanner') {
        //     return (
        //         <>
        //             <p className="text-muted mb-4 text-center text-sm">
        //                 Calibration : Scannez{' '}
        //                 <span className="font-bold">n'importe quel QR Code</span> valide.
        //             </p>
        //
        //             <AlphaQRScanner
        //                 onScan={(code) => {
        //                     if (code.length > 0) {
        //                         onSuccess('qr_scanner');
        //                         return true;
        //                     }
        //                     return false;
        //                 }}
        //                 onSolve={() => onSuccess('qr_scanner')}
        //             />
        //         </>
        //     );
        // }
        //
        // // gyroscope
        // if (moduleId === 'gyroscope') {
        //     return (
        //         <>
        //             <p className="text-muted mb-4 text-center text-sm">
        //                 Calibration : Maintenez votre téléphone{' '}
        //                 <span className="text-brand-emerald font-bold">parfaitement à plat</span>.
        //             </p>
        //
        //             <GyroscopeModule
        //                 onSolve={() => {
        //                     onSuccess('gyroscope');
        //                 }}
        //             />
        //         </>
        //     );
        // }

        // simuler le reste
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
                        Lancer le Diagnostic
                    </AlphaButton>
                )}
            </div>
        );
    };

    // cache la description par défaut pour FaceID et ColorScanner car ils ont leur propre UI
    const hideDescription = ['facial_recognition', 'color_scanner'].includes(moduleId);

    return (
        <AlphaModal
            isOpen={!!moduleId}
            title={`Test : ${moduleConfig.label}`}
            message={hideDescription ? undefined : moduleConfig.description}
            onClose={onClose}
            hideIcon
        >
            {renderContent()}
        </AlphaModal>
    );
};
