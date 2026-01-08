'use client';

import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { AlphaButton, AlphaButtonVariants } from '@/components/alpha/AlphaButton';
import { AlphaCard } from '@/components/alpha/AlphaCard';
import AlphaFeedbackPill from '@/components/alpha/AlphaFeedbackPill';
import { AlphaHeader } from '@/components/alpha/AlphaHeader';
import { AlphaInput } from '@/components/alpha/AlphaInput';

export interface Question {
    question: string;
    image?: string;
    type: 'qcm' | 'text' | 'boolean' | 'sort';
    options?: { id: string | number; text: string }[];
    answer: string | number | string[];
}

interface QuizGameProps {
    title: string;
    description?: string;
    questions: Question[];
    onComplete: () => void;
}

const QuizImage = ({ src }: { src: string }) => (
    <div className="mb-6 flex justify-center overflow-hidden rounded-xl border border-white/10 bg-black/40 shadow-sm">
        <img src={src} alt="Indice visuel" className="max-h-64 w-auto object-contain" />
    </div>
);

const QuizOptions = ({
                         options,
                         selectedId,
                         status,
                         onSelect,
                     }: {
    options: { id: string | number; text: string }[];
    selectedId: string | number | null;
    status: 'idle' | 'correct' | 'incorrect';
    onSelect: (id: string | number) => void;
}) => {
    // si une des réponses dépasse 30 caractères, on force l'affichage en liste (colonne).
    // sinon, on affiche en grille (2 colonnes).
    const hasLongText = options.some((o) => o.text.length > 30);

    return (
        <div
            className={
                hasLongText
                    ? "flex flex-col space-y-3"
                    : "grid grid-cols-2 gap-3"
            }
        >
            {options.map((option) => {
                let variant: AlphaButtonVariants = 'secondary';
                const isSelected = selectedId === option.id;

                if (isSelected) {
                    if (status === 'correct') {
                        variant = 'primary';
                    } else if (status === 'incorrect') {
                        variant = 'danger';
                    } else {
                        variant = 'primary';
                    }
                }

                return (
                    <AlphaButton
                        key={option.id}
                        onClick={() => onSelect(option.id)}
                        variant={variant}
                        disabled={selectedId !== null && !isSelected}
                        fullWidth
                        className={`py-6 !text-lg !font-bold ${hasLongText ? 'justify-between text-left' : 'justify-center text-center'}`}
                    >
                        {option.text}
                    </AlphaButton>
                );
            })}
        </div>
    );
};

const QuizBoolean = ({
                         selectedId,
                         status,
                         onSelect,
                     }: {
    selectedId: string | number | null;
    status: 'idle' | 'correct' | 'incorrect';
    onSelect: (id: string | number) => void;
}) => {

    return (
        <QuizOptions
            options={[
                { id: 'Vrai', text: 'VRAI' },
                { id: 'Faux', text: 'FAUX' },

            ]}
            selectedId={selectedId}
            status={status}
            onSelect={(id) => onSelect(id)}
        />
    );
};

const QuizSortableList = ({
                              items,
                              onMove,
                              onValidate,
                              status,
                          }: {
    items: string[];
    onMove: (index: number, direction: -1 | 1) => void;
    onValidate: () => void;
    status: 'idle' | 'correct' | 'incorrect';
}) => {
    let buttonVariant: AlphaButtonVariants = 'primary';
    if (status === 'correct') buttonVariant = 'primary';
    else if (status === 'incorrect') buttonVariant = 'danger';

    return (
        <div className="space-y-3">
            <p className="mb-2 text-center text-xs italic text-muted">
                Utilisez les flèches pour ordonner la liste
            </p>
            {items.map((item, index) => (
                <motion.div
                    layout
                    key={item}
                    className={`flex items-center justify-between rounded border p-3 transition-colors ${
                        status === 'correct'
                            ? 'border-brand-emerald bg-brand-emerald/10'
                            : status === 'incorrect'
                                ? 'border-brand-error bg-brand-error/10'
                                : 'border-white/10 bg-surface'
                    }`}
                >
                    <span className="font-mono text-sm">
                        <span className="mr-3 text-muted">{index + 1}.</span>
                        {item}
                    </span>
                    <div className="flex gap-1">
                        <button
                            onClick={() => onMove(index, -1)}
                            disabled={index === 0 || status !== 'idle'}
                            className="rounded p-1 text-muted hover:bg-white/10 disabled:opacity-30"
                        >
                            ⬆️
                        </button>
                        <button
                            onClick={() => onMove(index, 1)}
                            disabled={index === items.length - 1 || status !== 'idle'}
                            className="rounded p-1 text-muted hover:bg-white/10 disabled:opacity-30"
                        >
                            ⬇️
                        </button>
                    </div>
                </motion.div>
            ))}
            <AlphaButton
                onClick={onValidate}
                disabled={status !== 'idle'}
                variant={buttonVariant}
                fullWidth
                className="mt-4"
            >
                {status === 'correct'
                    ? 'ORDRE CORRECT'
                    : status === 'incorrect'
                        ? 'ORDRE INCORRECT'
                        : "VALIDER L'ORDRE"}
            </AlphaButton>
        </div>
    );
};

// --- COMPOSANT PRINCIPAL ---

export default function QuizGame({ title, description, questions, onComplete }: QuizGameProps) {
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [status, setStatus] = useState<'idle' | 'correct' | 'incorrect'>('idle');
    const [selectedOptionId, setSelectedOptionId] = useState<string | number | null>(null);
    const [textInput, setTextInput] = useState('');

    // Gestion de l'ordre pour les questions de type "sort"
    const [currentOrder, setCurrentOrder] = useState<string[]>([]);

    // Effet pour initialiser l'ordre quand la question change
    useEffect(() => {
        const q = questions[currentQuestion];
        if (q.type === 'sort' && q.options) {
            setCurrentOrder(q.options.map((o) => o.text));
        } else {
            setCurrentOrder([]);
        }
    }, [currentQuestion, questions]);

    const currentQ = questions[currentQuestion];
    const progress = ((currentQuestion + 1) / questions.length) * 100;

    const validateAnswer = (userAnswer: string | number | string[]) => {
        let isCorrect = false;

        if (
            currentQ.type === 'sort' &&
            Array.isArray(userAnswer) &&
            Array.isArray(currentQ.answer)
        ) {
            isCorrect = JSON.stringify(userAnswer) === JSON.stringify(currentQ.answer);
        } else if (currentQ.type !== 'sort') {
            isCorrect = String(userAnswer).toLowerCase() === String(currentQ.answer).toLowerCase();
        }

        if (isCorrect) {
            setStatus('correct');
            setTimeout(() => {
                if (currentQuestion + 1 < questions.length) {
                    setStatus('idle');
                    setSelectedOptionId(null);
                    setTextInput('');
                    setCurrentQuestion((prev) => prev + 1);
                } else {
                    onComplete();
                }
            }, 1200);
        } else {
            setStatus('incorrect');
            setTimeout(() => {
                setStatus('idle');
                setSelectedOptionId(null);
            }, 1000);
        }
    };

    // Handlers spécifiques
    const handleMCQClick = (id: string | number) => {
        if (selectedOptionId !== null || status !== 'idle') return;
        setSelectedOptionId(id);
        validateAnswer(id);
    };

    const handleTextSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (status !== 'idle' || !textInput.trim()) return;
        validateAnswer(textInput);
    };

    const handleSortMove = (index: number, direction: -1 | 1) => {
        if (status !== 'idle') return;
        const newList = [...currentOrder];
        const newIndex = index + direction;
        if (newIndex >= 0 && newIndex < newList.length) {
            [newList[index], newList[newIndex]] = [newList[newIndex], newList[index]];
            setCurrentOrder(newList);
        }
    };

    // Calcul du variant pour le bouton Submit Textuel
    let textSubmitVariant: AlphaButtonVariants = 'secondary';
    if (status === 'correct') textSubmitVariant = 'primary';
    else if (status === 'incorrect') textSubmitVariant = 'danger';

    return (
        <div className="mx-auto w-full max-w-2xl space-y-6">
            <AlphaHeader title={title} subtitle={description} />

            <AlphaCard className="relative overflow-hidden" progress={progress}>
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={currentQuestion}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.3 }}
                            className="space-y-6"
                        >
                            <div className="flex items-center justify-between">
                                <AlphaFeedbackPill
                                    message={`ÉTAPE ${currentQuestion + 1} / ${questions.length}`}
                                    type="info"
                                />

                                {status === 'correct' && <AlphaFeedbackPill message={'ACCÈS AUTORISÉ'} type={'success'} />}
                                {status === 'incorrect' && <AlphaFeedbackPill message={'ACCÈS REFUSÉ'} type={'error'} />}
                            </div>

                            <h3 className="text-foreground text-xl font-bold">
                                {currentQ.question}
                            </h3>

                            {currentQ.image && <QuizImage src={currentQ.image} />}

                            {/* --- RENDU SELON LE TYPE --- */}

                            {/* 1. QCM */}
                            {currentQ.type === 'qcm' && currentQ.options && (
                                <QuizOptions
                                    options={currentQ.options}
                                    selectedId={selectedOptionId}
                                    status={status}
                                    onSelect={handleMCQClick}
                                />
                            )}

                            {/* 2. BOOLEAN (Vrai/Faux) */}
                            {currentQ.type === 'boolean' && (
                                <QuizBoolean
                                    selectedId={selectedOptionId}
                                    status={status}
                                    onSelect={(id) => handleMCQClick(id)}
                                />
                            )}

                            {/* 3. TEXTE LIBRE */}
                            {currentQ.type === 'text' && (
                                <form onSubmit={handleTextSubmit} className="space-y-4">
                                    <AlphaInput
                                        value={textInput}
                                        onChange={(e) => setTextInput(e.target.value)}
                                        placeholder="Entrez le code..."
                                        disabled={status === 'correct'}
                                        variant={
                                            status === 'correct' ? 'success' :
                                                status === 'incorrect' ? 'error' :
                                                    'default'
                                        }
                                    />

                                    <AlphaButton
                                        type="submit"
                                        variant={textSubmitVariant}
                                    >
                                        {status === 'correct'
                                            ? 'CODE VALIDE'
                                            : status === 'incorrect'
                                                ? 'CODE INVALIDE'
                                                : 'TRANSMETTRE'}
                                    </AlphaButton>
                                </form>
                            )}

                            {/* 4. TRI */}
                            {currentQ.type === 'sort' && (
                                <QuizSortableList
                                    items={currentOrder}
                                    onMove={handleSortMove}
                                    onValidate={() => validateAnswer(currentOrder)}
                                    status={status}
                                />
                            )}
                        </motion.div>
                    </AnimatePresence>
            </AlphaCard>
        </div>
    );
}