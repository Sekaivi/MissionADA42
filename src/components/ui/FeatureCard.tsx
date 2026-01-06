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
            className="bg-background/50 border-foreground/10 rounded-xl border p-4 backdrop-blur-sm transition-all border-black hover:border-purple500/50"
        >
            <div className="mb-2 text-3xl">{icon}</div>
            <h3 className="text-foreground mb-1 font-semibold">{title}</h3>
            <p className="text-foreground/60 text-sm">{description}</p>
        </motion.div>
    );
}
