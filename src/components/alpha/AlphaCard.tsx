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
        className={`flex flex-col overflow-hidden rounded-lg border border-neutral-800 bg-neutral-900/50 ${className}`}
    >
        {title && (
            <div className="flex items-center justify-between border-b border-neutral-800 bg-neutral-900 px-4 py-3">
                <h3 className="text-xs font-bold tracking-wider text-neutral-400 uppercase">
                    {title}
                </h3>
                {action && <div>{action}</div>}
            </div>
        )}
        <div className={`flex-1 p-4 ${contentClassName}`}>{children}</div>
    </div>
);
