'use client';
import React from 'react';

import { AnimatePresence, motion } from 'framer-motion';

import AntivirusView from '@/components/Debug/AntivirusView';
import VirusView from '@/components/Debug/VirusView';
import { useDebogageGame } from '@/hooks/useDebogageGame';

export default function Debogage() {
    const { isSuccess, input, setInput, messages, hintLevel, handleVerify, handleHelp } =
        useDebogageGame();

    return (
        <main
            className={`relative flex min-h-screen w-full flex-col items-center overflow-y-auto px-4 py-10 font-mono transition-colors duration-1000 ${
                isSuccess ? 'bg-blue-950' : 'bg-[#021a02]'
            }`}
        >
            {/* Flash Blanc (Transition) */}
            <AnimatePresence>
                {isSuccess && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{
                            opacity: [0, 1, 0],
                            backgroundColor: '#ffffff'
                        }}
                        transition={{
                            duration: 0.6,
                            times: [0, 0.2, 1],
                            ease: "easeOut"
                        }}
                        className="pointer-events-none fixed inset-0 z-50 mix-blend-overlay"
                    />
                )}
            </AnimatePresence>

            <AnimatePresence mode="wait">
                {!isSuccess ? (
                    <VirusView
                        key="virus"
                        input={input}
                        setInput={setInput}
                        messages={messages}
                        handleVerify={handleVerify}
                        handleHelp={handleHelp}
                        hintLevel={hintLevel}
                    />
                ) : (
                    <AntivirusView key="antivirus" />
                )}
            </AnimatePresence>
        </main>
    );
}
