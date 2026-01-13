'use client';
import { PuzzleProps } from '@/components/puzzles/PuzzleRegistry';
import { SpinPuzzle, SpinPuzzleScenarioStep } from '@/components/puzzles/SpinPuzzle';
import { CHARACTERS } from '@/data/characters';
import { DialogueLine } from '@/types/dialogue';
import { say } from '@/utils/dialogueUtils';

const SCRIPTS: Partial<Record<SpinPuzzleScenarioStep, DialogueLine[]>> = {
    won: [
        say(
            CHARACTERS.unknown,
            'Haha, vous êtes si ridicules... Allez je m’adapte à vous, la prochaine énigme sera ajustée à votre bassesse.'
        ),
    ],
};

export default function SpinPuzzleS1E2({ onSolve, isSolved }: PuzzleProps) {
    return <SpinPuzzle scripts={SCRIPTS} onSolve={onSolve} isSolved={isSolved} />;
}
