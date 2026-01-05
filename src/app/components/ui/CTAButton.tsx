'use client';
import { motion } from 'framer-motion';
import { ReactNode } from 'react';

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
    onClick
}: CTAButtonProps) {
    if (variant === 'primary') {
        return (
            <motion.a
                href={href}
                onClick={onClick}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="group relative px-8 py-4 rounded-xl font-semibold text-white overflow-hidden transition-all w-full sm:w-auto text-center"
            >
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-600 transition-transform group-hover:scale-105"></div>
                <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-blue-400 opacity-0 group-hover:opacity-100 transition-opacity blur-xl"></div>
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
            className="group px-8 py-4 rounded-xl font-semibold text-purple-600 dark:text-purple-400 border-2 border-purple-500/50 hover:border-purple-500 hover:bg-purple-500/10 transition-all w-full sm:w-auto text-center"
        >
            <span className="flex items-center justify-center gap-2">
                {icon}
                {children}
            </span>
        </motion.a>
    );
}