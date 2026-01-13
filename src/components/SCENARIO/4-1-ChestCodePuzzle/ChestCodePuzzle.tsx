'use client';

import ChestCodePuzzle, { ChestCodeScenarioStep } from '@/components/puzzles/ChestCodePuzzle';
import { PuzzleProps } from '@/components/puzzles/PuzzleRegistry';
import { CHARACTERS } from '@/data/characters';
import { DialogueLine } from '@/types/dialogue';
import { say } from '@/utils/dialogueUtils';

const CODE = [4, 2, 7, 1];

const SCRIPTS: Partial<Record<ChestCodeScenarioStep, DialogueLine[]>> = {
    intro: [
        say(CHARACTERS.fabien, 'Le système est verrouillé. Il faut les 4 clés de chiffrement.', {
            emotion: 'neutral',
        }),
        say(
            CHARACTERS.fabien,
            'Chaque module te donnera un chiffre. Trouve les 4 et entre-les en bas.',
            { emotion: 'happy' }
        ),
    ],

    solved_quiz: [
        say(CHARACTERS.paj, 'Ah, le protocole HTTPS... Un classique.', { emotion: 'happy' }),
    ],
    solved_cultura: [
        say(CHARACTERS.unknown, "Sérieusement ? Un post-it collé sur l'écran ?", {
            emotion: 'scared',
        }),
        say(CHARACTERS.unknown, "C'est la faille de sécurité la plus vieille du monde...", {
            emotion: 'neutral',
        }),
    ],
    solved_maze: [
        say(CHARACTERS.paj, "Tu as traversé le pare-feu comme si c'était du beurre.", {
            emotion: 'happy',
        }),
    ],
    solved_password: [
        say(
            CHARACTERS.goguey,
            "Mot de passe craqué. On dirait que '123456' n'est plus à la mode.",
            {
                emotion: 'happy',
            }
        ),
    ],

    win: [
        say(CHARACTERS.paj, 'Accès autorisé. Félicitations.', { side: 'right' }),
        say(CHARACTERS.fabien, 'Et voilà le travail ! On passe à la suite.', { emotion: 'happy' }),
    ],
};

export default function ChestCodePuzzleS4E1({ isSolved, onSolve }: PuzzleProps) {
    return (
        <ChestCodePuzzle solution={CODE} scripts={SCRIPTS} onSolve={onSolve} isSolved={isSolved} />
    );
}
