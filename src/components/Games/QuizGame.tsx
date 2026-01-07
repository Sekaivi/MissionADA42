'use client';
/* eslint-disable @next/next/no-img-element */
import { useState } from 'react';

import { AnimatePresence, motion } from 'framer-motion';

// --- DEFINITION DES TYPES ---
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

export default function QuizGame({ title, description, questions, onComplete }: QuizGameProps) {
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [status, setStatus] = useState<'idle' | 'correct' | 'incorrect'>('idle');

    const [selectedOptionId, setSelectedOptionId] = useState<string | number | null>(null);
    const [textInput, setTextInput] = useState('');

    // CORRECTION : Initialisation directe et paresseuse (Lazy State)
    const [currentOrder, setCurrentOrder] = useState<string[]>(() => {
        const firstQ = questions[0];
        // On initialise directement avec les textes des options si c'est un tri
        if (firstQ.type === 'sort' && firstQ.options) {
            return firstQ.options.map((o) => o.text);
        }
        return [];
    });

    const currentQ = questions[currentQuestion];

    // --- LOGIQUE DE VALIDATION ---
    const validateAnswer = (userAnswer: string | number | string[]) => {
        let isCorrect = false;

        // Validation Tri (Sort)
        if (
            currentQ.type === 'sort' &&
            Array.isArray(userAnswer) &&
            Array.isArray(currentQ.answer)
        ) {
            isCorrect = JSON.stringify(userAnswer) === JSON.stringify(currentQ.answer);
        }
        // Validation Standard (MCQ / Text / Bool)
        else if (currentQ.type !== 'sort') {
            isCorrect = String(userAnswer).toLowerCase() === String(currentQ.answer).toLowerCase();
        }

        if (isCorrect) {
            setStatus('correct');
            setTimeout(() => {
                setStatus('idle');
                setSelectedOptionId(null);
                setTextInput('');

                // Passage à la question suivante
                if (currentQuestion + 1 < questions.length) {
                    const nextIndex = currentQuestion + 1;
                    setCurrentQuestion(nextIndex);

                    // CORRECTION : Mise à jour manuelle de l'ordre pour la prochaine question
                    const nextQ = questions[nextIndex];
                    if (nextQ.type === 'sort' && nextQ.options) {
                        setCurrentOrder(nextQ.options.map((o) => o.text));
                    } else {
                        setCurrentOrder([]);
                    }
                } else {
                    onComplete();
                }
            }, 1000);
        } else {
            setStatus('incorrect');
            setTimeout(() => {
                setStatus('idle');
                setSelectedOptionId(null);
            }, 1000);
        }
    };

    // --- HANDLERS ---
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

    const handleBooleanClick = (val: 'Vrai' | 'Faux') => {
        if (selectedOptionId !== null || status !== 'idle') return;
        setSelectedOptionId(val);
        validateAnswer(val);
    };

    const moveItem = (index: number, direction: -1 | 1) => {
        if (status !== 'idle') return;
        const newList = [...currentOrder];
        const newIndex = index + direction;

        if (newIndex >= 0 && newIndex < newList.length) {
            [newList[index], newList[newIndex]] = [newList[newIndex], newList[index]];
            setCurrentOrder(newList);
        }
    };

    const progress = (currentQuestion / questions.length) * 100;

    return (
        <div className="mx-auto w-full max-w-2xl px-4">
            <div className="mb-6 text-center">
                <h2 className="mb-2 text-2xl font-bold text-gray-800 md:text-3xl">{title}</h2>
                {description && <p className="text-gray-600">{description}</p>}
            </div>

            <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-xl">
                <div className="h-2 w-full bg-gray-100">
                    <motion.div
                        className="h-full bg-blue-500"
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 0.5 }}
                    />
                </div>

                <div className="p-6 md:p-8">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={currentQuestion}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.3 }}
                        >
                            <span className="mb-4 inline-block rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-600">
                                ÉTAPE {currentQuestion + 1} / {questions.length}
                            </span>

                            <h3 className="mb-4 text-xl font-bold text-gray-800">
                                {currentQ.question}
                            </h3>

                            {currentQ.image && (
                                <div className="mb-6 flex justify-center overflow-hidden rounded-xl border border-gray-200 bg-gray-50 shadow-sm">
                                    <img
                                        src={currentQ.image}
                                        alt="Indice visuel"
                                        className="max-h-64 w-auto object-contain"
                                    />
                                </div>
                            )}

                            {/* TYPE 1 : QCM (MCQ) */}
                            {currentQ.type === 'qcm' && currentQ.options && (
                                <div className="space-y-3">
                                    {currentQ.options.map((option) => {
                                        let btnClass =
                                            'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100 hover:border-blue-300';

                                        if (selectedOptionId === option.id) {
                                            if (status === 'correct')
                                                btnClass =
                                                    'bg-green-500 border-green-600 text-white shadow-md';
                                            else if (status === 'incorrect')
                                                btnClass = 'bg-red-500 border-red-600 text-white';
                                            else
                                                btnClass = 'bg-blue-600 border-blue-700 text-white';
                                        }

                                        return (
                                            <motion.button
                                                key={option.id}
                                                whileTap={{ scale: 0.98 }}
                                                onClick={() => handleMCQClick(option.id)}
                                                disabled={selectedOptionId !== null}
                                                className={`w-full rounded-xl border-2 p-4 text-left font-medium transition-all ${btnClass}`}
                                            >
                                                <div className="flex justify-between">
                                                    <span>{option.text}</span>
                                                    {selectedOptionId === option.id &&
                                                        status === 'correct' && <span>✅</span>}
                                                    {selectedOptionId === option.id &&
                                                        status === 'incorrect' && <span>❌</span>}
                                                </div>
                                            </motion.button>
                                        );
                                    })}
                                </div>
                            )}

                            {/* TYPE 2 : TEXTE */}
                            {currentQ.type === 'text' && (
                                <form onSubmit={handleTextSubmit} className="mt-4">
                                    <input
                                        type="text"
                                        value={textInput}
                                        onChange={(e) => setTextInput(e.target.value)}
                                        placeholder="Votre réponse..."
                                        disabled={status === 'correct'}
                                        className={`w-full rounded-xl border-2 p-4 text-lg transition-all outline-none ${
                                            status === 'correct'
                                                ? 'border-green-500 bg-green-50 text-green-700'
                                                : status === 'incorrect'
                                                  ? 'border-red-300 bg-red-50 text-red-700'
                                                  : 'border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100'
                                        }`}
                                    />
                                    <button
                                        type="submit"
                                        disabled={!textInput.trim() || status !== 'idle'}
                                        className={`mt-4 w-full rounded-xl px-6 py-3 font-bold text-white transition-all ${
                                            status === 'correct'
                                                ? 'bg-green-500'
                                                : status === 'incorrect'
                                                  ? 'bg-red-500'
                                                  : 'bg-blue-600 hover:bg-blue-700'
                                        }`}
                                    >
                                        {status === 'correct'
                                            ? 'BRAVO'
                                            : status === 'incorrect'
                                              ? 'INCORRECT'
                                              : 'VALIDER'}
                                    </button>
                                </form>
                            )}

                            {/* TYPE 3 : VRAI / FAUX */}
                            {currentQ.type === 'boolean' && (
                                <div className="mt-4 flex gap-4">
                                    {['Vrai', 'Faux'].map((val) => (
                                        <motion.button
                                            key={val}
                                            whileTap={{ scale: 0.95 }}
                                            onClick={() =>
                                                handleBooleanClick(val as 'Vrai' | 'Faux')
                                            }
                                            disabled={selectedOptionId !== null}
                                            className={`flex-1 rounded-xl border-b-4 py-6 text-xl font-bold transition-all ${
                                                selectedOptionId === val
                                                    ? status === 'correct'
                                                        ? 'border-green-700 bg-green-500 text-white'
                                                        : status === 'incorrect'
                                                          ? 'border-red-700 bg-red-500 text-white'
                                                          : 'bg-blue-600 text-white'
                                                    : val === 'Vrai'
                                                      ? 'border-green-200 bg-green-50 text-green-700 hover:bg-green-100'
                                                      : 'border-red-200 bg-red-50 text-red-700 hover:bg-red-100'
                                            }`}
                                        >
                                            {val}
                                        </motion.button>
                                    ))}
                                </div>
                            )}

                            {/* TYPE 4 : TRI (SORT) */}
                            {currentQ.type === 'sort' && currentOrder.length > 0 && (
                                <div className="mt-4 space-y-3">
                                    <p className="mb-2 text-center text-sm text-gray-500 italic">
                                        Utilisez les flèches pour ordonner la liste
                                    </p>
                                    {currentOrder.map((item, index) => (
                                        <motion.div
                                            layout
                                            key={item}
                                            className={`flex items-center justify-between rounded-lg border-2 bg-white p-3 ${
                                                status === 'correct'
                                                    ? 'border-green-500 bg-green-50'
                                                    : status === 'incorrect'
                                                      ? 'border-red-500 bg-red-50'
                                                      : 'border-gray-200'
                                            }`}
                                        >
                                            <span className="font-medium text-gray-700">
                                                <span className="mr-2 text-gray-400">
                                                    {index + 1}.
                                                </span>
                                                {item}
                                            </span>
                                            <div className="flex gap-1">
                                                <button
                                                    onClick={() => moveItem(index, -1)}
                                                    disabled={index === 0 || status !== 'idle'}
                                                    className="rounded p-1 text-gray-600 hover:bg-gray-100 disabled:opacity-30"
                                                >
                                                    ⬆️
                                                </button>
                                                <button
                                                    onClick={() => moveItem(index, 1)}
                                                    disabled={
                                                        index === currentOrder.length - 1 ||
                                                        status !== 'idle'
                                                    }
                                                    className="rounded p-1 text-gray-600 hover:bg-gray-100 disabled:opacity-30"
                                                >
                                                    ⬇️
                                                </button>
                                            </div>
                                        </motion.div>
                                    ))}
                                    <button
                                        onClick={() => validateAnswer(currentOrder)}
                                        disabled={status !== 'idle'}
                                        className={`mt-4 w-full rounded-xl px-6 py-3 font-bold text-white transition-all ${
                                            status === 'correct'
                                                ? 'bg-green-500'
                                                : status === 'incorrect'
                                                  ? 'bg-red-500'
                                                  : 'bg-blue-600 hover:bg-blue-700'
                                        }`}
                                    >
                                        {status === 'correct'
                                            ? 'ORDRE CORRECT'
                                            : status === 'incorrect'
                                              ? 'ORDRE INCORRECT'
                                              : "VALIDER L'ORDRE"}
                                    </button>
                                </div>
                            )}
                        </motion.div>
                    </AnimatePresence>
                </div>

                <div className="flex h-16 items-center justify-center border-t border-gray-100 bg-gray-50 px-6 py-4">
                    <AnimatePresence>
                        {status === 'correct' && (
                            <motion.span
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0 }}
                                className="flex items-center gap-2 font-bold text-green-600"
                            >
                                ✅ Bonne réponse !
                            </motion.span>
                        )}
                        {status === 'incorrect' && (
                            <motion.span
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0 }}
                                className="flex items-center gap-2 font-bold text-red-500"
                            >
                                ❌ Mauvaise réponse...
                            </motion.span>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
}
