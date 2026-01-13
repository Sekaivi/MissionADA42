import React, { ReactNode } from 'react';

import { motion } from 'framer-motion';

interface CardProps {
    children: ReactNode;
    className?: string;
    contentClassName?: string;
    title?: string;
    active?:boolean
}

export const AlphaWindow = ({
    title,
    children,
    className = '',
    contentClassName = '',
    active = true,
}: CardProps) => (
    <div
        className={`border-border bg-surface relative flex h-max flex-col overflow-hidden rounded-lg border ${className} ${active ? 'flex' : 'hidden'}`
    }
    >
        {title && (
            <div className="gap-2 border-border bg-surface-highlight/30 flex items-center justify-between border-b px-4 py-3">
                <div className="flex gap-2">
                    <div className="h-3 w-3 rounded-full bg-[#ff5f56]"></div>
                    <div className="h-3 w-3 rounded-full bg-[#ffbd2e]"></div>
                    <div className="h-3 w-3 rounded-full bg-[#27c93f]"></div>
                </div>
                <h3 className="text-xs text-muted font-bold tracking-wider uppercase">{title}</h3>
                <div className="w-12"></div>
            </div>
        )}
        <div className={`flex-1 ${contentClassName}`}>{children}</div>
    </div>

);

