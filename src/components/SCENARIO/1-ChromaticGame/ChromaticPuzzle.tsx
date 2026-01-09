'use client';

import { ChromaticPuzzle } from '@/components/puzzles/ChromaticPuzzle';
import { PuzzleProps } from '@/components/puzzles/PuzzleRegistry';
import { CHARACTERS } from '@/data/characters';
import { DialogueLine } from '@/types/dialogue';
import { say } from '@/utils/dialogueUtils';

export type ChromaticPuzzleScenarioStep = 'idle' | 'init' | 'memory' | 'scan' | 'win';

const SCRIPTS: Partial<Record<ChromaticPuzzleScenarioStep, DialogueLine[]>> = {
    init: [
        say(
            CHARACTERS.harry,
            'Bienvenue ! Je te mets au défi de retenir la séquence de couleur qui arrive et de trouver des objets autour de toi pour les scanner !'
        ),
        say(CHARACTERS.harry, "J'espère que tu n'es pas daltonien, sinon tu vas morfler...", {
            emotion: 'happy',
        }),
        say(CHARACTERS.system, "Ce n'est pas très woke dis-donc !", { side: 'right' }),
        say(CHARACTERS.harry, 'Oui bon ben, allez vas-y toi...'),
    ],
    win: [say(CHARACTERS.harry, 'Pas mal pour un nooby noob...', { emotion: 'scared' })],
};

export default function ChromaticPuzzle1({ onSolve, isSolved }: PuzzleProps) {
    return <ChromaticPuzzle scripts={SCRIPTS} onSolve={onSolve} isSolved={isSolved} />;
}
