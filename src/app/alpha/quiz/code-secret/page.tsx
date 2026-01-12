'use client';

import { AlphaHeader } from '@/components/alpha/AlphaHeader';
import QuizGame, { Question } from '@/components/puzzles/QuizGame';

const QUESTIONS_ADMIN: Question[] = [
    {
        type: 'number',
        question: 'Veuillez entrer le mot de passe administrateur',
        answer: 6092,
        showLegend: true,
    },
];

export default function AdminAccessPage() {
    return (
        <>
            <AlphaHeader
                title={'Accès administrateur'}
                subtitle={'Mot de passe à 4 chiffres requis'}
            />

            <QuizGame
                questions={QUESTIONS_ADMIN}
                onSolve={() => window.alert('ACCÈS AUTORISÉ — suite des énigmes débloquée')}
            />
        </>
    );
}
