'use client';
import { motion } from 'framer-motion';

interface FeatureCardProps {
    icon: string;
    title: string;
    description: string;
}

export default function FeatureCard({ icon, title, description }: FeatureCardProps) {
    return (
        <motion.div
            whileHover={{ scale: 1.05, y: -5 }}
            className="p-4 rounded-xl bg-background/50 backdrop-blur-sm border border-foreground/10 hover:border-purple-500/50 transition-all"
        >
            <div className="text-3xl mb-2">{icon}</div>
            <h3 className="text-foreground font-semibold mb-1">{title}</h3>
            <p className="text-foreground/60 text-sm">{description}</p>
        </motion.div>
    );
}