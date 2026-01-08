import React from 'react';

import clsx from 'clsx';

import { AlphaButton } from '@/components/alpha/AlphaButton';

export type MessageVariant = 'success' | 'error' | 'warning' | 'info';

interface AlphaMessageScreenProps {
    variant?: MessageVariant;
    title: string;
    description: React.ReactNode; // texte ou JSX
    actionLabel: string;
    onAction: () => void;
    className?: string;
    titleClassName?: string;
}

const VARIANT_STYLES: Record<MessageVariant, string> = {
    success: 'text-brand-emerald',
    error: 'text-brand-error',
    warning: 'text-brand-orange',
    info: 'text-brand-blue',
};

const BUTTON_VARIANTS: Record<MessageVariant, 'primary' | 'danger' | 'secondary'> = {
    success: 'primary',
    error: 'danger',
    warning: 'secondary',
    info: 'secondary',
};

export const AlphaMessageScreen = ({
    variant = 'info',
    title,
    description,
    actionLabel,
    onAction,
    className,
    titleClassName,
}: AlphaMessageScreenProps) => {
    const colorClass = VARIANT_STYLES[variant];

    return (
        <div
            className={clsx(
                'animate-in fade-in flex h-full w-full flex-col items-center justify-center space-y-8 p-6 text-center duration-500',
                className
            )}
        >
            <h2
                className={clsx(
                    'text-5xl font-black tracking-widest uppercase drop-shadow-lg',
                    colorClass,
                    titleClassName
                )}
            >
                {title}
            </h2>

            <p
                className={clsx(
                    'font-mono text-sm leading-relaxed whitespace-pre-wrap opacity-90',
                    colorClass
                )}
            >
                {description}
            </p>

            <AlphaButton
                onClick={onAction}
                variant={BUTTON_VARIANTS[variant]}
                size="lg"
                className="mx-auto min-w-[200px]"
            >
                {actionLabel}
            </AlphaButton>
        </div>
    );
};
