'use client';

import QuizGame, { Question } from '@/components/puzzles/QuizGame';

const QUESTIONS_ADMIN: Question[] = [
    {
        type: 'number',
        question: 'Veuillez entrer le mot de passe administrateur',
        answer: 1234,
        showLegend: false,
    },
];

export default function CodeGame({ onSuccess }: { onSuccess: () => void }) {
    return <QuizGame questions={QUESTIONS_ADMIN} onSolve={onSuccess} />;
}
