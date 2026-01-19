'use client';

import { MicrophoneModule } from '@/components/Tutorial/MicrophoneModule';
import { AlphaHeader } from '@/components/alpha/AlphaHeader';

export default function MicrophoneDebug() {
    return (
        <>
            <AlphaHeader
                title="Debug Microphone"
                subtitle="Vérification des flux audio et calibration"
            />

            <MicrophoneModule onSolve={() => {}} />
        </>
    );
}
