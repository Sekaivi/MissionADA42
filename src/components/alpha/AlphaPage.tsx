import React, { ReactNode } from 'react';

interface BaseProps {
    children: ReactNode;
    className?: string;
}

export const AlphaPage = ({ children, className = '' }: BaseProps) => (
    <div className={`min-h-screen bg-neutral-950 p-6 font-mono text-neutral-200 ${className}`}>
        <div className="mx-auto max-w-7xl space-y-8">{children}</div>
    </div>
);
