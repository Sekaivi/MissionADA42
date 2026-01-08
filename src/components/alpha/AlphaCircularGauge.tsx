import React from 'react';

import clsx from 'clsx';

type GaugeVariant = 'default' | 'success' | 'error' | 'warning';

interface AlphaCircularGaugeProps {
    value?: number; // current
    max?: number;
    progress?: number; // OU pourcentage direct (0-100)
    variant?: GaugeVariant;
    size?: number | string; // taille en px ou classe CSS (ex: "h-48 w-48")
    strokeWidth?: number;
    showGlow?: boolean; // effet de lueur optionnel
    className?: string;
    contentClassName?: string;
    children?: React.ReactNode;
}

const VARIANT_STYLES: Record<GaugeVariant, string> = {
    default: 'text-brand-blue',
    success: 'text-brand-emerald',
    error: 'text-brand-error',
    warning: 'text-brand-orange',
};

export const AlphaCircularGauge: React.FC<AlphaCircularGaugeProps> = ({
    value = 0,
    max = 100,
    progress, // si défini, écrase le calcul value/max
    variant = 'default',
    size = 'h-48 w-48',
    strokeWidth = 10,
    showGlow = false,
    className,
    contentClassName,
    children,
}) => {
    // calcul du pourcentage clamped entre 0 et 100
    const percentage = progress ?? Math.min(100, Math.max(0, (value / max) * 100));

    // constantes géométriques pour le cercle SVG
    const radius = 45;
    const circumference = 2 * Math.PI * radius; // ~282.74
    const offset = circumference - (percentage / 100) * circumference;

    return (
        <div
            className={clsx(
                'relative flex items-center justify-center overflow-visible',
                size,
                className
            )}
        >
            <svg
                // overflow-visible pour permettre à l'ombre de sortir de la viewBox
                className="h-full w-full -rotate-90 transform overflow-visible transition-all duration-500 ease-out"
                viewBox="0 0 100 100"
            >
                {/* cercle de fond */}
                <circle
                    cx="50"
                    cy="50"
                    r={radius}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={strokeWidth}
                    className="text-surface-highlight opacity-50"
                />

                {/* cercle de progression */}
                <circle
                    cx="50"
                    cy="50"
                    r={radius}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={strokeWidth}
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    strokeLinecap="round"
                    className={clsx(
                        'transition-all duration-300 ease-out',
                        VARIANT_STYLES[variant],
                        showGlow && 'drop-shadow-[0_0_5px_currentColor]'
                    )}
                />
            </svg>

            {/* contenu central */}
            {children && (
                <div
                    className={`absolute inset-0 flex flex-col items-center justify-center ${contentClassName}`}
                >
                    {children}
                </div>
            )}
        </div>
    );
};
