'use client';

import { useState } from 'react';

import { AlphaCard } from '@/components/alpha/AlphaCard';
import { AlphaHeader } from '@/components/alpha/AlphaHeader';
import QuizGame, { Question } from '@/components/puzzles/QuizGame';

const QUESTIONS_ADMIN: Question[] = [
    {
        type: 'text',
        question: 'Veuillez entrer le mot de passe administrateur',
        answer: '1234',
    },
];

export default function AdminAccessPage() {
    const [history, setHistory] = useState<{ value: string; valid: boolean; time: string }[]>([]);

    return (
        <>
            <AlphaHeader
                title={'Accès administrateur'}
                subtitle={'Mot de passe à 4 chiffres requis'}
            />

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                {/* PUZZLE */}
                <QuizGame
                    questions={QUESTIONS_ADMIN}
                    onSolve={() => window.alert('ACCÈS AUTORISÉ — suite des énigmes débloquée')}
                    onTextAttempt={(value, isValid) => {
                        setHistory((prev) => [
                            ...prev,
                            {
                                value: value || '—',
                                valid: isValid,
                                time: new Date().toLocaleTimeString(),
                            },
                        ]);
                    }}
                />

                {/* DEBUG */}
                <AlphaCard title="Debug — Historique des codes">
                    <div className="space-y-2 text-xs">
                        {history.length === 0 && <p className="opacity-50">Aucune tentative</p>}

                        {history.map((h, i) => (
                            <div
                                key={i}
                                className="flex justify-between border-b border-white/10 pb-1"
                            >
                                <span>
                                    [{h.time}] {h.value}
                                </span>
                                <span
                                    className={h.valid ? 'text-brand-emerald' : 'text-brand-error'}
                                >
                                    {h.valid ? 'OK' : 'KO'}
                                </span>
                            </div>
                        ))}
                    </div>
                </AlphaCard>
            </div>
        </>
    );
}
