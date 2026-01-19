import React from 'react';

import clsx from 'clsx';

type FeedbackType = 'success' | 'error' | 'info' | 'warning';

interface FeedbackPillProps {
    message: string;
    type?: FeedbackType;
    isLoading?: boolean;
    className?: string;
    pulse?: boolean;
}

const VARIANT_CONFIG: Record<FeedbackType, { container: string; dot: string }> = {
    success: {
        container: 'border-brand-emerald text-brand-emerald bg-brand-emerald/10',
        dot: 'bg-brand-emerald',
    },
    warning: {
        container: 'border-brand-orange text-brand-orange bg-brand-orange/10',
        dot: 'bg-brand-orange',
    },
    error: {
        container: 'border-brand-error text-brand-error bg-brand-red/10',
        dot: 'bg-brand-error',
    },
    info: {
        container: 'border-brand-blue text-brand-blue bg-brand-blue/20',
        dot: 'bg-brand-blue',
    },
};

const FeedbackPill: React.FC<FeedbackPillProps> = ({
    message,
    type = 'info',
    isLoading = false,
    pulse = false,
    className = '',
}) => {
    if (!message) return null;

    // si isLoading est vrai, on force le style 'info' et l'animation
    const activeType = isLoading ? 'info' : type;
    const isAnimating = isLoading || pulse;

    const { container: containerColors, dot: dotColor } = VARIANT_CONFIG[activeType];

    return (
        <span
            className={clsx(
                // base
                'inline-flex items-center gap-2 rounded-full border px-3 py-1 whitespace-nowrap',
                // typo
                'font-mono text-xs font-bold tracking-widest uppercase',
                // couleurs/anim
                containerColors,
                isAnimating && 'animate-pulse',
                // +
                className
            )}
        >
            <span className="relative flex h-2 w-2">
                <span
                    className={clsx(
                        'absolute inline-flex h-full w-full animate-ping rounded-full opacity-75',
                        dotColor
                    )}
                ></span>
                <span
                    className={clsx('relative inline-flex h-2 w-2 rounded-full', dotColor)}
                ></span>
            </span>
            {message}
        </span>
    );
};

export default FeedbackPill;
