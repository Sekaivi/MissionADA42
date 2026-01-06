// components/DialogueBox.tsx
import React, { useState, useEffect } from 'react';
import { DialogueLine } from '@/types/dialogue';
import { useTypewriter } from '@/hooks/useTypeWriter';

interface DialogueBoxProps {
    script: DialogueLine[];
    onComplete: () => void; // Appelé quand tout le dialogue est fini
    isOpen: boolean;
}

export const DialogueBox: React.FC<DialogueBoxProps> = ({ script, onComplete, isOpen }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const currentLine = script[currentIndex];

    // Utilisation de notre hook custom
    const { displayedText, isTyping, completeText } = useTypewriter(currentLine?.text || '', 30);

    // Gestion du clic pour avancer
    const handleInteraction = () => {
        if (isTyping) {
            // Si ça tape encore, on affiche tout d'un coup
            completeText();
        } else {
            // Sinon, on passe à la phrase suivante
            if (currentIndex < script.length - 1) {
                setCurrentIndex((prev) => prev + 1);
            } else {
                // Fin du dialogue
                onComplete();
                setCurrentIndex(0); // Reset pour la prochaine fois (optionnel)
            }
        }
    };

    // Gestion de la touche "Entrée" ou "Espace"
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (isOpen && (e.key === 'Enter' || e.key === ' ')) {
                e.preventDefault();
                handleInteraction();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, isTyping, currentIndex]);

    if (!isOpen || !currentLine) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-end justify-center pointer-events-none pb-8 px-4">
            {/* Container principal - pointer-events-auto pour permettre le clic */}
            <div
                className="pointer-events-auto w-full max-w-4xl bg-slate-900/95 border-2 border-slate-600 rounded-lg shadow-2xl p-6 relative backdrop-blur-sm animate-in fade-in slide-in-from-bottom-4 duration-300"
                onClick={handleInteraction}
            >

                {/* En-tête avec Nom */}
                <div className="absolute -top-5 left-6 bg-blue-600 text-white px-4 py-1 rounded text-sm font-bold tracking-wider uppercase shadow-md border border-blue-400">
                    {currentLine.speaker}
                </div>

                <div className="flex gap-6 items-start">
                    {/* Avatar (Optionnel) */}
                    {currentLine.avatar && (
                        <div className={`flex-shrink-0 ${currentLine.side === 'right' ? 'order-last' : ''}`}>
                            <img
                                src={currentLine.avatar}
                                alt={currentLine.speaker}
                                className="w-24 h-24 object-cover rounded border-2 border-slate-500 bg-slate-800"
                            />
                        </div>
                    )}

                    {/* Zone de texte */}
                    <div className="flex-grow">
                        <p className="text-lg text-slate-100 font-mono leading-relaxed min-h-[4rem]">
                            {displayedText}
                            {/* Curseur clignotant pendant la frappe */}
                            {isTyping && <span className="animate-pulse inline-block w-2 h-5 bg-blue-500 ml-1 align-middle"/>}
                        </p>
                    </div>
                </div>

                {/* Indicateur "Suivant" (clignote quand le texte est fini) */}
                {!isTyping && (
                    <div className="absolute bottom-4 right-4 animate-bounce text-blue-400">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                        <span className="text-xs font-bold uppercase">Click</span>
                    </div>
                )}
            </div>
        </div>
    );
};