'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

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
    position?: 'top' | 'bottom';
}

export const DialogueBox: React.FC<DialogueBoxProps> = ({
    script,
    onComplete,
    isOpen,
    position = 'bottom',
}) => {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        return () => setMounted(false);
    }, []);

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

    const handleInteraction = useCallback(
        (e?: React.MouseEvent | KeyboardEvent) => {
            // empêche le clic de remonter vers l'overlay si on clique sur la boîte
            if (e && 'stopPropagation' in e) {
                e.stopPropagation();
            }

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
        },
        [isOpen, isTyping, completeText, currentIndex, script.length, onComplete]
    );

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

    const positionClasses = clsx(
        'fixed inset-0 z-[9999] flex justify-center p-4 bg-black/20 m-0',
        position === 'bottom' ? 'items-end pb-8' : 'items-start pt-8'
    );

    const initialY = position === 'bottom' ? 50 : -50;

    if (!mounted) return null;

    const content = (
        <AnimatePresence>
            {isOpen && currentLine && (
                <motion.div
                    key="dialogue-overlay"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0, transition: { duration: 0.3 } }}
                    className={positionClasses}
                    onClick={handleInteraction}
                >
                    <motion.div
                        key={`dialogue-session-${script[0]?.id}`}
                        initial={{ opacity: 0, y: initialY, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{
                            opacity: 0,
                            y: initialY,
                            scale: 0.95,
                            transition: { duration: 0.2 },
                        }}
                        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                        className="border-border bg-surface pointer-events-auto relative w-full max-w-4xl rounded-lg border-2 p-6 shadow-2xl backdrop-blur-md"
                        onClick={handleInteraction}
                    >
                        <motion.div
                            key={`name-${currentLine.speaker}`}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className={clsx(
                                'bg-brand-emerald border-brand-emerald absolute -top-5 rounded border px-4 py-1 text-sm font-bold tracking-wider uppercase shadow-md',
                                isRightAvatar ? 'right-6' : 'left-6'
                            )}
                        >
                            {currentLine.speaker}
                        </motion.div>

                        <div className="flex items-start gap-3" onClick={handleInteraction}>
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
                                            'border-border relative h-18 w-18 flex-shrink-0 overflow-hidden rounded border-2 shadow-inner',
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
                                            />
                                        </motion.div>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            <div className="relative z-0 flex-grow pt-2">
                                <p className="min-h-[4rem] font-mono text-sm leading-relaxed">
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
                                    'text-brand-emerald absolute right-2 bottom-1.5 flex items-center gap-2 transition-all duration-300',
                                    isLastLine ? 'font-bold text-emerald-400' : ''
                                )}
                            >
                                <span className="text-[10px] font-bold tracking-widest uppercase opacity-80">
                                    {isLastLine ? 'Terminer' : 'Continuer'}
                                </span>

                                <motion.div
                                    animate={isLastLine ? { scale: [1, 1.2, 1] } : { x: [0, 3, 0] }}
                                    transition={{ repeat: Infinity, duration: 1.5 }}
                                >
                                    {isLastLine ? (
                                        <CheckIcon className={'h-4 w-4'} />
                                    ) : (
                                        <ArrowRightIcon className={'h-4 w-4'} />
                                    )}
                                </motion.div>
                            </motion.div>
                        )}
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );

    return createPortal(content, document.body);
};
