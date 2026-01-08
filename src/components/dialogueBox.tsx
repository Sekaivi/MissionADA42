'use client';

import React, { useCallback, useEffect, useState } from 'react';

import Image from 'next/image';

import { ArrowRightIcon, CheckIcon } from '@heroicons/react/24/solid';
import clsx from 'clsx';
import { AnimatePresence, motion } from 'framer-motion';

import { useTypewriter } from '@/hooks/useTypeWriter';
import { DialogueLine } from '@/types/dialogue';

interface DialogueBoxProps {
    script: DialogueLine[];
    onComplete: () => void;
    isOpen: boolean;
}

export const DialogueBox: React.FC<DialogueBoxProps> = ({ script, onComplete, isOpen }) => {
    const [currentIndex, setCurrentIndex] = useState(0);

    const [prevIsOpen, setPrevIsOpen] = useState(isOpen);
    const [prevScript, setPrevScript] = useState(script);

    if ((isOpen && !prevIsOpen) || script !== prevScript) {
        setCurrentIndex(0);
        setPrevIsOpen(isOpen);
        setPrevScript(script);
    }
    if (!isOpen && prevIsOpen) {
        setPrevIsOpen(false);
    }

    const currentLine = script[Math.min(currentIndex, script.length - 1)];
    const isRightAvatar = currentLine?.side === 'right';
    const isLastLine = currentIndex === script.length - 1;

    const { displayedText, isTyping, completeText } = useTypewriter(currentLine?.text || '', 20);

    const handleInteraction = useCallback(() => {
        if (!isOpen) return;
        if (isTyping) {
            completeText();
        } else {
            if (currentIndex < script.length - 1) {
                setCurrentIndex((prev) => prev + 1);
            } else {
                onComplete();
            }
        }
    }, [isOpen, isTyping, completeText, currentIndex, script.length, onComplete]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (isOpen && (e.key === 'Enter' || e.key === ' ')) {
                e.preventDefault();
                handleInteraction();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, handleInteraction]);

    return (
        <AnimatePresence>
            {isOpen && currentLine && (
                <div className="pointer-events-none fixed inset-0 z-50 flex items-end justify-center px-4 pb-8">
                    <motion.div
                        key={`dialogue-session-${script[0]?.id}`}
                        initial={{ opacity: 0, y: 50, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95, transition: { duration: 0.2 } }}
                        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                        className="pointer-events-auto relative w-full max-w-4xl rounded-lg border-2 border-slate-600 bg-slate-900/95 p-6 shadow-2xl backdrop-blur-md"
                        onClick={handleInteraction}
                    >
                        <motion.div
                            key={`name-${currentLine.id}`}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className={clsx(
                                'bg-brand-emerald border-brand-emerald absolute -top-5 rounded border px-4 py-1 text-sm font-bold tracking-wider text-white uppercase shadow-md',
                                isRightAvatar ? 'right-6' : 'left-6'
                            )}
                        >
                            {currentLine.speaker}
                        </motion.div>

                        <div className="relative z-10 flex items-start gap-6">
                            <AnimatePresence mode="popLayout">
                                {currentLine.avatar && (
                                    <motion.div
                                        key={`${currentLine.speaker}-${currentLine.side}`}
                                        initial={{
                                            opacity: 0,
                                            x: isRightAvatar ? 30 : -30,
                                            scale: 0.9,
                                        }}
                                        animate={{ opacity: 1, x: 0, scale: 1 }}
                                        exit={{
                                            opacity: 0,
                                            x: isRightAvatar ? 30 : -30,
                                            scale: 0.9,
                                        }}
                                        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                                        className={clsx(
                                            'relative h-24 w-24 flex-shrink-0 overflow-hidden rounded border-2 border-slate-500 bg-slate-800 shadow-inner',
                                            isRightAvatar ? 'order-last' : ''
                                        )}
                                    >
                                        <motion.div
                                            key={currentLine.avatar}
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            transition={{ duration: 0.2 }}
                                            className="relative h-full w-full"
                                        >
                                            <Image
                                                src={currentLine.avatar}
                                                alt={currentLine.speaker}
                                                fill
                                                className="object-cover"
                                                sizes="96px"
                                            />
                                        </motion.div>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            <div className="relative z-0 flex-grow pt-2">
                                <p className="min-h-[4rem] font-mono text-lg leading-relaxed text-slate-100">
                                    {displayedText}
                                    {isTyping && (
                                        <motion.span
                                            animate={{ opacity: [1, 0] }}
                                            transition={{ repeat: Infinity, duration: 0.8 }}
                                            className="bg-brand-emerald ml-1 inline-block h-5 w-2.5 align-middle shadow-[0_0_8px_rgba(16,185,129,0.8)]"
                                        />
                                    )}
                                </p>
                            </div>
                        </div>

                        {/* INDICATEUR SUIVANT / TERMINER */}
                        {!isTyping && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className={clsx(
                                    'text-brand-emerald absolute bottom-4 flex items-center gap-2 transition-all duration-300',
                                    // derniere ligne => texte gras/brillant
                                    isLastLine
                                        ? 'font-bold text-emerald-400 drop-shadow-[0_0_5px_rgba(52,211,153,0.5)]'
                                        : '',
                                    isRightAvatar ? 'right-32' : 'right-4'
                                )}
                            >
                                <span className="text-[10px] font-bold tracking-widest uppercase opacity-80">
                                    {isLastLine ? 'Terminer' : 'Click / Space'}
                                </span>

                                <motion.div
                                    animate={isLastLine ? { scale: [1, 1.2, 1] } : { x: [0, 3, 0] }}
                                    transition={{ repeat: Infinity, duration: 1.5 }}
                                >
                                    {isLastLine ? (
                                        // check pour la fin
                                        <CheckIcon className={'h-4 w-4'} />
                                    ) : (
                                        // flèche pour la suite
                                        <ArrowRightIcon className={'h-4 w-4'} />
                                    )}
                                </motion.div>
                            </motion.div>
                        )}
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};
