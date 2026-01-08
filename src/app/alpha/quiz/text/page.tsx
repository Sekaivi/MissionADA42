'use client';
import { AlphaHeader } from '@/components/alpha/AlphaHeader';
import QuizGame, { Question } from '@/components/puzzles/QuizGame';

const QUESTIONS_POLICE: Question[] = [
    {
        type: 'text',
        question: "Je suis le cœur de l'ordinateur, mais je n'ai pas de sang. Qui suis-je ?",
        answer: 'Processeur',
    },
    {
        type: 'text',
        question: "Regardez bien ce code source. Quel est le numéro de l'erreur (Error code 404) ?",
        image: '/images/code_error.webp',
        answer: '404',
    },
];

export default function QuizTextPage() {
    return (
        <>
            <AlphaHeader
                title={"Laboratoire d'Analyse"}
                subtitle="Utilisez vos outils pour analyser les preuves."
            />
            <QuizGame
                questions={QUESTIONS_POLICE}
                onSolve={() =>
                    window.alert(
                        "Bravo, vous avez réussi le module de jeu ! Lors de l'escape game, on passerait à l'étape suivante."
                    )
                }
            />
        </>
    );
}
