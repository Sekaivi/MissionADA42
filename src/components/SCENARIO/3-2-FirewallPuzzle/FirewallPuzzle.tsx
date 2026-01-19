'use client';

import React from 'react';

import FirewallPuzzle, { FirewallPuzzlePhases } from '@/components/puzzles/FirewallPuzzle';
import { PuzzleProps } from '@/components/puzzles/PuzzleRegistry';
import { CHARACTERS } from '@/data/characters';
import { DialogueLine } from '@/types/dialogue';
import { say } from '@/utils/dialogueUtils';

const SCRIPTS: Partial<Record<FirewallPuzzlePhases, DialogueLine[]>> = {
    intro: [
        say(CHARACTERS.paj, "Oulaaaah... Le système a l'air instable et en surchauffe !"),
        say(
            CHARACTERS.paj,
            'Essayez de réparer ça avant que toute foute le camp. Et puis, la température continue de monter.'
        ),
    ],
    win: [
        say(
            CHARACTERS.fabien,
            "OK, le pare-feu est rétabli. Il est encore plus sécurisé qu'avant."
        ),
        say(CHARACTERS.fabien, 'Mais maintenant, il faut trouver la clé USB...'),
        say(CHARACTERS.fabien, "Ah, tiens ! Notre malfaiteur semble reprendre de l'activité !"),
    ],
};

export default function FirewallPuzzleS3E2({ isSolved, onSolve }: PuzzleProps) {
    return <FirewallPuzzle scripts={SCRIPTS} onSolve={onSolve} isSolved={isSolved} />;
}
