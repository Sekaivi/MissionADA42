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
            ? 'bg-emerald-900/30 hover:bg-emerald-800/50 border-emerald-700 text-emerald-300'
            : 'bg-neutral-800 hover:bg-neutral-700 border-neutral-600 text-white';

    return (
        <button
            onClick={onClick}
            className={`rounded border px-4 py-2 text-sm font-medium transition-all active:scale-95 ${styles}`}
        >
            {children}
        </button>
    );
};
