'use client';

import React, { useState } from 'react';

import Image from 'next/image';

import { AnimatePresence, motion } from 'framer-motion';

import { AlphaButton, AlphaButtonVariants } from '@/components/alpha/AlphaButton';
import { AlphaCard } from '@/components/alpha/AlphaCard';
import AlphaFeedbackPill from '@/components/alpha/AlphaFeedbackPill';
import { AlphaInput } from '@/components/alpha/AlphaInput';
import { AlphaMessageScreen } from '@/components/alpha/AlphaMessageScreen';
import { AlphaSuccess } from '@/components/alpha/AlphaSuccess';
import { AlphaTerminalWrapper, TerminalVariant } from '@/components/alpha/AlphaTerminalWrapper';
import { PuzzleProps } from '@/components/puzzles/PuzzleRegistry';
import { SCENARIO } from '@/data/alphaScenario';

export interface Question {
    question: string;
    image?: string;
    type: 'qcm' | 'text' | 'boolean' | 'sort' | 'number';
    options?: { id: string | number; text: string }[];
    answer: string | number | string[];
    showLegend?: boolean;
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
                            hasLongText ? 'justify-between text-left' : 'justify-center text-center'
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
    const variant: AlphaButtonVariants = status === 'incorrect' ? 'danger' : 'primary';

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
                              : 'bg-surface border-border'
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
                            className="rounded p-2 hover:bg-white/10"
                        >
                            ⬆️
                        </button>
                        <button
                            onClick={() => onMove(index, 1)}
                            disabled={index === items.length - 1 || status !== 'idle'}
                            className="rounded p-2 hover:bg-white/10"
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

const CodeGame = ({
    targetCode,
    onSuccess,
    showLegend = true,
}: {
    targetCode: string;
    onSuccess: () => void;
    showLegend?: boolean;
}) => {
    const codeLength = targetCode.length;
    const [currentGuess, setCurrentGuess] = useState<string>('');
    const [history, setHistory] = useState<{ guess: string; result: string[] }[]>([]);

    const [status, setStatus] = useState('DÉCRYPTAGE REQUIS');
    const [isSuccess, setIsSuccess] = useState(false);
    const [isError, setIsError] = useState(false);
    const [shake, setShake] = useState(0);

    const historyRef = React.useRef<HTMLDivElement>(null);

    React.useEffect(() => {
        // scroll vers le bas à chaque nouvel essai
        if (historyRef.current) {
            historyRef.current.scrollTop = historyRef.current.scrollHeight;
        }
    }, [history]);

    const handleInput = (num: string) => {
        if (isSuccess || currentGuess.length >= codeLength || isError) return;
        if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(10);
        setCurrentGuess((prev) => prev + num);
    };

    const handleDelete = () => {
        if (isSuccess || isError) return;
        setCurrentGuess((prev) => prev.slice(0, -1));
    };

    const checkCode = () => {
        if (currentGuess.length !== codeLength) return;

        const result: string[] = Array(codeLength).fill('gray');
        const secretArr = targetCode.split('');
        const guessArr = currentGuess.split('');

        // verts : bien placé
        guessArr.forEach((digit, i) => {
            if (digit === secretArr[i]) {
                result[i] = 'green';
                secretArr[i] = '#'; // utilisé dans le secret
                guessArr[i] = '*'; // traité dans l'essai
            }
        });

        // jaunes : mal placé
        guessArr.forEach((digit, i) => {
            if (digit !== '*') {
                // si pas déjà vert
                const foundIndex = secretArr.indexOf(digit);
                if (foundIndex !== -1) {
                    result[i] = 'yellow';
                    secretArr[foundIndex] = '#'; // consomme l'occurrence
                }
            }
        });

        // calcul du succès => tout doit être vert
        const isWin = result.every((r) => r === 'green');

        setHistory((prev) => [...prev, { guess: currentGuess, result }]);

        if (isWin) {
            setIsSuccess(true);
            setStatus('ACCÈS AUTORISÉ');
            if (typeof navigator !== 'undefined' && navigator.vibrate)
                navigator.vibrate([50, 50, 50]);
            onSuccess();
        } else {
            setCurrentGuess('');
            setStatus('CODE INCORRECT');
            setIsError(true);
            setShake((prev) => prev + 1);
            if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(200);

            setTimeout(() => {
                setIsError(false);
                setStatus('DÉCRYPTAGE REQUIS');
            }, 1500);
        }
    };

    let terminalVariant: TerminalVariant = 'success';
    if (isSuccess) terminalVariant = 'success';
    else if (isError) terminalVariant = 'error';

    const themeColor = isError ? 'text-brand-error' : 'text-brand-emerald';
    const borderColor = isError ? 'border-brand-error' : 'border-brand-emerald';
    const bgColor = isError ? 'bg-brand-error/10' : 'bg-brand-emerald/10';

    return (
        <div className="flex w-full flex-col items-center font-mono text-sm select-none">
            <AlphaTerminalWrapper variant={terminalVariant} className="mb-3">
                <div
                    ref={historyRef}
                    className="custom-scrollbar mb-2 flex h-32 flex-col gap-1 overflow-y-auto overscroll-y-contain pr-1"
                >
                    {history.length === 0 && (
                        <div
                            className={`flex h-full flex-col items-center justify-center text-center text-xs opacity-50 ${isError ? 'text-brand-error' : 'text-brand-emerald'}`}
                        >
                            <p>INITIALISATION...</p>
                            <p>CODE REQUIS ({codeLength} CHIFFRES)</p>
                        </div>
                    )}
                    {history.map((item, idx) => (
                        <div
                            key={idx}
                            className={`animate-in slide-in-from-left flex shrink-0 items-center justify-between border-b pb-1 ${isError ? 'border-brand-error/30' : 'border-brand-emerald/30'}`}
                        >
                            <span
                                className={`text-base font-bold tracking-[0.3em] ${isError ? 'text-brand-error' : 'text-brand-emerald'}`}
                            >
                                {item.guess}
                            </span>

                            {showLegend && (
                                <div className="flex gap-1.5">
                                    {item.result.map((color, i) => (
                                        <div
                                            key={i}
                                            className={`border-border h-3 w-3 rounded-full border ${
                                                color === 'green'
                                                    ? 'bg-brand-emerald shadow-[0_0_8px_var(--color-brand-emerald)]'
                                                    : color === 'yellow'
                                                      ? 'bg-brand-yellow'
                                                      : 'bg-muted'
                                            }`}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                <motion.div
                    key={shake}
                    animate={{ x: [0, -5, 5, -5, 5, 0] }}
                    transition={{ duration: 0.4 }}
                    className={`mb-2 flex items-center justify-center gap-2 rounded border py-2 transition-colors duration-300 md:gap-3 ${borderColor} ${bgColor}`}
                >
                    {/* slots dynamiques selon codeLength */}
                    {Array.from({ length: codeLength }).map((_, i) => (
                        <div
                            key={i}
                            className={`flex h-12 w-8 items-center justify-center border-b-2 text-2xl font-bold transition-colors duration-300 md:w-10 md:text-3xl ${borderColor} ${themeColor}`}
                        >
                            {currentGuess[i] || (
                                <motion.span
                                    animate={{ opacity: [0, 0.5, 0] }}
                                    transition={{ repeat: Infinity, duration: 1.5 }}
                                    className={themeColor}
                                >
                                    _
                                </motion.span>
                            )}
                        </div>
                    ))}
                </motion.div>

                {isSuccess ? (
                    <AlphaMessageScreen
                        title={status}
                        variant={'success'}
                        description={''}
                        titleClassName={'mb-0'}
                    />
                ) : (
                    <p
                        className={`text-center text-xs font-bold tracking-wider transition-colors duration-300 ${themeColor}`}
                    >
                        {status}
                    </p>
                )}
            </AlphaTerminalWrapper>

            {showLegend && (
                <div className="border-border text-muted mb-3 grid w-full grid-cols-1 gap-1 rounded-lg border p-2 text-xs shadow-inner md:gap-2">
                    <div className="flex items-center gap-2">
                        <div className="bg-brand-emerald h-2 w-2 shrink-0 rounded-full shadow-sm"></div>
                        <span>
                            <strong className="text-brand-emerald">Bon</strong> chiffre,{' '}
                            <strong className="text-brand-emerald">bonne</strong> place.
                        </span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="bg-brand-yellow h-2 w-2 shrink-0 rounded-full shadow-sm"></div>
                        <span>
                            <strong className="text-brand-yellow">Bon</strong> chiffre,{' '}
                            <strong className="text-brand-yellow">mauvaise</strong> place.
                        </span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="bg-muted h-2 w-2 shrink-0 rounded-full shadow-sm"></div>
                        <span>
                            Chiffre <strong className="text-gray-400">incorrect</strong>.
                        </span>
                    </div>
                </div>
            )}

            {/* clavier */}
            <div className="grid w-full grid-cols-3 gap-2">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                    <AlphaButton
                        key={num}
                        onClick={() => handleInput(num.toString())}
                        disabled={isSuccess || isError}
                        variant={'secondary'}
                        fullWidth
                        className={'py-5 text-xl font-bold'}
                    >
                        {num}
                    </AlphaButton>
                ))}

                <AlphaButton
                    onClick={handleDelete}
                    disabled={isSuccess || isError}
                    fullWidth
                    variant={'danger'}
                >
                    EFFACER
                </AlphaButton>

                <AlphaButton
                    onClick={() => handleInput('0')}
                    disabled={isSuccess || isError}
                    variant={'secondary'}
                    className={'py-5 text-xl font-bold'}
                    fullWidth
                >
                    0
                </AlphaButton>

                <AlphaButton
                    onClick={checkCode}
                    disabled={currentGuess.length !== codeLength || isSuccess || isError}
                    variant={`${isError ? 'danger' : 'primary'}`}
                    fullWidth
                >
                    {isError ? 'ERREUR' : 'VALIDER'}
                </AlphaButton>
            </div>
        </div>
    );
};

export default function QuizGame({ questions, onSolve, isSolved }: QuizGameProps) {
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [status, setStatus] = useState<'idle' | 'correct' | 'incorrect'>('idle');
    const [selectedOptionId, setSelectedOptionId] = useState<string | number | null>(null);
    const [textInput, setTextInput] = useState('');

    const [currentOrder, setCurrentOrder] = useState<string[]>(() =>
        questions[0]?.type === 'sort' ? questions[0].options?.map((o) => o.text) || [] : []
    );

    const currentQ = questions[currentQuestion];
    const progress = ((currentQuestion + 1) / questions.length) * 100;

    const handleNextStep = () => {
        if (currentQuestion + 1 < questions.length) {
            setTimeout(() => {
                setStatus('idle');
                setSelectedOptionId(null);
                setTextInput('');

                const nextIndex = currentQuestion + 1;
                setCurrentQuestion(nextIndex);

                const nextQ = questions[nextIndex];
                setCurrentOrder(
                    nextQ.type === 'sort' ? nextQ.options?.map((o) => o.text) || [] : []
                );
            }, 1000);
        } else {
            setTimeout(onSolve, SCENARIO.defaultTimeBeforeNextStep);
        }
    };

    const validateAnswer = (userAnswer: string | number | string[]) => {
        const isCorrect =
            currentQ.type === 'sort'
                ? JSON.stringify(userAnswer) === JSON.stringify(currentQ.answer)
                : String(userAnswer).toLowerCase() === String(currentQ.answer).toLowerCase();

        if (isCorrect) {
            setStatus('correct');
            handleNextStep();
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

                    {/* --- TYPE: TEXT --- */}
                    {currentQ.type === 'text' && (
                        <form onSubmit={handleTextSubmit} className="space-y-4">
                            <AlphaInput
                                value={textInput}
                                onChange={(e) => setTextInput(e.target.value)}
                                placeholder="Entrez la réponse..."
                                variant={
                                    status === 'correct'
                                        ? 'success'
                                        : status === 'incorrect'
                                          ? 'error'
                                          : 'default'
                                }
                            />
                            <AlphaButton
                                type="submit"
                                variant={`${status === 'idle' ? 'secondary' : status === 'correct' ? 'primary' : 'danger'}`}
                            >
                                {status === 'idle'
                                    ? 'TRANSMETTRE'
                                    : status === 'correct'
                                      ? 'RÉPONSE VALIDE'
                                      : 'RÉPONSE INVALIDE'}
                            </AlphaButton>
                        </form>
                    )}

                    {/* --- TYPE: QCM --- */}
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

                    {/* --- TYPE: BOOLEAN --- */}
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

                    {/* --- TYPE: SORT --- */}
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

                    {/* --- TYPE: NUMBER (CODE GAME) --- */}
                    {currentQ.type === 'number' && (
                        <CodeGame
                            targetCode={String(currentQ.answer)}
                            showLegend={currentQ.showLegend}
                            onSuccess={() => {
                                setStatus('correct');
                                handleNextStep();
                            }}
                        />
                    )}
                </motion.div>
            </AnimatePresence>
        </AlphaCard>
    );
}
