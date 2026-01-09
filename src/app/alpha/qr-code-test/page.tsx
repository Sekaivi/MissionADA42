'use client';

import React, { useState } from 'react';

import { AlphaError } from '@/components/alpha/AlphaError';
import { AlphaQRScanner } from '@/components/alpha/AlphaQRScanner';
import { AlphaSuccess } from '@/components/alpha/AlphaSuccess';

export default function QRTestPage() {
    const [scannedData, setScannedData] = useState<string | null>(null);

    const handleQrResult = (result: string) => {
        console.log('QR Code détecté :', result);
        setScannedData(result);

        // Exemple : Vérifier si le QR est le bon
        if (result === 'CODE_SECRET_ESCAPE_GAME') {
            // Logique de victoire
            <AlphaSuccess message="Félicitations ! Code valide." />;
        } else {
            // Logique de défaite
            <AlphaError message="Code invalide." />;
        }
    };

    return (
        <div className="bg-surface min-h-screen p-8 text-white">
            <div className="mx-auto max-w-xl space-y-8">
                <h1 className="text-brand-emerald font-mono text-2xl font-bold">TEST MODULE QR</h1>

                <AlphaQRScanner onResult={handleQrResult} />

                {scannedData && <AlphaSuccess message={`DONNÉES DÉCHIFFRÉES : ${scannedData}`} />}
            </div>
        </div>
    );
}
