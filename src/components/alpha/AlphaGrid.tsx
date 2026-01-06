import React, { ReactNode } from 'react';

interface BaseProps {
    children: ReactNode;
    className?: string;
}

export const AlphaGrid = ({ children, className = '' }: BaseProps) => (
    <div className={`grid grid-cols-1 gap-8 lg:grid-cols-2 ${className}`}>{children}</div>
);
