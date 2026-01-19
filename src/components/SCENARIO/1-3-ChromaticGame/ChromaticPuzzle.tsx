'use client';

import { ChromaticPuzzle, ChromaticPuzzlePhases } from '@/components/puzzles/ChromaticPuzzle';
import { PuzzleProps } from '@/components/puzzles/PuzzleRegistry';
import { CHARACTERS } from '@/data/characters';
import { DialogueLine } from '@/types/dialogue';
import { PRESETS } from '@/utils/colorPresets';
import { say } from '@/utils/dialogueUtils';

const puzzleConfig = {
    sequence: [PRESETS.BLANC],
};

const SCRIPTS: Partial<Record<ChromaticPuzzlePhases, DialogueLine[]>> = {
    intro: [
        say(
            CHARACTERS.goguey,
            'Concentre-toi, une séquence de couleurs va apparaître, mémorise-la et scanne les couleurs grâce à tes modules.'
        ),
    ],
    win: [
        say(CHARACTERS.unknown, "C'est bien, vous grandissez vite à ce que je vois !"),
        say(CHARACTERS.unknown, 'Bon maintenant, on va voir ce dont vous êtes vraiment capables.'),
    ],
};

export default function ChromaticPuzzleS1E3({ onSolve, isSolved, lastModuleAction }: PuzzleProps) {
    return (
        <ChromaticPuzzle
            scripts={SCRIPTS}
            onSolve={onSolve}
            isSolved={isSolved}
            puzzleConfig={puzzleConfig}
            lastModuleAction={lastModuleAction}
        />
    );
}
