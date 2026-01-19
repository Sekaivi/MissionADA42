'use client';
import { PuzzleProps } from '@/components/puzzles/PuzzleRegistry';
import QuizGame, { Question, QuizPuzzlePhases } from '@/components/puzzles/QuizGame';
import { CHARACTERS } from '@/data/characters';
import { DialogueLine } from '@/types/dialogue';
import { say } from '@/utils/dialogueUtils';

const QUESTIONS_MMI: Question[] = [
    {
        type: 'text',
        question: 'Quelle est la particularité de la formation M.M.I ?',
        answer: ['pluridisciplinarité', 'pluridisciplinaire'],
    },
];

const SCRIPTS: Partial<Record<QuizPuzzlePhases, DialogueLine[]>> = {
    intro: [
        say(CHARACTERS.unknown, 'Bienvenue ! HAHAHAHAHA !'),
        say(
            CHARACTERS.unknown,
            "Alors comme ça vous voulez retrouver l'antivirus et empêcher mon petit bébé de prendre le contrôle de votre cher IUT ?"
        ),
        say(
            CHARACTERS.unknown,
            'Bonne chance, on va voir si les MMI sont si intelligents que ça...'
        ),
        say(
            CHARACTERS.unknown,
            "D'ailleurs comme vous pouvez le voir, dans maintenant moins d'une heure le virus va s'activer et vous pourrez dire bye-bye à votre diplôme !"
        ),
    ],
    win: [
        say(
            CHARACTERS.unknown,
            "Bravo, maintenant que vous vous croyez tellement intelligents, passons à l'énigme suivante..."
        ),
    ],
};

export default function QuizPuzzleSimple({ isSolved, onSolve }: PuzzleProps) {
    return (
        <QuizGame
            scripts={SCRIPTS}
            questions={QUESTIONS_MMI}
            onSolve={onSolve}
            isSolved={isSolved}
        />
    );
}
