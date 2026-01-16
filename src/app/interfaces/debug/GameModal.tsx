'use client';

import React from 'react';

import { XMarkIcon } from '@heroicons/react/24/outline';

const VARIANTS = {
    danger: {
        border: 'border-brand-error',
        text: 'text-brand-error',
        headerBg: 'bg-brand-error/10',
        divider: 'border-brand-error/30',
    },
    primary: {
        border: 'border-brand-emerald',
        text: 'text-brand-emerald',
        headerBg: 'bg-brand-emerald/10',
        divider: 'border-brand-emerald/30',
    },
};

export type ModalVariant = keyof typeof VARIANTS;

interface GameModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    icon?: React.ReactNode;
    children: React.ReactNode;
    footer?: React.ReactNode;
    variant?: ModalVariant;
}

export const GameModal = ({
    isOpen,
    onClose,
    title,
    icon,
    children,
    footer,
    variant = 'danger',
}: GameModalProps) => {
    if (!isOpen) return null;

    const styles = VARIANTS[variant];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
                className="bg-background/80 absolute inset-0 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            />

            <div
                className={`bg-background relative w-full max-w-sm border-2 ${styles.border} ${styles.text} shadow-2xl`}
            >
                <div
                    className={`flex items-center justify-between border-b-2 p-3 ${styles.border} ${styles.headerBg}`}
                >
                    <div className="flex items-center gap-2 text-sm font-bold tracking-widest uppercase">
                        {icon && <span className="h-5 w-5">{icon}</span>}
                        <span>{title}</span>
                    </div>
                    <button
                        onClick={onClose}
                        className={`transition-transform hover:scale-110 hover:rotate-90 ${styles.text}`}
                    >
                        <XMarkIcon className="h-6 w-6" />
                    </button>
                </div>

                <div className="max-h-[70vh] overflow-y-auto p-6">{children}</div>

                {footer && <div className={`border-t p-4 ${styles.divider}`}>{footer}</div>}
            </div>
        </div>
    );
};
