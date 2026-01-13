'use client';
import { AlphaHeader } from '@/components/alpha/AlphaHeader';
import QuizGame, { Question, QuizPuzzlePhases } from '@/components/puzzles/QuizGame';
import { CHARACTERS } from '@/data/characters';
import { DialogueLine } from '@/types/dialogue';
import { say } from '@/utils/dialogueUtils';

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

const SCRIPTS: Partial<Record<QuizPuzzlePhases, DialogueLine[]>> = {
    intro: [say(CHARACTERS.fabien, 'Répondez instinctivement à ces quelques questions.')],
};

export default function QuizTrueFalsePage() {
    return (
        <>
            <AlphaHeader title={'Test de logique'} />
            <QuizGame
                scripts={SCRIPTS}
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
