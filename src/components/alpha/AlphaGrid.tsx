import React, { ReactNode } from 'react';

interface BaseProps {
    children: ReactNode;
    className?: string;
}

export const AlphaGrid = ({ children, className = '' }: BaseProps) => (
    <div className={`_ALPHA_GRID grid grid-cols-1 gap-10 lg:grid-cols-2 lg:gap-8 ${className}`}>{children}</div>
);
