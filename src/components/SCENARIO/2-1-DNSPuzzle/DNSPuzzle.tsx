'use client';

import { PuzzleProps } from '@/components/puzzles/PuzzleRegistry';
import QuizGame, { Question, QuizScenarioStep } from '@/components/puzzles/QuizGame';
import { CHARACTERS } from '@/data/characters';
import { DialogueLine } from '@/types/dialogue';
import { say } from '@/utils/dialogueUtils';

const QUESTIONS_ADMIN: Question[] = [
    {
        type: 'number',
        question: 'Veuillez entrer le mot de passe administrateur',
        answer: 6092,
        showLegend: false,
    },
];

const SCRIPTS: Partial<Record<QuizScenarioStep, DialogueLine[]>> = {
    init: [
        say(
            CHARACTERS.unknown,
            'Oups, je crois que mon virus a déjà créé un petit problème DNS. Dommage pour vous ^^'
        ),
        say(
            CHARACTERS.unknown,
            'Vous êtes toujours ingrats avec le dev mais il fait partie intégrante de MMI alors remettez moi-ça en route et prouvez-moi que vous méritez votre place dans cette super formation !'
        ),
    ],
};

export default function DNSPuzzle({ isSolved, onSolve }: PuzzleProps) {
    return (
        <QuizGame
            scripts={SCRIPTS}
            questions={QUESTIONS_ADMIN}
            onSolve={onSolve}
            isSolved={isSolved}
        />
    );
}
