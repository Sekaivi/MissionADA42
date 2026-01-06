'use client';
import { motion } from 'framer-motion';
import React from 'react';

interface CardProps {
    children: React.ReactNode;
    className?: string;
    delay?: number;
}

export default function Card({ children, className = "", delay = 0 }: CardProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: delay }}
            className={`rounded-2xl p-8 shadow-xl backdrop-blur-md transition-all ${className}`}
        >
            {children}
        </motion.div>
    );
}