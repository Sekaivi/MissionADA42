import React from 'react';

type Difficulty = 'easy' | 'medium' | 'hard';

interface IntroScreenProps {
    difficulty: Difficulty;
    setDifficulty: (d: Difficulty) => void;
    onStart: () => void;
}

export const IntroScreen = ({ difficulty, setDifficulty, onStart }: IntroScreenProps) => (
    <div className="bg-background/95 absolute inset-0 z-50 flex flex-col items-center justify-center p-4">
        <h1 className="text-brand-emerald mb-4 text-4xl drop-shadow-[0_0_10px_rgba(0,212,146,0.8)]">
            SYSTEM_ACCESS
        </h1>
        <p className="text-muted mb-6 animate-pulse">Gyroscope Module Required</p>

        <div className="flex w-full max-w-xs flex-col gap-4">
            <label className="text-center text-sm">Select Security Layer:</label>
            <div className="mb-4 flex justify-center gap-2">
                {(['easy', 'medium', 'hard'] as const).map((lvl) => (
                    <button
                        key={lvl}
                        onClick={() => setDifficulty(lvl)}
                        className={`border px-4 py-2 ${difficulty === lvl ? 'bg-brand-emerald text-background border-brand-emerald' : 'border-muted text-muted'} uppercase`}
                    >
                        {lvl}
                    </button>
                ))}
            </div>
            <button
                onClick={onStart}
                className="border-brand-emerald text-brand-emerald hover:bg-brand-emerald hover:text-background border-2 py-4 text-xl font-bold tracking-widest uppercase shadow-[0_0_15px_var(--color-brand-emerald)] transition-colors"
            >
                INITIATE_HACK()
            </button>
        </div>
    </div>
);
