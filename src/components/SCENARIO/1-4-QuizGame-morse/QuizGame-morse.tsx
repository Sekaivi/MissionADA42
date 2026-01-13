'use client';
import { PuzzleProps } from '@/components/puzzles/PuzzleRegistry';
import QuizGame, { Question } from '@/components/puzzles/QuizGame';
import { CHARACTERS } from '@/data/characters';
import { DialogueLine } from '@/types/dialogue';
import { say } from '@/utils/dialogueUtils';

const QUESTIONS_MMI: Question[] = [
    {
        type: 'text',
        question: '',
        answer: 'SALLE115',
        image: '/images/morse_etape1_enigme4.png',
    },
];

export type QCMScenarioStep = 'idle' | 'init' | 'memory' | 'scan' | 'win';

const SCRIPTS: Partial<Record<QCMScenarioStep, DialogueLine[]>> = {
    init: [say(CHARACTERS.unknown, 'Décodez-moi ça !')],
    win: [
        say(
            CHARACTERS.unknown,
            "Je vous ai peut-être sous-estimés... Quoi qu'il en soit, rendez-vous dans la salle que vous avez décodée, et on verra si vous êtes si forts que vous le prétendez."
        ),
    ],
};

export default function QuizGameMorse({ isSolved, onSolve }: PuzzleProps) {
    return (
        <QuizGame
            scripts={SCRIPTS}
            questions={QUESTIONS_MMI}
            onSolve={onSolve}
            isSolved={isSolved}
        />
    );
}
