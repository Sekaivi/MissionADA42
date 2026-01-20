'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

import Image from 'next/image';

import { ArrowRightIcon, CheckIcon } from '@heroicons/react/24/solid';
import clsx from 'clsx';
import { AnimatePresence, motion } from 'framer-motion';

import { useIsClient } from '@/hooks/useIsClient';
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
    const isClient = useIsClient();

    const [currentIndex, setCurrentIndex] = useState(0);

    // pour lisser la valeur de isOpen, si ça passe à false puis true très vite
    const [isSafeOpen, setIsSafeOpen] = useState(isOpen);

    if (isOpen && !isSafeOpen) {
        setIsSafeOpen(true);
    }

    useEffect(() => {
        if (!isOpen) {
            const timer = setTimeout(() => {
                setIsSafeOpen(false);
            }, 50);
            return () => clearTimeout(timer);
        }
    }, [isOpen]);

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

            if (!isSafeOpen || !currentLine) return;

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
        [isSafeOpen, currentLine, isTyping, completeText, currentIndex, script.length, onComplete]
    );

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (isSafeOpen && (e.key === 'Enter' || e.key === ' ')) {
                e.preventDefault();
                handleInteraction();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isSafeOpen, handleInteraction]);

    const positionClasses = clsx(
        'fixed inset-0 z-[9999] flex justify-center p-4 bg-black/20 m-0',
        position === 'bottom' ? 'items-end pb-8' : 'items-start pt-8'
    );

    const initialY = position === 'bottom' ? 50 : -50;

    const getAvatarSource = (originalSrc: string | undefined, isAnimating: boolean) => {
        if (!originalSrc) return '';

        // on garde le GIF original pendant le typing
        if (isAnimating) {
            return originalSrc;
        }

        // sinon => remplace l'extension (.gif ou .webp) par .png
        return originalSrc.replace(/\.(gif|webp)$/i, '.png');
    };
    const currentAvatarSrc = getAvatarSource(currentLine?.avatar, isTyping);

    if (!isClient) return null;

    const content = (
        <AnimatePresence>
            {isSafeOpen && currentLine && (
                <motion.div
                    key="dialogue-overlay"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0, transition: { duration: 0.3 } }}
                    className={positionClasses}
                    onClick={handleInteraction}
                >
                    <motion.div
                        // key={`dialogue-session-${script[0]?.id}`} // remount à chaque phase
                        key={`dialogue-box-container`}
                        initial={{ opacity: 0, y: initialY, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{
                            opacity: 0,
                            y: initialY,
                            scale: 0.95,
                            transition: { duration: 0.2 },
                        }}
                        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                        className="border-border bg-surface pointer-events-auto relative w-full max-w-4xl rounded-lg shadow-2xl backdrop-blur-md"
                        onClick={handleInteraction}
                    >
                        <motion.div
                            key={`name-${currentLine.speaker}`}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className={clsx(
                                'bg-brand-emerald border-brand-emerald absolute -top-5 rounded border px-4 py-1 text-sm font-bold tracking-wider uppercase',
                                isRightAvatar ? 'right-6' : 'left-6'
                            )}
                        >
                            {currentLine.speaker}
                        </motion.div>

                        <div className="flex gap-3" onClick={handleInteraction}>
                            <AnimatePresence mode="popLayout">
                                {currentLine.avatar && (
                                    <motion.div
                                        // clef = Speaker + Side
                                        // tant que c'est le même perso du même côté, pas de remount, donc pas de transition
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
                                            'relative flex h-[115px] w-[115px] flex-shrink-0 items-end overflow-hidden',
                                            isRightAvatar ? 'order-last' : ''
                                        )}
                                    >
                                        <motion.div
                                            key={currentAvatarSrc}
                                            className="relative h-full w-full"
                                        >
                                            <Image
                                                src={currentAvatarSrc}
                                                alt={currentLine.speaker}
                                                fill
                                                sizes="115px"
                                                className={clsx(
                                                    'object-contain',
                                                    isRightAvatar && 'rotate-y-180'
                                                )}
                                                priority
                                                unoptimized
                                            />
                                        </motion.div>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            <div className="relative z-0 flex-grow">
                                <p
                                    className={clsx(
                                        'min-h-[4rem] py-6 font-mono text-sm leading-relaxed',
                                        isRightAvatar ? 'pl-6' : 'pr-6'
                                    )}
                                >
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
                                    'text-brand-emerald absolute bottom-2 flex items-center gap-2 transition-all duration-300',
                                    isLastLine ? 'font-bold text-emerald-400' : '',
                                    isRightAvatar ? 'left-6' : 'right-6'
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
