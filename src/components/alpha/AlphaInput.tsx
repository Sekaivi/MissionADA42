import React, { useId } from 'react';

import clsx from 'clsx';

export type AlphaInputVariant = 'default' | 'success' | 'error';

interface AlphaInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    variant?: AlphaInputVariant;
    containerClassName?: string;
    required?: boolean;
}

const VARIANTS: Record<AlphaInputVariant, string> = {
    default: 'border-border focus:border-foreground focus:ring-foreground',
    success:
        'border-brand-emerald bg-brand-emerald/10 text-brand-emerald focus:border-brand-emerald focus:ring-brand-emerald',
    error: 'border-brand-error bg-brand-error/10 text-brand-error focus:border-brand-error focus:ring-brand-error placeholder:text-brand-error/50',
};

export const AlphaInput = ({
    className,
    containerClassName,
    variant = 'default',
    disabled,
    label,
    error,
    id,
    required = false,
    ...props
}: AlphaInputProps) => {
    // id unique si aucun n'est fourni
    const generatedId = useId();
    const inputId = id || generatedId;

    // si une erreur est présente, on force la variante 'error' (sauf si forcé autrement)
    const activeVariant = error ? 'error' : variant;

    return (
        <div className={clsx('flex flex-col gap-1.5', containerClassName)}>
            {label && (
                <label
                    htmlFor={inputId}
                    className={clsx(
                        'text-xs font-bold uppercase transition-colors',
                        activeVariant === 'error' ? 'text-brand-error' : 'text-muted'
                    )}
                >
                    {label} {required && <span className={'text-brand-error'}>*</span>}
                </label>
            )}

            <input
                id={inputId}
                disabled={disabled}
                className={clsx(
                    // base
                    'bg-surface text-foreground placeholder:text-muted/50 w-full rounded border px-4 py-3 font-mono transition-all duration-200 focus:ring-1 focus:outline-none',
                    // disabled state
                    'disabled:cursor-not-allowed disabled:opacity-50',
                    // variants
                    VARIANTS[activeVariant],
                    className
                )}
                required={required}
                {...props}
            />

            {error && <p className="text-brand-error animate-pulse font-mono text-xs">{error}</p>}
        </div>
    );
};
