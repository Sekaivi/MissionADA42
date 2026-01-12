'use client';
import { AlphaHeader } from '@/components/alpha/AlphaHeader';
import QuizGame, { Question, QuizScenarioStep } from '@/components/puzzles/QuizGame';
import { CHARACTERS } from '@/data/characters';
import { DialogueLine } from '@/types/dialogue';
import { say } from '@/utils/dialogueUtils';

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

const SCRIPTS: Partial<Record<QuizScenarioStep, DialogueLine[]>> = {
    init: [say(CHARACTERS.fabien, 'Répondez instinctivement à ces quelques questions.')],
};

export default function QuizTextPage() {
    return (
        <>
            <AlphaHeader title={'Réponses textuelles'} />
            <QuizGame
                scripts={SCRIPTS}
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
