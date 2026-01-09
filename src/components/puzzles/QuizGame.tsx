'use client';

import React, { useState } from 'react';

import Image from 'next/image';

import { AnimatePresence, motion } from 'framer-motion';

import { AlphaButton, AlphaButtonVariants } from '@/components/alpha/AlphaButton';
import { AlphaCard } from '@/components/alpha/AlphaCard';
import AlphaFeedbackPill from '@/components/alpha/AlphaFeedbackPill';
import { AlphaInput } from '@/components/alpha/AlphaInput';
import { AlphaSuccess } from '@/components/alpha/AlphaSuccess';
import { PuzzleProps } from '@/components/puzzles/PuzzleRegistry';
import { SCENARIO } from '@/data/alphaScenario';

export interface Question {
    question: string;
    image?: string;
    type: 'qcm' | 'text' | 'boolean' | 'sort';
    options?: { id: string | number; text: string }[];
    answer: string | number | string[];
}

interface QuizGameProps extends PuzzleProps {
    questions: Question[];
}

const QuizImage = ({ src }: { src: string }) => (
    <div className="border-border bg-background mb-6 flex justify-center overflow-hidden rounded-xl border shadow-sm">
        <Image
            src={src}
            alt="Indice visuel"
            width={400}
            height={300}
            className="max-h-64 w-auto object-contain"
        />
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
        <div className={hasLongText ? 'flex flex-col space-y-3' : 'grid grid-cols-2 gap-3'}>
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
            <p className="text-muted mb-2 text-center text-xs italic">
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
                              : 'bg-surface border-white/10'
                    }`}
                >
                    <span className="font-mono text-sm">
                        <span className="text-muted mr-3">{index + 1}.</span>
                        {item}
                    </span>
                    <div className="flex gap-1">
                        <button
                            onClick={() => onMove(index, -1)}
                            disabled={index === 0 || status !== 'idle'}
                            className="text-muted rounded p-1 hover:bg-white/10 disabled:opacity-30"
                        >
                            ⬆️
                        </button>
                        <button
                            onClick={() => onMove(index, 1)}
                            disabled={index === items.length - 1 || status !== 'idle'}
                            className="text-muted rounded p-1 hover:bg-white/10 disabled:opacity-30"
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
export default function QuizGame({ questions, onSolve, isSolved }: QuizGameProps) {
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [status, setStatus] = useState<'idle' | 'correct' | 'incorrect'>('idle');
    const [selectedOptionId, setSelectedOptionId] = useState<string | number | null>(null);
    const [textInput, setTextInput] = useState('');

    // lazy init du state pour la première question
    const [currentOrder, setCurrentOrder] = useState<string[]>(() => {
        const firstQ = questions[0];
        if (firstQ?.type === 'sort' && firstQ.options) {
            return firstQ.options.map((o) => o.text);
        }
        return [];
    });

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

            if (currentQuestion + 1 < questions.length) {
                setTimeout(() => {
                    // Reset UI
                    setStatus('idle');
                    setSelectedOptionId(null);
                    setTextInput('');

                    // Passage à la question suivante
                    const nextIndex = currentQuestion + 1;
                    setCurrentQuestion(nextIndex);

                    // màj de l'ordre, lors de la transition
                    const nextQ = questions[nextIndex];
                    if (nextQ.type === 'sort' && nextQ.options) {
                        setCurrentOrder(nextQ.options.map((o) => o.text));
                    } else {
                        setCurrentOrder([]);
                    }
                }, 1000);
            } else {
                setTimeout(() => {
                    onSolve();
                }, SCENARIO.defaultTimeBeforeNextStep);
            }
        } else {
            setStatus('incorrect');
            setTimeout(() => {
                setStatus('idle');
                setSelectedOptionId(null);
            }, 1000);
        }
    };

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

    let textSubmitVariant: AlphaButtonVariants = 'secondary';
    if (status === 'correct') textSubmitVariant = 'primary';
    else if (status === 'incorrect') textSubmitVariant = 'danger';

    if (isSolved) return <AlphaSuccess message={'SÉQUENCE VALIDÉE'} />;

    return (
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

                        {status === 'correct' && (
                            <AlphaFeedbackPill message={'ACCÈS AUTORISÉ'} type={'success'} />
                        )}
                        {status === 'incorrect' && (
                            <AlphaFeedbackPill message={'ACCÈS REFUSÉ'} type={'error'} />
                        )}
                    </div>

                    <h3 className="text-foreground text-xl font-bold">{currentQ.question}</h3>

                    {currentQ.image && <QuizImage src={currentQ.image} />}

                    {currentQ.type === 'qcm' && currentQ.options && (
                        <QuizOptions
                            options={currentQ.options}
                            selectedId={selectedOptionId}
                            status={status}
                            onSelect={handleMCQClick}
                        />
                    )}

                    {currentQ.type === 'boolean' && (
                        <QuizBoolean
                            selectedId={selectedOptionId}
                            status={status}
                            onSelect={(id) => handleMCQClick(id)}
                        />
                    )}

                    {currentQ.type === 'text' && (
                        <form onSubmit={handleTextSubmit} className="space-y-4">
                            <AlphaInput
                                value={textInput}
                                onChange={(e) => setTextInput(e.target.value)}
                                placeholder="Entrez le code..."
                                disabled={status === 'correct'}
                                variant={
                                    status === 'correct'
                                        ? 'success'
                                        : status === 'incorrect'
                                          ? 'error'
                                          : 'default'
                                }
                            />

                            <AlphaButton type="submit" variant={textSubmitVariant}>
                                {status === 'correct'
                                    ? 'CODE VALIDE'
                                    : status === 'incorrect'
                                      ? 'CODE INVALIDE'
                                      : 'TRANSMETTRE'}
                            </AlphaButton>
                        </form>
                    )}

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
    );
}
