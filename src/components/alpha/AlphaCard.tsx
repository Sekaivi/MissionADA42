import React, { ReactNode } from 'react';

interface CardProps {
    children: ReactNode;
    className?: string;
    contentClassName?: string;
    title?: string;
    action?: ReactNode; // bouton optionnel en haut à droite
}

export const AlphaCard = ({
    title,
    children,
    action,
    className = '',
    contentClassName = '',
}: CardProps) => (
    <div
        className={`border-border bg-surface flex flex-col overflow-hidden rounded-lg border ${className}`}
    >
        {title && (
            <div className="border-border bg-surface-highlight/30 flex items-center justify-between border-b px-4 py-3">
                <h3 className="text-muted text-xs font-bold tracking-wider uppercase">{title}</h3>
                {action && <div>{action}</div>}
            </div>
        )}
        <div className={`flex-1 p-4 ${contentClassName}`}>{children}</div>
    </div>
);
