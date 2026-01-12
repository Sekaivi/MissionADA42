'use client';

import React, { useMemo, useState } from 'react';

// 1. Import de dynamic pour désactiver le SSR
import dynamic from 'next/dynamic';

import { clsx } from 'clsx';

import { AlphaInput } from '@/components/alpha/AlphaInput';
import { AlphaSuccess } from '@/components/alpha/AlphaSuccess';
import { AlphaTitle } from '@/components/alpha/AlphaTitle';

import MazePuzzle from '../../../components/puzzles/MazePuzzle';
import PasswordGame from '../../../components/puzzles/PasswordGame';
import QuizGame, { Question } from '../../../components/puzzles/QuizGame';

// ... (Tes constantes TEST_QUESTIONS et QUESTION restent ici inchangées) ...

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
        type: 'text',
        answer: '6',
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

// 2. On renomme le composant principal (il n'est plus exporté par défaut directement)
function ChestCodeLogic() {
    // --- STATE ---
    // Plus besoin de isMounted ! Puisqu'on est sûr d'être en "No SSR".
    const [activeGameIndex, setActiveGameIndex] = useState<number | null>(null);
    const [finalInput, setFinalInput] = useState('');

    // 3. Initialisation "Lazy" : On génère les randoms directement ici.
    // Cette fonction ne s'exécutera qu'une seule fois au chargement du client.
    const [modules, setModules] = useState<SecurityModule[]>(() => {
        const secretCode = Array.from({ length: 4 }, () => Math.floor(Math.random() * 10));
        return [
            { id: 0, label: 'DAY_PASSWORD', status: 'locked', digit: secretCode[0] },
            { id: 1, label: 'MAZE_PUZZLE', status: 'locked', digit: secretCode[1] },
            { id: 2, label: 'PASSWORD_GAME', status: 'locked', digit: secretCode[2] },
            { id: 3, label: 'CULTURA_QUIZZ', status: 'locked', digit: secretCode[3] },
        ];
    });

    // --- LOGIC ---
    const handleModuleClick = (index: number) => {
        if (modules[index].status === 'solved') return;
        setActiveGameIndex(index);
    };

    const handleMiniGameWin = () => {
        if (activeGameIndex === null) return;
        setModules((prev) =>
            prev.map((m, i) => (i === activeGameIndex ? { ...m, status: 'solved' } : m))
        );
        setActiveGameIndex(null);
    };

    const handleMiniGameExit = () => {
        setActiveGameIndex(null);
    };

    const isChestUnlocked = useMemo(() => {
        if (modules.length === 0) return false;
        const correctCode = modules.map((m) => m.digit).join('');
        return finalInput === correctCode;
    }, [finalInput, modules]);

    // --- RENDU DU JEU ACTIF ---
    const renderActiveGame = () => {
        const commonProps = {
            onSolve: handleMiniGameWin,
            onExit: handleMiniGameExit,
            isSolved: activeGameIndex !== null && modules[activeGameIndex].status === 'solved',
        };

        switch (activeGameIndex) {
            case 0:
                return <QuizGame questions={QUESTION} {...commonProps} />;
            case 1:
                return <MazePuzzle {...commonProps} />;
            case 2:
                return <PasswordGame {...commonProps} />;
            case 3:
                return <QuizGame questions={TEST_QUESTIONS} {...commonProps} />;
            default:
                return null;
        }
    };

    // Plus besoin du "if (!isMounted) return null;"

    // --- VIEW: ACTIVE MINI GAME ---
    if (activeGameIndex !== null) {
        return (
            <div className="bg-background animate-in slide-in-from-bottom-10 fixed inset-0 z-50 flex flex-col duration-300">
                <div className="bg-background/80 z-10 flex items-center justify-between border-b border-white/10 p-4 backdrop-blur-md">
                    <span className="text-muted-foreground font-mono text-sm">
                        MODULE_{activeGameIndex + 1}_ACCESS
                    </span>
                    <button
                        onClick={handleMiniGameExit}
                        className="rounded border border-transparent px-2 py-1 font-mono text-xs uppercase transition-colors hover:border-red-500/50 hover:text-red-500"
                    >
                        [ ABORT SEQUENCE ]
                    </button>
                </div>
                <div className="flex flex-1 flex-col items-center justify-center overflow-y-auto p-4">
                    <div className="w-full max-w-lg">{renderActiveGame()}</div>
                </div>
            </div>
        );
    }

    // --- VIEW: HUB (CHEST CODE) ---
    return (
        <div className="bg-background text-foreground selection:bg-brand-emerald flex min-h-screen w-full flex-col items-center justify-center p-4 font-mono selection:text-black">
            <div className="mb-8 space-y-2 text-center">
                <AlphaTitle>{'/// SYSTEM_CORE ///'}</AlphaTitle>
                <div className="text-muted-foreground flex items-center justify-center gap-2 text-sm tracking-widest uppercase">
                    <span>{isChestUnlocked ? 'SYSTEM UNLOCKED' : 'ENCRYPTION ACTIVE'}</span>
                </div>
            </div>

            <div className="mb-8 grid w-full max-w-md grid-cols-2 gap-4">
                {modules.map((module, index) => (
                    <button
                        key={module.id}
                        onClick={() => handleModuleClick(index)}
                        disabled={module.status === 'solved' || isChestUnlocked}
                        className={clsx(
                            'group relative flex aspect-square flex-col items-center justify-center overflow-hidden rounded-xl border-2 p-4 transition-all duration-300',
                            module.status === 'solved'
                                ? 'border-brand-emerald bg-brand-emerald/5 text-brand-emerald shadow-[0_0_15px_-3px_rgba(16,185,129,0.3)]'
                                : 'border-white/10 bg-white/5 hover:border-white/40 hover:bg-white/10 active:scale-95',
                            isChestUnlocked && 'pointer-events-none opacity-40 grayscale'
                        )}
                    >
                        {module.status === 'solved' ? (
                            <div className="animate-in zoom-in flex flex-col items-center duration-300">
                                <span className="text-5xl font-bold tracking-tighter drop-shadow-md">
                                    {module.digit}
                                </span>
                                <span className="mt-2 text-[9px] tracking-widest uppercase opacity-80">
                                    Decrypted
                                </span>
                            </div>
                        ) : (
                            <>
                                <div className="text-muted-foreground group-hover:text-foreground mb-3 opacity-70 transition-colors group-hover:opacity-100">
                                    {module.icon}
                                </div>
                                <span className="text-[10px] font-bold tracking-widest">
                                    {module.label}
                                </span>
                                <span className="absolute right-2 bottom-2 text-[9px] text-red-500/60 group-hover:text-red-400">
                                    [LOCKED]
                                </span>
                            </>
                        )}
                    </button>
                ))}
            </div>

            <div className="relative z-10 w-full max-w-md">
                <div className="text-muted-foreground mb-2 flex justify-between px-1 text-xs">
                    <span>MASTER_KEY_INPUT</span>
                    <span>{finalInput.length}/4</span>
                </div>

                <AlphaInput
                    value={finalInput}
                    onChange={(e) => {
                        const val = e.target.value.replace(/[^0-9]/g, '').slice(0, 4);
                        setFinalInput(val);
                    }}
                    disabled={isChestUnlocked}
                    variant={isChestUnlocked ? 'success' : 'default'}
                    placeholder="_ _ _ _"
                    className="h-16 text-center text-lg font-bold tracking-[1em]"
                    autoComplete="off"
                />
            </div>

            {isChestUnlocked && (
                <div className="bg-background/95 animate-in fade-in fixed inset-0 z-[100] flex items-center justify-center backdrop-blur-md duration-700">
                    <AlphaSuccess message={'/// CORE DUMP ACCESSED ///'} />
                </div>
            )}
        </div>
    );
}

// 4. Export par défaut avec SSR désactivé via dynamic()
// L'option { ssr: false } garantit que ce code ne tourne que sur le navigateur.
export default dynamic(() => Promise.resolve(ChestCodeLogic), {
    ssr: false,
    // Optionnel : un état de chargement propre si nécessaire
    loading: () => (
        <div className="flex h-screen w-full items-center justify-center font-mono text-xs">
            INITIALIZING...
        </div>
    ),
});
