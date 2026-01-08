// src/components/alpha/AlphaInput.tsx
import React from 'react';
import clsx from 'clsx';

export type AlphaInputVariant = 'default' | 'success' | 'error';

interface AlphaInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    variant?: AlphaInputVariant;
}

const VARIANTS: Record<AlphaInputVariant, string> = {
    default: 'border-white/20 focus:border-brand-emerald focus:ring-brand-emerald',
    success: 'border-brand-emerald bg-brand-emerald/10 text-brand-emerald focus:border-brand-emerald focus:ring-brand-emerald',
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
            "w-full rounded border bg-surface px-4 py-3 font-mono text-foreground placeholder:text-muted focus:outline-none focus:ring-1 transition-all duration-200",
            // disabled state
            "disabled:opacity-50 disabled:cursor-not-allowed",
            // variants
            VARIANTS[variant],
            className
        )}
        {...props}
    />
);