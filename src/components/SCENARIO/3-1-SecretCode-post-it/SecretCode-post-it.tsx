'use client';

import { PuzzleProps } from '@/components/puzzles/PuzzleRegistry';
import QuizGame, { Question, QuizPuzzlePhases } from '@/components/puzzles/QuizGame';
import { CHARACTERS } from '@/data/characters';
import { DialogueLine } from '@/types/dialogue';
import { say } from '@/utils/dialogueUtils';

const QUESTIONS_ADMIN: Question[] = [
    {
        type: 'number',
        question: 'Veuillez entrer le mot de passe administrateur',
        answer: 6092,
    },
];

const SCRIPTS: Partial<Record<QuizPuzzlePhases, DialogueLine[]>> = {
    intro: [
        say(
            CHARACTERS.paj,
            "Merde ! On dirait que son puzzle s'arrête ici, décidément il aura décidé de nous faire chier jusqu'au bout celui-là..."
        ),
        say(CHARACTERS.goguey, '-de nous embêter il voulait dire...'),
        say(
            CHARACTERS.goguey,
            'Bref, on va devoir improviser pour retrouver la clé. Commencez par inspecter la pièce, avec un peu de chance vous la trouverez peut-être.'
        ),
        say(
            CHARACTERS.goguey,
            "Et puis, s'il vous a amené ici ce n'est sûrement pas pour rien. Si vous trouvez quoi que ce soit, faites-nous signe."
        ),
    ],
    win: [
        say(CHARACTERS.goguey, "On dirait une clé d'accès au pare-feu, je vais essayer."),
        say(
            CHARACTERS.goguey,
            "Super, ça a marché ! Bon, le pare-feu est pas mal endommagé, si on veut maximiser nos chances de faire fonctionner l'antivirus plus tard, il faut commencer par le stabiliser à nouveau."
        ),
    ],
};

export default function SecretCodePostIt({ isSolved, onSolve }: PuzzleProps) {
    return (
        <QuizGame
            scripts={SCRIPTS}
            questions={QUESTIONS_ADMIN}
            onSolve={onSolve}
            isSolved={isSolved}
        />
    );
}
