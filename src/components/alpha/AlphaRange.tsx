// src/components/alpha/AlphaRange.tsx
import React from 'react';

import clsx from 'clsx';

interface AlphaRangeProps {
    label: string;
    value: number;
    onChange: (val: number) => void;
    min: number;
    max: number;
    step?: number;
    unit?: string;
    description?: React.ReactNode;
    color?: 'brand-orange' | 'brand-purple' | 'brand-blue' | 'brand-emerald';
    icon?: React.ForwardRefExoticComponent<React.SVGProps<SVGSVGElement>>;
}

export const AlphaRange = ({
    label,
    value,
    onChange,
    min,
    max,
    step = 1,
    unit = '',
    description,
    color = 'brand-orange',
    icon: Icon,
}: AlphaRangeProps) => {
    const colorClasses = {
        'brand-orange': 'accent-brand-orange text-brand-orange',
        'brand-purple': 'accent-brand-purple text-brand-purple',
        'brand-blue': 'accent-brand-blue text-brand-blue',
        'brand-emerald': 'accent-brand-emerald text-brand-emerald',
    };

    return (
        <div className="space-y-2">
            <div className="flex items-end justify-between">
                <label className="text-muted flex items-center gap-2 text-sm font-bold">
                    {Icon && <Icon className={clsx('h-4 w-4', colorClasses[color])} />}
                    {label}
                </label>
                <span className="text-brand-yellow font-mono text-sm font-bold">
                    {value} <span className="text-muted text-xs font-normal">{unit}</span>
                </span>
            </div>

            <input
                type="range"
                min={min}
                max={max}
                step={step}
                value={value}
                onChange={(e) => onChange(Number(e.target.value))}
                className={clsx(
                    'bg-surface-highlight h-2 w-full cursor-pointer appearance-none rounded-lg',
                    colorClasses[color]
                )}
            />

            {description && <p className="text-muted text-xs">{description}</p>}
        </div>
    );
};
