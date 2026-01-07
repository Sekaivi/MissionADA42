'use client';
import React, { useEffect, useRef } from 'react';

import { AnimatePresence, motion } from 'framer-motion';

import Card from '@/components/ui/Card';

// Type pour un message
export type TerminalMessage = {
    id: number;
    sender: 'Virus' | 'Toi' | 'Système' | 'Prof'; // Ajout de "Prof" et "Système"
    text: string;
};

interface TerminalCardProps {
    messages: TerminalMessage[];
}

export default function TerminalCard({ messages }: TerminalCardProps) {
    const scrollRef = useRef<HTMLDivElement>(null);

    // Auto-scroll vers le bas à chaque nouveau message
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    return (
        <Card className="mb-6 w-full max-w-xl border-2 border-green-600 bg-[#042b04] shadow-[0_0_20px_rgba(0,255,0,0.1)]">
            <div className="mb-4 flex items-center gap-3 border-b border-green-800 pb-4">
                <div className="h-3 w-3 animate-pulse rounded-full bg-red-500" />
                <div className="h-3 w-3 rounded-full bg-yellow-500" />
                <div className="h-3 w-3 rounded-full bg-green-500" />
                <h1 className="ml-auto text-lg font-bold tracking-widest text-green-300 uppercase md:text-xl">
                    ⚠️ Terminal de Commande
                </h1>
            </div>

            {/* Zone de Chat */}
            <div
                ref={scrollRef}
                className="h-64 overflow-y-auto scroll-smooth rounded-xl border border-green-700 bg-black/80 p-4 font-mono text-sm shadow-inner"
            >
                <AnimatePresence>
                    {messages.map((msg) => (
                        <motion.div
                            key={msg.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="mb-3"
                        >
                            <span
                                className={`mr-2 font-bold ${
                                    msg.sender === 'Virus'
                                        ? 'text-red-500'
                                        : msg.sender === 'Toi'
                                          ? 'text-blue-400'
                                          : msg.sender === 'Prof'
                                            ? 'text-purple-400'
                                            : 'text-yellow-500'
                                }`}
                            >
                                [{msg.sender}] ▶
                            </span>
                            <span
                                className={
                                    msg.sender === 'Système'
                                        ? 'text-yellow-200 italic'
                                        : 'text-green-100'
                                }
                            >
                                {msg.text}
                            </span>
                        </motion.div>
                    ))}
                </AnimatePresence>

                <div className="mt-2 animate-pulse text-green-500">_</div>
            </div>
        </Card>
    );
}
