'use client';
import React from 'react';

import { HTMLMotionProps, motion } from 'framer-motion';

interface CardProps extends HTMLMotionProps<'div'> {
    children: React.ReactNode;
    className?: string;
    delay?: number;
}

export default function Card({ children, className = '', delay = 0, ...props }: CardProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: delay }}
            // MODIFICATION : J'ai enlevé les couleurs de fond et de bordure ici
            // On garde juste : rounded, padding, shadow, blur
            className={`rounded-2xl p-8 shadow-xl backdrop-blur-md transition-all ${className}`}
            {...props}
        >
            {children}
        </motion.div>
    );
}
