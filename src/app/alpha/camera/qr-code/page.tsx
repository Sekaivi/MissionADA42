'use client';

import React from 'react';

import { AlphaHeader } from '@/components/alpha/AlphaHeader';
import { AlphaQRScanner } from '@/components/alpha/AlphaQRScanner';

const API_BASE = process.env.NEXT_PUBLIC_API_URL;

export default function QRTestPage() {
    return (
        <>
            <AlphaHeader title={'Module de QR Code'} />

            <AlphaQRScanner
                target={API_BASE + '/preuve/{id}'}
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
