'use client';
import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface InfoCardProps {
    title: string;
    description: string;
    icon: ReactNode;
    accentColor?: 'purple' | 'blue';
}

export default function InfoCard({
    title,
    description,
    icon,
    accentColor = 'purple'
}: InfoCardProps) {
    const colorClasses = {
        purple: 'text-purple-600 dark:text-purple-400',
        blue: 'text-blue-600 dark:text-blue-400'
    };

    return (
        <motion.div
            whileHover={{ y: -5 }}
            className="p-6 rounded-xl bg-background/50 backdrop-blur-sm border border-foreground/10"
        >
            <h3 className={`${colorClasses[accentColor]} font-semibold mb-2 flex items-center gap-2`}>
                {icon}
                {title}
            </h3>
            <p className="text-foreground/70 text-sm">
                {description}
            </p>
        </motion.div>
    );
}