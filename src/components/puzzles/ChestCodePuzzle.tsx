'use client';

import React, { useEffect, useMemo, useState } from 'react';

import { LockClosedIcon } from '@heroicons/react/24/solid';
import { clsx } from 'clsx';

import { AlphaButton } from '@/components/alpha/AlphaButton';
import { AlphaPuzzleHeader } from '@/components/alpha/AlphaGameHeader';
import { AlphaInput } from '@/components/alpha/AlphaInput';
import { AlphaSuccess } from '@/components/alpha/AlphaSuccess';
import { AlphaTitle } from '@/components/alpha/AlphaTitle';
import { DialogueBox } from '@/components/dialogueBox';
import MazePuzzle from '@/components/puzzles/MazePuzzle';
import { PasswordPuzzle } from '@/components/puzzles/PasswordPuzzle';
import { PuzzlePhases, PuzzleProps } from '@/components/puzzles/PuzzleRegistry';
import QuizGame, { Question } from '@/components/puzzles/QuizGame';
import { useGameScenario, useScenarioTransition } from '@/hooks/useGameScenario';

export type ChestCodePuzzlePhases =
    | PuzzlePhases
    | 'solved_quiz'
    | 'solved_maze'
    | 'solved_password'
    | 'solved_cultura';

const TEST_QUESTIONS: Question[] = [
    {
        question: 'Quel protocole est utilisé pour le transfert sécurisé ?',
        type: 'qcm',
        options: [
            { id: 'http', text: 'HTTP' },
            { id: 'ftp', text: 'FTP' },
            { id: 'https', text: 'HTTPS' },
            { id: 'smtp', text: 'SMTP' },
        ],
        answer: 'https',
    },
    {
        question: "L'accès root est-il autorisé ?",
        type: 'boolean',
        answer: 'Faux',
    },
];

const QUESTION: Question[] = [
    {
        question: 'Quel est le chiffre obtenu grâce au post-it ?',
        type: 'number',
        answer: 6,
        showLegend: false,
    },
];

type ModuleStatus = 'locked' | 'active' | 'solved';

interface SecurityModule {
    id: number;
    label: string;
    icon?: React.ReactNode;
    status: ModuleStatus;
    digit: number;
}

interface ChestCodePuzzleProps extends PuzzleProps {
    solution?: number[];
}

export default function ChestCodePuzzle({
    onSolve,
    isSolved,
    scripts = {},
    solution = [0, 0, 0, 0],
}: ChestCodePuzzleProps) {
    const { gameState, triggerPhase, isDialogueOpen, currentScript, onDialogueComplete } =
        useGameScenario<ChestCodePuzzlePhases>(scripts);

    const [activeGameIndex, setActiveGameIndex] = useState<number | null>(null);
    const [finalInput, setFinalInput] = useState('');

    const [modules, setModules] = useState<SecurityModule[]>([
        { id: 0, label: 'CULTURA_QUIZZ', status: 'locked', digit: 0 },
        { id: 1, label: 'MAZE_PUZZLE', status: 'locked', digit: 0 },
        { id: 2, label: 'DAY_PASSWORD', status: 'locked', digit: 0 },
        { id: 3, label: 'TECH_QUIZ', status: 'locked', digit: 0 },
    ]);

    useEffect(() => {
        if (!isSolved) {
            triggerPhase('intro');
        }
    }, [isSolved, triggerPhase]);

    useScenarioTransition(gameState, isDialogueOpen, {
        intro: () => {
            triggerPhase('playing');
        },
        // retour au jeu après le dialogue de victoire d'un module
        solved_quiz: () => triggerPhase('playing'),
        solved_maze: () => triggerPhase('playing'),
        solved_password: () => triggerPhase('playing'),
        solved_cultura: () => triggerPhase('playing'),
        // victoire finale
        win: () => {
            onSolve();
        },
    });

    useEffect(() => {
        const timer = setTimeout(() => {
            setModules((prev) =>
                prev.map((m, i) => ({
                    ...m,
                    digit: solution[i] ?? 0,
                }))
            );
        }, 0);

        return () => clearTimeout(timer);
    }, [solution]); // On ajoute 'solution' aux dépendances
    // vérification du code global
    const isChestUnlocked = useMemo(() => {
        if (modules.length === 0) return false;
        const correctCode = modules.map((m) => m.digit).join('');
        return finalInput === correctCode;
    }, [finalInput, modules]);

    // détection de la victoire globale
    useEffect(() => {
        if (isChestUnlocked && gameState === 'playing' && !isSolved) {
            const timer = setTimeout(() => {
                triggerPhase('win');
            }, 500);
            return () => clearTimeout(timer);
        }
    }, [isChestUnlocked, gameState, isSolved, triggerPhase]);

    const handleModuleClick = (index: number) => {
        if (modules[index].status === 'solved' || isChestUnlocked || isSolved || isDialogueOpen)
            return;
        setActiveGameIndex(index);
    };

    const handleMiniGameWin = () => {
        if (activeGameIndex === null) return;

        setModules((prev) =>
            prev.map((m, i) => (i === activeGameIndex ? { ...m, status: 'solved' } : m))
        );

        // déclenche le dialogue de succès du module
        switch (activeGameIndex) {
            case 0:
                triggerPhase('solved_cultura');
                break;
            case 1:
                triggerPhase('solved_maze');
                break;
            case 2:
                triggerPhase('solved_password');
                break;
            case 3:
                triggerPhase('solved_quiz');
                break;
        }

        setActiveGameIndex(null);
    };

    const handleMiniGameExit = () => {
        setActiveGameIndex(null);
    };

    const renderActiveGame = () => {
        const commonProps = {
            onSolve: handleMiniGameWin,
            onExit: handleMiniGameExit,
            isSolved: activeGameIndex !== null && modules[activeGameIndex].status === 'solved',
        };

        const successModal = {
            title: 'Module validé',
            message: 'Une clé de déchiffrement a été débloquée !',
        };

        switch (activeGameIndex) {
            case 0:
                return (
                    <QuizGame modalConfig={successModal} questions={QUESTION} {...commonProps} />
                );
            case 1:
                return <MazePuzzle modalConfig={successModal} {...commonProps} />;
            case 2:
                return <PasswordPuzzle modalConfig={successModal} {...commonProps} />;
            case 3:
                return (
                    <QuizGame
                        modalConfig={successModal}
                        questions={TEST_QUESTIONS}
                        {...commonProps}
                    />
                );
            default:
                return null;
        }
    };

    if (isSolved) return <AlphaSuccess message={'COFFRE DÉVERROUILLÉ'} />;

    if (activeGameIndex !== null) {
        return (
            <>
                <AlphaPuzzleHeader
                    left={`MODULE_${activeGameIndex + 1}_ACCESS`}
                    right={
                        <AlphaButton onClick={handleMiniGameExit} variant={'ghost'}>
                            [ RETOUR ]
                        </AlphaButton>
                    }
                />
                <div className="mx-auto">{renderActiveGame()}</div>
            </>
        );
    }

    return (
        <>
            <DialogueBox
                isOpen={isDialogueOpen}
                script={currentScript}
                onComplete={onDialogueComplete}
            />

            <div className={'text-center'}>
                <AlphaTitle>{'/// SYSTEM_CORE ///'}</AlphaTitle>
                <div className="text-muted uppercase">
                    <span>
                        {isChestUnlocked || isSolved ? 'SYSTEM UNLOCKED' : 'ENCRYPTION ACTIVE'}
                    </span>
                </div>
            </div>

            <div className="mx-auto grid w-full grid-cols-2 gap-4">
                {modules.map((module, index) => (
                    <button
                        key={module.id}
                        onClick={() => handleModuleClick(index)}
                        disabled={
                            module.status === 'solved' ||
                            isChestUnlocked ||
                            isSolved ||
                            isDialogueOpen
                        }
                        className={clsx(
                            'group relative flex aspect-square flex-col items-center justify-center overflow-hidden rounded-xl border-2 p-4 transition-all duration-300',
                            module.status === 'solved'
                                ? 'border-brand-emerald bg-brand-emerald/5 text-brand-emerald shadow-[0_0_15px_-3px_var(--color-brand-emerald)]'
                                : 'border-border bg-surface hover:bg-surface-highlight active:scale-95',
                            (isChestUnlocked || isSolved || isDialogueOpen) &&
                                'pointer-events-none opacity-40 grayscale'
                        )}
                    >
                        {module.status === 'solved' ? (
                            <div className="animate-in zoom-in flex flex-col items-center duration-300">
                                <span className="text-5xl font-bold tracking-tighter drop-shadow-md">
                                    {module.digit}
                                </span>
                            </div>
                        ) : (
                            <>
                                <div className="text-muted-foreground group-hover:text-foreground mb-3 opacity-70 transition-colors group-hover:opacity-100">
                                    {module.icon || <LockClosedIcon className={'h-6 w-6'} />}
                                </div>
                                <span className="text-xs font-bold tracking-widest">
                                    {module.label}
                                </span>
                            </>
                        )}
                    </button>
                ))}
            </div>

            <div className="relative z-10 mx-auto w-full">
                <AlphaInput
                    value={finalInput}
                    onChange={(e) =>
                        setFinalInput(e.target.value.replace(/[^0-9]/g, '').slice(0, 4))
                    }
                    disabled={isChestUnlocked || isSolved || isDialogueOpen}
                    variant={isChestUnlocked || isSolved ? 'success' : 'default'}
                    placeholder="_ _ _ _"
                    className="h-16 text-center text-lg font-bold tracking-[1em]"
                />
            </div>

            {(isChestUnlocked || isSolved) && gameState !== 'win' && (
                <div className="animate-in fade-in zoom-in mt-8 duration-500">
                    <AlphaSuccess message={'/// CORE DUMP ACCESSED ///'} />
                </div>
            )}
        </>
    );
}
