'use client';

import React, { useEffect, useMemo, useSyncExternalStore } from 'react';
import { createPortal } from 'react-dom';

import {
    CheckCircleIcon,
    ExclamationTriangleIcon,
    InformationCircleIcon,
} from '@heroicons/react/24/solid';
import { AnimatePresence, motion } from 'framer-motion';

export type ModalVariant = 'success' | 'error' | 'info';
export type DurationUnit = 's' | 'ms';

interface AlphaModalProps {
    isOpen: boolean;
    variant?: ModalVariant;
    title?: string;
    message?: string;
    subMessage?: string;
    Icon?: React.ElementType;

    /** durée avant fermeture automatique */
    autoCloseDuration?: number;

    /** * unité de temps pour autoCloseDuration.
     * @default 's'
     */
    durationUnit?: DurationUnit;

    onAutoClose?: () => void;
    onClose?: () => void;
    actionLabel?: string;
}

const THEME_CONFIG = {
    success: {
        primary: 'text-brand-emerald',
        border: 'border-brand-emerald/50',
        bg: 'bg-brand-emerald/20',
        glow: 'bg-brand-emerald/20',
        shadow: 'shadow-[0_0_40px_rgba(16,185,129,0.2)]',
        bar: 'bg-brand-emerald',
        defaultIcon: CheckCircleIcon,
    },
    error: {
        primary: 'text-brand-error',
        border: 'border-brand-error/50',
        bg: 'bg-brand-error/20',
        glow: 'bg-brand-red/20',
        shadow: 'shadow-[0_0_40px_rgba(239,68,68,0.2)]',
        bar: 'bg-brand-red',
        defaultIcon: ExclamationTriangleIcon,
    },
    info: {
        primary: 'text-brand-blue',
        border: 'border-brand-blue/50',
        bg: 'bg-brand-blue/20',
        glow: 'bg-brand-blue/20',
        shadow: 'shadow-[0_0_40px_rgba(59,130,246,0.2)]',
        bar: 'bg-brand-blue',
        defaultIcon: InformationCircleIcon,
    },
};

export const AlphaModal: React.FC<AlphaModalProps> = ({
    isOpen,
    variant = 'success',
    title,
    message,
    subMessage,
    Icon,
    autoCloseDuration,
    durationUnit = 's',
    onAutoClose,
    onClose,
    actionLabel = 'Fermer',
}) => {
    const theme = THEME_CONFIG[variant];
    const DisplayIcon = Icon || theme.defaultIcon;

    const isClient = useSyncExternalStore(
        () => () => {},
        () => true,
        () => false
    );

    // calcul déterministe des durées
    const durationData = useMemo(() => {
        if (!autoCloseDuration) return null;

        return {
            // Framer Motion attend des secondes
            seconds: durationUnit === 's' ? autoCloseDuration : autoCloseDuration / 1000,
            // setTimeout attend des ms
            ms: durationUnit === 'ms' ? autoCloseDuration : autoCloseDuration * 1000,
        };
    }, [autoCloseDuration, durationUnit]);

    useEffect(() => {
        if (isOpen && durationData && onAutoClose) {
            const timer = setTimeout(onAutoClose, durationData.ms);
            return () => clearTimeout(timer);
        }
    }, [isOpen, durationData, onAutoClose]);

    const target = typeof document !== 'undefined' ? document.body : null;
    if (!isClient) return null;
    if (!target) return null;

    const modalContent = (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
                    {/* overlay */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/80"
                    />

                    <motion.div
                        initial={{ scale: 0.9, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.9, opacity: 0, y: 20 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                        className="relative z-10 w-full max-w-sm"
                    >
                        <div
                            className={`bg-background border ${theme.border} rounded-xl ${theme.shadow} overflow-hidden`}
                        >
                            <div className={`${theme.bg} border-b p-2 text-center ${theme.border}`}>
                                <p
                                    className={`text-[10px] font-black tracking-[0.2em] uppercase ${theme.primary}`}
                                >
                                    {title || variant.toUpperCase()}
                                </p>
                            </div>

                            <div className="flex flex-col items-center p-8 text-center">
                                <div className="relative mb-6">
                                    <div
                                        className={`absolute inset-0 ${theme.glow} animate-pulse rounded-full blur-xl`}
                                    />
                                    <DisplayIcon
                                        className={`relative h-16 w-16 ${theme.primary}`}
                                    />
                                </div>

                                <h3 className="text-foreground mb-2 text-xl font-bold">
                                    {message}
                                </h3>
                                {subMessage && (
                                    <p className="text-muted font-mono text-sm leading-relaxed">
                                        {subMessage}
                                    </p>
                                )}

                                {!durationData && onClose && (
                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={onClose}
                                        className={`mt-6 rounded-full border px-6 py-2 ${theme.border} ${theme.bg} ${theme.primary} hover:bg-opacity-40 text-xs font-bold tracking-wider uppercase transition-all`}
                                    >
                                        {actionLabel}
                                    </motion.button>
                                )}
                            </div>

                            {/* barre de progression */}
                            <div className="bg-foreground h-1 w-full">
                                {durationData ? (
                                    <motion.div
                                        className={`h-full ${theme.bar}`}
                                        initial={{ width: '0%' }}
                                        animate={{ width: '100%' }}
                                        transition={{
                                            duration: durationData.seconds,
                                            ease: 'linear',
                                        }}
                                    />
                                ) : (
                                    <div className={`h-full w-full ${theme.bar} opacity-50`} />
                                )}
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );

    return createPortal(modalContent, target);
};
