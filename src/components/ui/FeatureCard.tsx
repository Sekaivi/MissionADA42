'use client';

import React from 'react';

import { motion } from 'framer-motion';

interface FeatureCardProps {
    icon?: React.ElementType;
    title: string;
    description: string;
}

export default function FeatureCard({ icon: Icon, title, description }: FeatureCardProps) {
    return (
        <motion.div
            whileHover={{ scale: 1.05, y: -5 }}
            className="bg-background/50 border-foreground/10 rounded-xl border p-4 backdrop-blur-sm transition-all hover:border-purple-500/50"
        >
            {Icon && (
                <div className="text-brand-purple mb-3">
                    <Icon className="h-8 w-8" />
                </div>
            )}

            <h3 className="text-foreground mb-1 font-semibold">{title}</h3>
            <p className="text-foreground/60 text-sm">{description}</p>
        </motion.div>
    );
}
