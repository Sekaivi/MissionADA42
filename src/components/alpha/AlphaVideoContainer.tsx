import React, { ReactNode, RefObject } from 'react';

import clsx from 'clsx';
import { motion } from 'framer-motion';

import { ScanZoneSettings } from '@/types/colorDetection';

export type ScanStatus = 'idle' | 'scanning' | 'detected' | 'success' | 'error' | 'warning';

interface AlphaVideoContainerProps {
    children?: ReactNode;
    scanSettings?: ScanZoneSettings;
    label?: string;
    className?: string;
    scanStatus?: ScanStatus;
    videoRef?: RefObject<HTMLVideoElement | null>;
    qrMountRef?: RefObject<HTMLDivElement | null>;
    qrElementId?: string;
    isMirrored?: boolean;
}

export const AlphaVideoContainer = ({
    children,
    scanSettings,
    label = 'LIVE FEED',
    className = '',
    videoRef,
    qrMountRef,
    qrElementId,
    isMirrored = false,
    scanStatus = 'idle',
}: AlphaVideoContainerProps) => {
    const variants = {
        idle: {
            scale: 1,
            borderColor: 'rgba(255, 255, 255, 0.3)',
            borderWidth: 2,
            borderStyle: 'dashed',
        },
        scanning: {
            scale: 0.95,
            borderColor: 'var(--color-brand-blue)',
            borderWidth: 4,
            borderStyle: 'solid',
        },
        detected: {
            scale: 1.15,
            borderColor: '#ffffff',
            borderWidth: 3,
            borderStyle: 'solid',
            boxShadow: '0 0 20px rgba(255,255,255,0.4)',
        },
        success: {
            scale: 1.2,
            borderColor: 'var(--color-brand-emerald)',
            borderWidth: 4,
            borderStyle: 'solid',
        },
        error: {
            scale: 1.1,
            borderColor: 'var(--color-brand-error)',
            borderWidth: 4,
            borderStyle: 'solid',
        },
        warning: {
            scale: 1.05,
            borderColor: 'var(--color-brand-orange)',
            borderWidth: 4,
            borderStyle: 'dashed',
        },
    };
    return (
        <div
            className={clsx(
                'group relative w-full rounded-lg border bg-black transition-colors duration-300',
                'border-border h-full min-h-[300px]',
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
                    className={clsx(
                        'absolute inset-0 h-full w-full transform-gpu object-cover',
                        isMirrored && 'rotate-y-180'
                    )}
                />
            )}

            {/* QR Code (div mount) */}
            {qrMountRef && (
                <div
                    id={qrElementId}
                    ref={qrMountRef}
                    className={clsx(
                        'h-full w-full overflow-hidden',
                        isMirrored && '[&_video]:rotate-y-180'
                    )}
                />
            )}

            {/* label en haut à gauche */}
            <div className="border-brand-emerald/30 text-brand-emerald bg-surface/50 pointer-events-none absolute top-2 left-2 z-30 rounded border px-2 py-1 text-xs font-bold backdrop-blur-sm">
                {label}
            </div>

            {/* overlay de visée (ScanSettings) */}
            {scanSettings && (
                <div
                    className="pointer-events-none absolute top-0 left-0"
                    style={{
                        // 1. Le conteneur parent gère UNIQUEMENT la position (x, y)
                        // Cela évite le conflit avec le "scale" de l'enfant
                        width: `${scanSettings.size}px`,
                        height: `${scanSettings.size}px`,
                        left: '50%',
                        top: '50%',
                        marginLeft: `-${scanSettings.size / 2}px`, // Centrage CSS classique pour éviter translate()
                        marginTop: `-${scanSettings.size / 2}px`,
                        transform: `translate(${scanSettings.xOffset || 0}px, ${scanSettings.yOffset || 0}px)`,
                    }}
                >
                    <motion.div
                        className="h-full w-full rounded-lg"
                        initial="idle"
                        animate={scanStatus}
                        variants={variants}
                        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                    />
                </div>
            )}

            {/* scanlines décoratives */}
            <div
                className={`pointer-events-none absolute inset-0 z-20 bg-[linear-gradient(rgba(16,185,129,0)_50%,rgba(16,185,129,0.1)_50%)] bg-[length:100%_4px] opacity-20`}
            />

            {/* overlays supplémentaires */}
            {children}
        </div>
    );
};
