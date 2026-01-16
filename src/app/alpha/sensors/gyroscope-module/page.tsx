'use client';

import React from 'react';

import { GyroscopeModule } from '@/components/Tutorial/GyroscopeModule';
import { AlphaHeader } from '@/components/alpha/AlphaHeader';

export default function QRTestPage() {
    return (
        <>
            <AlphaHeader title={'Module de gyroscope'} />

            <GyroscopeModule onSolve={() => {}} />
        </>
    );
}
