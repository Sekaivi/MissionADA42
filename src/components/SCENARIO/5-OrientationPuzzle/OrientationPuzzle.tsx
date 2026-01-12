'use client';

import {
    OrientationPuzzle,
    OrientationPuzzleGameState,
} from '@/components/puzzles/OrientationPuzzle';
import { PuzzleProps } from '@/components/puzzles/PuzzleRegistry';
import { CHARACTERS } from '@/data/characters';
import { DialogueLine } from '@/types/dialogue';
import { say } from '@/utils/dialogueUtils';

const SCRIPTS: Partial<Record<OrientationPuzzleGameState, DialogueLine[]>> = {
    won: [
        say(
            CHARACTERS.unknown,
            "On connaît sa droite et sa gauche ? L'inverse ne m'aurait pas étonné, mais vous êtes moins stupides qu'il n'y paraît..."
        ),
    ],
};

export default function OrientationPuzzle5({ isSolved, onSolve }: PuzzleProps) {
    return <OrientationPuzzle scripts={SCRIPTS} onSolve={onSolve} isSolved={isSolved} />;
}
