import { motion } from "framer-motion";
import React, { ReactNode } from 'react';

interface CardProps {
    children: ReactNode;
    className?: string;
    contentClassName?: string;
    title?: string;
    action?: ReactNode; // bouton optionnel en haut à droite
    progress?: number; // pourcentage d'une étape
}

export const AlphaCard = ({
    title,
    children,
    action,
    className = '',
    contentClassName = '',
    progress
}: CardProps) => (
    <div
        className={`relative border-border bg-surface flex h-max flex-col overflow-hidden rounded-lg border ${className}`}
    >
        {title && (
            <div className="border-border bg-surface-highlight/30 flex items-center justify-between border-b px-4 py-3">
                <h3 className="text-muted text-xs font-bold tracking-wider uppercase">{title}</h3>
                {action && <div>{action}</div>}
            </div>
        )}
        <div className={`flex-1 p-4 ${contentClassName}`}>{children}</div>

        {progress &&
            <div className="bg-surface-highlight absolute bottom-0 left-0 h-1 w-full">
                <motion.div
                    className="bg-brand-emerald h-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.5 }}
                />
            </div>
        }
    </div>
);
