'use client';

import React, { ReactNode } from 'react';

export const AlphaButton = ({
    onClick,
    children,
    variant = 'primary',
}: {
    onClick: () => void;
    children: ReactNode;
    variant?: 'primary' | 'secondary';
}) => {
    const styles =
        variant === 'primary'
            ? 'border-brand-emerald/50 bg-brand-emerald/10 text-brand-emerald hover:bg-brand-emerald hover:text-background hover:border-brand-emerald'
            : 'border-border bg-surface text-foreground hover:bg-surface-highlight hover:border-muted';

    return (
        <button
            onClick={onClick}
            className={`rounded border px-4 py-2 text-sm font-medium transition-all active:scale-95 ${styles}`}
        >
            {children}
        </button>
    );
};
