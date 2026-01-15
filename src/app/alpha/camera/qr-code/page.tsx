'use client';

import React from 'react';

import { AlphaHeader } from '@/components/alpha/AlphaHeader';
import { AlphaQRScanner } from '@/components/alpha/AlphaQRScanner';

export default function QRTestPage() {
    return (
        <>
            <AlphaHeader title={'Module de QR Code'} />

            <AlphaQRScanner
                // target={'https://gricad-gitlab.univ-grenoble-alpes.fr/mmi-students-projects/s5-2026/sae501/groupe-1/sae501-groupe1/-/merge_requests/16'}
                onScan={(code) => {
                    console.log(code);
                    return true;
                }}
                onSolve={() =>
                    window.alert(
                        "Bravo, vous avez réussi le module QR Code ! Lors de l'escape game, on passerait à l'étape suivante."
                    )
                }
            />
        </>
    );
}
