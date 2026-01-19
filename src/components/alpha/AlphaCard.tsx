import React, { ReactNode } from 'react';

import { motion } from 'framer-motion';

interface CardProps {
    children: ReactNode;
    className?: string;
    contentClassName?: string;
    title?: string;
    icon?: React.ElementType;
    action?: ReactNode; // bouton optionnel en haut à droite
    progress?: number; // pourcentage d'une étape
}

export const AlphaCard = ({
    title,
    children,
    icon: Icon,
    action,
    className = '',
    contentClassName = '',
    progress,
}: CardProps) => (
    <div
        className={`border-border bg-surface relative flex h-max flex-col overflow-hidden rounded-lg border ${className}`}
    >
        {title && (
            <div className="border-border bg-surface-highlight/30 flex items-center justify-between border-b px-4 py-3">
                <h3 className="text-muted flex items-center text-xs font-bold tracking-wider uppercase">
                    {Icon && <Icon className="mr-2 h-3 w-3" />}
                    {title}
                </h3>
                {action && <>{action}</>}
            </div>
        )}
        <div className={`flex-1 space-y-4 p-4 ${contentClassName}`}>{children}</div>

        {progress ? (
            <div className="bg-surface-highlight absolute bottom-0 left-0 h-1 w-full">
                <motion.div
                    className="bg-brand-emerald h-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.5 }}
                />
            </div>
        ) : (
            ''
        )}
    </div>
);
