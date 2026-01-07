'use client';
import React from 'react';

import { motion } from 'framer-motion';

import ProgressionCard from '@/components/Debug/ProgressionCard';
import TerminalCard, { TerminalMessage } from '@/components/Debug/TerminalCard';

interface VirusViewProps {
    messages: TerminalMessage[];
    input: string;
    setInput: (val: string) => void;
    handleVerify: () => void;
    handleHelp: () => void;
    hintLevel: number;
}

export default function VirusView({
    messages,
    input,
    setInput,
    handleVerify,
    handleHelp,
    hintLevel,
}: VirusViewProps) {
    return (
        <motion.div
            key="virus-ui"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{
                opacity: 0,
                scale: 1.5,
                filter: ['blur(0px)', 'blur(20px) brightness(2)'], // Explosion lumineuse
                transition: { duration: 0.6, ease: 'easeInOut' },
            }}
            className="relative z-10 flex w-full max-w-xl flex-col items-center"
        >
            <TerminalCard messages={messages} />

            <ProgressionCard
                inputValue={input}
                onInputChange={setInput}
                onVerify={handleVerify}
                onHelp={handleHelp}
                hintsUsed={hintLevel}
            />

            <footer className="mt-10 text-center text-xs tracking-[0.3em] text-green-800 uppercase">
                © 2026 MaxiCookers Security Systems
            </footer>
        </motion.div>
    );
}
