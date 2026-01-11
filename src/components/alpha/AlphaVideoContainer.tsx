import React, { ReactNode, RefObject } from 'react';

import clsx from 'clsx';

import { ScanZoneSettings } from '@/types/colorDetection';

interface AlphaVideoContainerProps {
    children?: ReactNode; // pour les overlays (textes, cadres spécifiques)
    scanSettings?: ScanZoneSettings;
    label?: string;
    className?: string;

    // gestion intégrée de la vidéo
    videoRef?: RefObject<HTMLVideoElement | null>; // pour les video natives
    qrMountRef?: RefObject<HTMLDivElement | null>; // pour le scanner QR
    qrElementId?: string; // id requis par la lib html5-qrcode
}

export const AlphaVideoContainer = ({
    children,
    scanSettings,
    label = 'LIVE FEED',
    className = '',
    videoRef,
    qrMountRef,
    qrElementId,
}: AlphaVideoContainerProps) => {
    return (
        <div
            className={clsx(
                'group relative aspect-video w-full overflow-hidden rounded-lg border-2 bg-black shadow-2xl transition-colors duration-300',
                !className?.includes('border-') && 'border-border',
                className
            )}
        >
            {/* vidéo native */}
            {videoRef && (
                <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className={'h-full w-full scale-x-[-1] object-cover'}
                />
            )}

            {/* QR Code (div mount) */}
            {qrMountRef && (
                <div
                    id={qrElementId}
                    ref={qrMountRef}
                    // la lib QR injecte sa propre video
                    className={
                        'h-full w-full overflow-hidden [&_video]:!h-full [&_video]:!w-full [&_video]:scale-x-[-1] [&_video]:!object-cover'
                    }
                />
            )}

            <div className="border-brand-emerald/30 text-brand-emerald absolute top-2 left-2 z-30 rounded border bg-black/70 px-2 py-1 text-[10px] font-bold backdrop-blur-sm">
                {label}
            </div>

            {/* overlay de visée (ScanSettings) */}
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

            <div
                className={`pointer-events-none absolute inset-0 z-20 bg-[linear-gradient(rgba(16,185,129,0)_50%,rgba(16,185,129,0.1)_50%)] bg-[length:100%_4px] opacity-20`}
            />

            {/* overlays spécifiques */}
            {children}
        </div>
    );
};
