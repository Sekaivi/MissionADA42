'use client';
import { PuzzleProps } from '@/components/puzzles/PuzzleRegistry';
import QuizGame, { Question, QuizPuzzlePhases } from '@/components/puzzles/QuizGame';
import { CHARACTERS } from '@/data/characters';
import { DialogueLine } from '@/types/dialogue';
import { say } from '@/utils/dialogueUtils';

const QUESTIONS_MMI: Question[] = [
    {
        type: 'text',
        question: "Renseignez le code de l'antivirus.",
        answer: ['a6zE7RtfM2-6-9urluberlu/*Y'],
    },
];

const SCRIPTS: Partial<Record<QuizPuzzlePhases, DialogueLine[]>> = {
    intro: [
        say(CHARACTERS.paj, "C'est parti mon kiki ! Entrez le code pour activer l'antivirus !"),
    ],
};

export default function CoffreFin({ isSolved, onSolve }: PuzzleProps) {
    return (
        <QuizGame
            scripts={SCRIPTS}
            questions={QUESTIONS_MMI}
            onSolve={onSolve}
            isSolved={isSolved}
        />
    );
}
