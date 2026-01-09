import React from 'react';

import { PuzzlePieceIcon, ShieldExclamationIcon } from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';

import { AlphaButton } from '@/components/alpha/AlphaButton';
import { AlphaCard } from '@/components/alpha/AlphaCard';
import FeedbackPill from '@/components/alpha/AlphaFeedbackPill';
import { AlphaInput } from '@/components/alpha/AlphaInput';

// Définition du type pour l'objet Message
interface Message {
    id: number | string;
    sender: string;
    text: string;
}

interface VirusViewProps {
    input: string;
    setInput: (val: string) => void;
    messages: Message[]; // Utilisation du bon type
    handleVerify: () => void;
    handleHelp: () => void;
    hintLevel: number;
}

export default function VirusView({
    input,
    setInput,
    messages,
    handleVerify,
    handleHelp,
    hintLevel,
}: VirusViewProps) {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            className="w-full max-w-lg space-y-4 md:space-y-6"
        >
            <div className="text-center">
                <FeedbackPill message="SYSTEM_INFECTED" type="error" pulse className="mb-2" />
                <h1 className="text-brand-emerald text-3xl font-black tracking-tighter drop-shadow-[0_0_10px_var(--color-brand-emerald)] md:text-4xl">
                    DÉBOGAGE REQUIS
                </h1>
            </div>

            <AlphaCard
                title="TERMINAL D'ACCÈS"
                className="border-brand-error/30 shadow-brand-error/10 shadow-lg"
            >
                <div className="space-y-4 md:space-y-6">
                    {/* Zone de messages responsive */}
                    <div className="text-brand-error scrollbar-thin scrollbar-thumb-brand-error/20 h-32 overflow-y-auto rounded bg-black/40 p-3 font-mono text-xs md:h-40">
                        {messages.length === 0 ? (
                            <span className="opacity-50">En attente d'entrée...</span>
                        ) : (
                            messages.map((msg, i) => (
                                // Utilisation de msg.id comme clé
                                <div
                                    key={msg.id || i}
                                    className="border-brand-error/50 mb-2 border-l-2 pl-2 leading-relaxed break-words"
                                >
                                    <span className="mr-1 text-[10px] uppercase opacity-50">
                                        [{msg.sender || 'SYS'}] &gt;
                                    </span>
                                    {/* FIX: On affiche msg.text, pas l'objet entier */}
                                    {msg.text}
                                </div>
                            ))
                        )}
                    </div>

                    {/* Champ de saisie */}
                    <div>
                        <AlphaInput
                            autoFocus
                            variant="error"
                            placeholder="Entrez le code..."
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleVerify()}
                            className="text-sm md:text-base"
                        />
                    </div>

                    {/* Actions : Stack sur mobile, Grille sur Desktop */}
                    <div className="flex flex-col gap-3 sm:grid sm:grid-cols-2">
                        <AlphaButton
                            variant="danger"
                            fullWidth
                            size="lg"
                            onClick={handleVerify}
                            className="justify-center"
                        >
                            <ShieldExclamationIcon className="mr-2 h-5 w-5" />
                            INJECTER
                        </AlphaButton>

                        <AlphaButton
                            variant="secondary"
                            fullWidth
                            size="lg"
                            onClick={handleHelp}
                            disabled={hintLevel >= 3}
                            className="justify-center"
                        >
                            <PuzzlePieceIcon className="mr-2 h-5 w-5" />
                            INDICE ({hintLevel}/3)
                        </AlphaButton>
                    </div>
                </div>
            </AlphaCard>
        </motion.div>
    );
}
