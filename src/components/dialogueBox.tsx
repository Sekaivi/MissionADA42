import React, { useCallback, useEffect, useState } from 'react';

import Image from 'next/image';

import { useTypewriter } from '@/hooks/useTypeWriter';
// Import de Next Image
import { DialogueLine } from '@/types/dialogue';

interface DialogueBoxProps {
    script: DialogueLine[];
    onComplete: () => void;
    isOpen: boolean;
}

export const DialogueBox: React.FC<DialogueBoxProps> = ({ script, onComplete, isOpen }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const currentLine = script[currentIndex];

    const { displayedText, isTyping, completeText } = useTypewriter(currentLine?.text || '', 30);

    // CORRECTION 1 : On utilise useCallback pour stabiliser cette fonction
    const handleInteraction = useCallback(() => {
        if (!isOpen) return;

        if (isTyping) {
            completeText();
        } else {
            if (currentIndex < script.length - 1) {
                setCurrentIndex((prev) => prev + 1);
            } else {
                onComplete();
                setTimeout(() => setCurrentIndex(0), 100);
            }
        }
    }, [isOpen, isTyping, completeText, currentIndex, script.length, onComplete]); // Dépendances précises

    // CORRECTION 2 : On ajoute handleInteraction dans le tableau de dépendances
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

    if (!isOpen || !currentLine) return null;

    return (
        <div className="pointer-events-none fixed inset-0 z-50 flex items-end justify-center px-4 pb-8">
            <div
                className="animate-in fade-in slide-in-from-bottom-4 pointer-events-auto relative w-full max-w-4xl rounded-lg border-2 border-slate-600 bg-slate-900/95 p-6 shadow-2xl backdrop-blur-sm duration-300"
                onClick={handleInteraction}
            >
                <div className="border-brand-emerald bg-brand-emerald absolute -top-5 left-6 rounded border px-4 py-1 text-sm font-bold tracking-wider text-white uppercase shadow-md">
                    {currentLine.speaker}
                </div>

                <div className="flex items-start gap-6">
                    {currentLine.avatar && (
                        <div
                            className={`flex-shrink-0 ${currentLine.side === 'right' ? 'order-last' : ''}`}
                        >
                            {/* CORRECTION 3 : Utilisation de next/image */}
                            {/* Note: width/height 96 correspond à w-24 h-24 (24 * 4px) */}
                            <div className="relative h-24 w-24 overflow-hidden rounded border-2 border-slate-500 bg-slate-800">
                                <Image
                                    src={currentLine.avatar}
                                    alt={currentLine.speaker}
                                    fill // Remplit le conteneur parent
                                    className="object-cover"
                                    sizes="96px"
                                />
                            </div>
                        </div>
                    )}

                    <div className="flex-grow">
                        <p className="min-h-[4rem] font-mono text-lg leading-relaxed text-slate-100">
                            {displayedText}
                            {isTyping && (
                                <span className="bg-brand-emerald ml-1 inline-block h-5 w-2 animate-pulse align-middle" />
                            )}
                        </p>
                    </div>
                </div>

                {!isTyping && (
                    <div className="text-brand-emerald absolute right-4 bottom-4 animate-bounce">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-6 w-6"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 9l-7 7-7-7"
                            />
                        </svg>
                        <span className="text-xs font-bold uppercase">Click</span>
                    </div>
                )}
            </div>
        </div>
    );
};
