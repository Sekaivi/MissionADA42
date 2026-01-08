'use client';
import { AlphaHeader } from '@/components/alpha/AlphaHeader';
import QuizGame, { Question } from '@/components/puzzles/QuizGame';

const QUESTIONS_LOGIC: Question[] = [
    {
        type: 'boolean',
        question: 'Le langage HTML est un langage de programmation.',
        answer: 'Faux',
    },
    {
        type: 'boolean',
        question: 'Le CSS permet de styliser les pages web.',
        answer: 'Vrai',
    },
];

export default function QuizTrueFalsePage() {
    return (
        <>
            <AlphaHeader title={'Test de logique'} />
            <QuizGame
                questions={QUESTIONS_LOGIC}
                onSolve={() =>
                    window.alert(
                        "Bravo, vous avez réussi le module de jeu ! Lors de l'escape game, on passerait à l'étape suivante."
                    )
                }
            />
        </>
    );
}
