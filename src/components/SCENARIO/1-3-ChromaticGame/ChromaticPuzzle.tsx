'use client';

import { ChromaticPuzzle } from '@/components/puzzles/ChromaticPuzzle';
import { PuzzleProps } from '@/components/puzzles/PuzzleRegistry';
import { CHARACTERS } from '@/data/characters';
import { DialogueLine } from '@/types/dialogue';
import { say } from '@/utils/dialogueUtils';

export type ChromaticPuzzleScenarioStep = 'idle' | 'init' | 'memory' | 'scan' | 'win';

const SCRIPTS: Partial<Record<ChromaticPuzzleScenarioStep, DialogueLine[]>> = {
    win: [
        say(CHARACTERS.unknown, "C'est bien, vous grandissez vite à ce que je vois !"),
        say(CHARACTERS.unknown, 'Bon maintenant, on va voir ce dont vous êtes vraiment capables.'),
    ],
};

export default function ChromaticPuzzleS1E3ChromaticPuzzleS1E3({ onSolve, isSolved }: PuzzleProps) {
    return <ChromaticPuzzle scripts={SCRIPTS} onSolve={onSolve} isSolved={isSolved} />;
}
