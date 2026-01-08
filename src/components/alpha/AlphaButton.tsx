'use client';

import React from 'react';

import clsx from 'clsx';

interface AlphaButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
    size?: 'sm' | 'md' | 'lg';
    isLoading?: boolean;
    isActive?: boolean;
    fullWidth?: boolean;
}

export const AlphaButton = ({
    children,
    className,
    variant = 'primary',
    size = 'md',
    isLoading = false,
    isActive = false,
    disabled,
    fullWidth = false,
    type = 'button',
    ...props
}: AlphaButtonProps) => {
    const variants = {
        primary:
            'border-brand-emerald text-brand-emerald bg-brand-emerald/10 hover:bg-brand-emerald hover:text-black',
        secondary: 'border-white/20 text-muted hover:border-white hover:text-white bg-transparent',
        danger: 'border-red-500 text-red-500 bg-red-500/10 hover:bg-red-500 hover:text-white',
        ghost: 'border-transparent text-muted hover:text-brand-emerald hover:bg-white/5',
    };

    const sizes = {
        sm: 'px-3 py-1 text-xs',
        md: 'px-6 py-2 text-sm',
        lg: 'px-8 py-3 text-base',
    };

    const activeStyles = isActive
        ? 'ring-1 ring-offset-1 ring-offset-black ring-brand-emerald bg-brand-emerald/20'
        : '';

    return (
        <button
            type={type}
            disabled={disabled || isLoading}
            className={clsx(
                // base
                'relative flex w-max items-center justify-center rounded border font-mono font-medium tracking-wider uppercase transition-all duration-200',
                // focus accessibility
                'focus:ring-brand-emerald/50 focus:ring-2 focus:outline-none',
                // animation de clic (seulement si actif)
                !disabled && !isLoading && 'active:bg-opacity-80 active:scale-95',
                // désactivé ?
                (disabled || isLoading) && 'cursor-not-allowed opacity-50 grayscale',
                // props dynamiques
                variants[variant],
                sizes[size],
                fullWidth && 'w-full',
                activeStyles,
                className // pour surcharger si besoin
            )}
            {...props}
        >
            {isLoading ? (
                <span className="flex items-center gap-2">
                    <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24">
                        <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                            fill="none"
                        />
                        <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                        />
                    </svg>
                    <span>Chargement...</span>
                </span>
            ) : (
                children
            )}
        </button>
    );
};
