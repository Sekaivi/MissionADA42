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
    onTextAttempt?: (value: string, isValid: boolean) => void;
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
    const hasLongText = options.some((o) => o.text.length > 30);

    return (
        <div className={hasLongText ? 'flex flex-col space-y-3' : 'grid grid-cols-2 gap-3'}>
            {options.map((option) => {
                let variant: AlphaButtonVariants = 'secondary';
                const isSelected = selectedId === option.id;

                if (isSelected) {
                    variant = status === 'incorrect' ? 'danger' : 'primary';
                }

                return (
                    <AlphaButton
                        key={option.id}
                        onClick={() => onSelect(option.id)}
                        variant={variant}
                        disabled={selectedId !== null && !isSelected}
                        fullWidth
                        className={`py-6 !text-lg !font-bold ${
                            hasLongText
                                ? 'justify-between text-left'
                                : 'justify-center text-center'
                        }`}
                    >
                        {option.text}
                    </AlphaButton>
                );
            })}
        </div>
    );
};

const QuizBoolean = (props: {
    selectedId: string | number | null;
    status: 'idle' | 'correct' | 'incorrect';
    onSelect: (id: string | number) => void;
}) => (
    <QuizOptions
        options={[
            { id: 'Vrai', text: 'VRAI' },
            { id: 'Faux', text: 'FAUX' },
        ]}
        {...props}
    />
);

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
    const variant: AlphaButtonVariants =
        status === 'incorrect' ? 'danger' : 'primary';

    return (
        <div className="space-y-3">
            <p className="text-muted text-center text-xs italic">
                Utilisez les flèches pour ordonner la liste
            </p>

            {items.map((item, index) => (
                <motion.div
                    layout
                    key={item}
                    className={`flex items-center justify-between rounded border p-3 ${
                        status === 'correct'
                            ? 'border-brand-emerald bg-brand-emerald/10'
                            : status === 'incorrect'
                                ? 'border-brand-error bg-brand-error/10'
                                : 'border-white/10 bg-surface'
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
                        >
                            ⬆️
                        </button>
                        <button
                            onClick={() => onMove(index, 1)}
                            disabled={index === items.length - 1 || status !== 'idle'}
                        >
                            ⬇️
                        </button>
                    </div>
                </motion.div>
            ))}

            <AlphaButton
                onClick={onValidate}
                disabled={status !== 'idle'}
                variant={variant}
                fullWidth
            >
                {status === 'idle'
                    ? "VALIDER L'ORDRE"
                    : status === 'correct'
                        ? 'ORDRE CORRECT'
                        : 'ORDRE INCORRECT'}
            </AlphaButton>
        </div>
    );
};

export default function QuizGame({
                                     questions,
                                     onSolve,
                                     isSolved,
                                     onTextAttempt,
                                 }: QuizGameProps) {
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [status, setStatus] = useState<'idle' | 'correct' | 'incorrect'>('idle');
    const [selectedOptionId, setSelectedOptionId] = useState<string | number | null>(null);
    const [textInput, setTextInput] = useState('');

    const [currentOrder, setCurrentOrder] = useState<string[]>(() =>
        questions[0]?.type === 'sort'
            ? questions[0].options?.map((o) => o.text) || []
            : []
    );

    const currentQ = questions[currentQuestion];
    const progress = ((currentQuestion + 1) / questions.length) * 100;

    const validateAnswer = (userAnswer: string | number | string[]) => {
        let isCorrect =
            currentQ.type === 'sort'
                ? JSON.stringify(userAnswer) === JSON.stringify(currentQ.answer)
                : String(userAnswer).toLowerCase() ===
                String(currentQ.answer).toLowerCase();

        if (isCorrect) {
            setStatus('correct');

            if (currentQuestion + 1 < questions.length) {
                setTimeout(() => {
                    setStatus('idle');
                    setSelectedOptionId(null);
                    setTextInput('');

                    const nextIndex = currentQuestion + 1;
                    setCurrentQuestion(nextIndex);

                    const nextQ = questions[nextIndex];
                    setCurrentOrder(
                        nextQ.type === 'sort'
                            ? nextQ.options?.map((o) => o.text) || []
                            : []
                    );
                }, 1000);
            } else {
                setTimeout(onSolve, SCENARIO.defaultTimeBeforeNextStep);
            }
        } else {
            setStatus('incorrect');
            setTimeout(() => {
                setStatus('idle');
                setSelectedOptionId(null);
            }, 1000);
        }
    };

    const handleTextSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (status !== 'idle' || !textInput) return;

        const isValid =
            String(textInput).toLowerCase() ===
            String(currentQ.answer).toLowerCase();

        onTextAttempt?.(textInput, isValid);
        validateAnswer(textInput);
    };

    if (isSolved) return <AlphaSuccess message="SÉQUENCE VALIDÉE" />;

    return (
        <AlphaCard progress={progress}>
            <AnimatePresence mode="wait">
                <motion.div
                    key={currentQuestion}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-6"
                >
                    <AlphaFeedbackPill
                        message={`ÉTAPE ${currentQuestion + 1} / ${questions.length}`}
                        type="info"
                    />

                    <h3 className="text-xl font-bold">{currentQ.question}</h3>

                    {currentQ.image && <QuizImage src={currentQ.image} />}

                    {currentQ.type === 'text' && (
                        <form onSubmit={handleTextSubmit} className="space-y-4">
                            <AlphaInput
                                value={textInput}
                                onChange={(e) => {
                                    const value = e.target.value.replace(/\D/g, '');
                                    if (value.length <= 4) setTextInput(value);
                                }}
                                placeholder="Entrez le code..."
                                variant={
                                    status === 'correct'
                                        ? 'success'
                                        : status === 'incorrect'
                                            ? 'error'
                                            : 'default'
                                }
                            />
                            <AlphaButton type="submit">
                                {status === 'idle'
                                    ? 'TRANSMETTRE'
                                    : status === 'correct'
                                        ? 'CODE VALIDE'
                                        : 'CODE INVALIDE'}
                            </AlphaButton>
                        </form>
                    )}

                    {currentQ.type === 'qcm' && currentQ.options && (
                        <QuizOptions
                            options={currentQ.options}
                            selectedId={selectedOptionId}
                            status={status}
                            onSelect={(id) => {
                                setSelectedOptionId(id);
                                validateAnswer(id);
                            }}
                        />
                    )}

                    {currentQ.type === 'boolean' && (
                        <QuizBoolean
                            selectedId={selectedOptionId}
                            status={status}
                            onSelect={(id) => {
                                setSelectedOptionId(id);
                                validateAnswer(id);
                            }}
                        />
                    )}

                    {currentQ.type === 'sort' && (
                        <QuizSortableList
                            items={currentOrder}
                            onMove={(i, d) => {
                                const list = [...currentOrder];
                                [list[i], list[i + d]] = [list[i + d], list[i]];
                                setCurrentOrder(list);
                            }}
                            onValidate={() => validateAnswer(currentOrder)}
                            status={status}
                        />
                    )}
                </motion.div>
            </AnimatePresence>
        </AlphaCard>
    );
}
