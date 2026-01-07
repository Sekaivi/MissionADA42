'use client';
import React from 'react';

import { motion } from 'framer-motion';

import Button from '@/components/ui/Button';

export default function AntivirusView() {
    return (
        <motion.div
            key="antivirus-ui"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="relative z-10 flex min-h-[70vh] w-full max-w-xl flex-col items-center justify-center text-center"
        >
            {/* Animation du Bouclier */}
            <motion.div
                initial={{ scale: 0, rotate: -90 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: 'spring', stiffness: 150, damping: 12, delay: 0.5 }}
                className="relative mb-10"
            >
                <div className="animation-delay-200 absolute inset-0 animate-ping rounded-full bg-blue-500 opacity-40" />
                <div className="relative z-10 flex h-40 w-40 items-center justify-center rounded-full border-4 border-white bg-gradient-to-br from-blue-600 to-cyan-400 shadow-[0_0_50px_rgba(59,130,246,0.8)]">
                    <span className="text-7xl">🛡️</span>
                </div>
            </motion.div>

            <motion.h1
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.7 }}
                className="mb-4 text-4xl font-bold tracking-tight text-white md:text-5xl"
            >
                MENACE ÉLIMINÉE
            </motion.h1>

            <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 1 }}
                className="mb-8 max-w-sm rounded-xl border border-blue-400/30 bg-blue-900/50 p-6 backdrop-blur-sm"
            >
                <p className="font-sans text-blue-100">
                    Le virus a été purgé. Le système est sécurisé.
                </p>
            </motion.div>

            <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 1.3 }}
            >
                <Button
                    onClick={() => (window.location.href = '/home')}
                >
                    RETOURNER AU QG
                </Button>
            </motion.div>
        </motion.div>
    );
}
