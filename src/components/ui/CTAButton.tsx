'use client';
import { ReactNode } from 'react';

import { motion } from 'framer-motion';

interface CTAButtonProps {
    href: string;
    children: ReactNode;
    variant?: 'primary' | 'secondary';
    icon?: ReactNode;
    onClick?: (e: React.MouseEvent<HTMLAnchorElement>) => void;
}

export default function CTAButton({
    href,
    children,
    variant = 'primary',
    icon,
    onClick,
}: CTAButtonProps) {
    if (variant === 'primary') {
        return (
            <motion.a
                href={href}
                onClick={onClick}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="group relative w-full overflow-hidden rounded-xl px-8 py-4 text-center font-semibold text-white transition-all sm:w-auto"
            >
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-600 transition-transform group-hover:scale-105"></div>
                <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-blue-400 opacity-0 blur-xl transition-opacity group-hover:opacity-100"></div>
                <span className="relative flex items-center justify-center gap-2">
                    {icon}
                    {children}
                </span>
            </motion.a>
        );
    }

    return (
        <motion.a
            href={href}
            onClick={onClick}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="group w-full rounded-xl border-2 border-purple-500/50 px-8 py-4 text-center font-semibold text-purple-600 transition-all hover:border-purple-500 hover:bg-purple-500/10 sm:w-auto dark:text-purple-400"
        >
            <span className="flex items-center justify-center gap-2">
                {icon}
                {children}
            </span>
        </motion.a>
    );
}
