'use client';

import React, { useEffect, useMemo, useSyncExternalStore } from 'react';
import { createPortal } from 'react-dom';

import {
    CheckCircleIcon,
    ExclamationTriangleIcon,
    InformationCircleIcon,
    XMarkIcon,
} from '@heroicons/react/24/solid';
import { AnimatePresence, motion } from 'framer-motion';

import { ThemedPortalWrapper } from '@/components/ThemedPortalWrapper';

export type ModalVariant = 'success' | 'error' | 'info';
export type DurationUnit = 's' | 'ms';

interface AlphaModalProps {
    isOpen: boolean;
    variant?: ModalVariant;
    title?: string;
    message?: string;
    subMessage?: string;
    Icon?: React.ElementType;
    hideIcon?: boolean;
    children?: React.ReactNode;

    /** durée avant fermeture automatique */
    autoCloseDuration?: number;

    /** unité de temps pour autoCloseDuration.
     * @default 's'
     */
    durationUnit?: DurationUnit;

    onAutoClose?: () => void;

    /** fonction appelée lors du clic sur la croix ou l'overlay */
    onClose?: () => void;

    /** fonction appelée lors du clic sur le bouton principal */
    onAction?: () => void;

    /** label du bouton principal. Si non défini, le bouton n'apparaît que si onAction est présent */
    actionLabel?: string;

    /** cacher la croix de fermeture */
    hideCloseButton?: boolean;
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
    variant = 'info',
    title,
    message,
    subMessage,
    Icon,
    hideIcon = false,
    children,
    autoCloseDuration,
    durationUnit = 's',
    onAutoClose,
    onClose,
    onAction,
    actionLabel = 'Valider',
    hideCloseButton = false,
}) => {
    const theme = THEME_CONFIG[variant];
    const DisplayIcon = Icon || theme.defaultIcon;

    // hook pour éviter les erreurs d'hydratation Next.js avec les Portals
    const isClient = useSyncExternalStore(
        () => () => {},
        () => true,
        () => false
    );

    // calcul déterministe des durées
    const durationData = useMemo(() => {
        if (!autoCloseDuration) return null;

        return {
            seconds: durationUnit === 's' ? autoCloseDuration : autoCloseDuration / 1000,
            ms: durationUnit === 'ms' ? autoCloseDuration : autoCloseDuration * 1000,
        };
    }, [autoCloseDuration, durationUnit]);

    // timer Auto-close
    useEffect(() => {
        if (isOpen && durationData && onAutoClose) {
            const timer = setTimeout(onAutoClose, durationData.ms);
            return () => clearTimeout(timer);
        }
    }, [isOpen, durationData, onAutoClose]);

    const target = typeof document !== 'undefined' ? document.body : null;
    if (!isClient || !target) return null;

    const modalContent = (
        <AnimatePresence>
            {isOpen && (
                <ThemedPortalWrapper>
                    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
                        {/* overlay ferme la modale si on clique à côté */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={onClose}
                            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                        />

                        {/* fenêtre modale */}
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
                                <div
                                    className={`${theme.bg} border-b p-2 text-center ${theme.border} relative`}
                                >
                                    <p
                                        className={`text-xs font-black tracking-[0.2em] uppercase ${theme.primary}`}
                                    >
                                        {title || variant.toUpperCase()}
                                    </p>

                                    {!hideCloseButton && onClose && (
                                        <button
                                            onClick={onClose}
                                            className={`hover:bg-surface text-brand-error absolute top-1/2 right-2 -translate-y-1/2 rounded-full p-1 transition-colors`}
                                        >
                                            <XMarkIcon className="h-4 w-4" />
                                        </button>
                                    )}
                                </div>

                                <div className="flex flex-col items-center p-8 text-center">
                                    {!hideIcon && (
                                        <div className="relative mb-6">
                                            <div
                                                className={`absolute inset-0 ${theme.glow} animate-pulse rounded-full blur-xl`}
                                            />
                                            <DisplayIcon
                                                className={`relative h-16 w-16 ${theme.primary}`}
                                            />
                                        </div>
                                    )}

                                    {message && (
                                        <h3 className="text-foreground mb-2 text-xl font-bold">
                                            {message}
                                        </h3>
                                    )}

                                    {subMessage && (
                                        <p className="text-muted font-mono text-sm leading-relaxed">
                                            {subMessage}
                                        </p>
                                    )}

                                    {children && <div className="mt-4 w-full">{children}</div>}

                                    {/* bouton d'action */}
                                    {!durationData && onAction && (
                                        <motion.button
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            onClick={onAction}
                                            className={`mt-6 rounded-full border px-6 py-2 ${theme.border} ${theme.bg} ${theme.primary} hover:bg-opacity-40 text-xs font-bold tracking-wider uppercase transition-all`}
                                        >
                                            {actionLabel}
                                        </motion.button>
                                    )}
                                </div>

                                {/* barre de progression (si auto-close) */}
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
                </ThemedPortalWrapper>
            )}
        </AnimatePresence>
    );

    return createPortal(modalContent, target);
};
