// src/components/alpha/AlphaTerminalWrapper.tsx
'use client';

import React from 'react';

import clsx from 'clsx';
import { motion } from 'framer-motion';

export type TerminalVariant = 'default' | 'success' | 'warning' | 'error';

interface AlphaTerminalWrapperProps {
    children: React.ReactNode;
    variant?: TerminalVariant;
    className?: string;
    showScanline?: boolean;
}

const VARIANT_STYLES: Record<TerminalVariant, { border: string; bg: string }> = {
    default: {
        border: 'border-brand-blue',
        bg: 'bg-brand-blue/5',
    },
    success: {
        border: 'border-brand-emerald',
        bg: 'bg-brand-emerald/10',
    },
    warning: {
        border: 'border-brand-orange',
        bg: 'bg-brand-orange/10',
    },
    error: {
        border: 'border-brand-error',
        bg: 'bg-brand-error/10',
    },
};

export const AlphaTerminalWrapper: React.FC<AlphaTerminalWrapperProps> = ({
    children,
    variant = 'default',
    className,
    showScanline = true,
}) => {
    const styles = VARIANT_STYLES[variant];

    return (
        <motion.div
            layout
            className={clsx(
                'relative flex w-full flex-col overflow-hidden rounded-xl border-2 p-4 shadow-2xl transition-colors',
                styles.border,
                'bg-black',
                className
            )}
        >
            {/* scanlines */}
            {showScanline && (
                <div className="pointer-events-none absolute inset-0 z-0 bg-[linear-gradient(transparent_50%,rgba(255,255,255,0.02)_50%)] bg-[length:100%_4px]" />
            )}

            <div className="relative z-10 w-full">{children}</div>
        </motion.div>
    );
};
