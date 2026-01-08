// src/components/alpha/AlphaInput.tsx
import React from 'react';

import clsx from 'clsx';

export type AlphaInputVariant = 'default' | 'success' | 'error';

interface AlphaInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    variant?: AlphaInputVariant;
}

const VARIANTS: Record<AlphaInputVariant, string> = {
    default: 'border-white/20 focus:border-brand-emerald focus:ring-brand-emerald',
    success:
        'border-brand-emerald bg-brand-emerald/10 text-brand-emerald focus:border-brand-emerald focus:ring-brand-emerald',
    error: 'border-brand-error bg-brand-error/10 text-brand-error focus:border-brand-error focus:ring-brand-error placeholder:text-brand-error/50',
};

export const AlphaInput = ({
    className,
    variant = 'default',
    disabled,
    ...props
}: AlphaInputProps) => (
    <input
        disabled={disabled}
        className={clsx(
            // base
            'bg-surface text-foreground placeholder:text-muted w-full rounded border px-4 py-3 font-mono transition-all duration-200 focus:ring-1 focus:outline-none',
            // disabled state
            'disabled:cursor-not-allowed disabled:opacity-50',
            // variants
            VARIANTS[variant],
            className
        )}
        {...props}
    />
);
