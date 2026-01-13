'use client';

import { OrientationPuzzle, OrientationPuzzlePhases } from '@/components/puzzles/OrientationPuzzle';
import { PuzzleProps } from '@/components/puzzles/PuzzleRegistry';
import { CHARACTERS } from '@/data/characters';
import { DialogueLine } from '@/types/dialogue';
import { say } from '@/utils/dialogueUtils';

const SCRIPTS: Partial<Record<OrientationPuzzlePhases, DialogueLine[]>> = {
    win: [
        say(
            CHARACTERS.unknown,
            'HAHAHA ! Je pensais pas que vous seriez si stupides, vous êtes au courant que je suis déjà passé au-delà de votre pare-feu et que je suis dans votre système ?'
        ),
        say(
            CHARACTERS.unknown,
            'Bref, comme vous êtes mignons avec votre super pare-feu je veux bien vous donner la suite des énigmes, mais il faudra venir la chercher.'
        ),
        say(
            CHARACTERS.unknown,
            'Dans tous les cas vu votre niveau catastrophique on peut déjà dire adieu à MMI... Bye-bye !'
        ),
    ],
};

export default function OrientationPuzzleS3E3({ isSolved, onSolve }: PuzzleProps) {
    return <OrientationPuzzle scripts={SCRIPTS} onSolve={onSolve} isSolved={isSolved} />;
}
