import React, { ReactNode } from 'react';

import { ScanZoneSettings } from '@/types/colorDetection';

export const AlphaVideoContainer = ({
    children,
    scanSettings,
    label = 'LIVE FEED',
}: {
    children: ReactNode;
    scanSettings?: ScanZoneSettings; // Assure-toi d'importer le type
    label?: string;
}) => (
    <div className="group relative aspect-video overflow-hidden rounded-lg border-2 border-neutral-800 bg-black shadow-2xl">
        {children}

        <div className="absolute top-2 left-2 z-30 rounded border border-emerald-900/30 bg-black/70 px-2 py-1 text-[10px] font-bold text-emerald-500">
            {label}
        </div>

        {/* overlay de visée */}
        {scanSettings && (
            <div
                className="pointer-events-none absolute top-1/2 left-1/2 z-10 box-border rounded-lg border-2 border-dashed border-white/50 transition-all group-hover:border-white/80"
                style={{
                    width: `${scanSettings.size}px`,
                    height: `${scanSettings.size}px`,
                    transform: `translate(calc(-50% + ${scanSettings.xOffset || 0}px), calc(-50% + ${scanSettings.yOffset || 0}px))`,
                }}
            />
        )}
    </div>
);
