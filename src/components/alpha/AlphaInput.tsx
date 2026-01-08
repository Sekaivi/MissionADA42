// src/components/alpha/AlphaInput.tsx
import React from 'react';
import clsx from 'clsx';

export const AlphaInput = ({ className, ...props }: React.InputHTMLAttributes<HTMLInputElement>) => (
    <input
        className={clsx(
            "w-full rounded border border-white/20 bg-surface px-4 py-3 font-mono text-foreground placeholder:text-muted focus:border-brand-emerald focus:outline-none focus:ring-1 focus:ring-brand-emerald transition-all",
            className
        )}
        {...props}
    />
);