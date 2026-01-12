'use client';

import { CodingPuzzle, CodingPuzzleGameState } from '@/components/puzzles/CodingPuzzle';
import { PuzzleProps } from '@/components/puzzles/PuzzleRegistry';
import { CHARACTERS } from '@/data/characters';
import { DialogueLine } from '@/types/dialogue';
import { say } from '@/utils/dialogueUtils';

const SCRIPTS: Partial<Record<CodingPuzzleGameState, DialogueLine[]>> = {
    intro: [
        say(
            CHARACTERS.unknown,
            'Alors, vous voulez plutôt y aller en mode facile, moyen, ou difficile ?'
        ),
    ],
    win: [
        say(
            CHARACTERS.unknown,
            'Vous voyez le dev c’est pas si dur, vous faites les acteurs mais vous êtes juste encore plus flemmards que vous n’êtes bêtes !'
        ),
        say(
            CHARACTERS.unknown,
            'En tout cas bravo, vous avez réussi cette étape. Mais n’oubliez pas qu’il vous reste peu de temps avant que MMI ne soit anéanti par mon magnifique virus !'
        ),
        say(
            CHARACTERS.unknown,
            'Je parie que n’importe lequel d’entre vous serait incapable de coder un virus pareil même après la 3e année, alors bonne chance pour retrouver la clé USB !'
        ),
        say(CHARACTERS.paj, 'Vous êtes meilleurs qu’en hébergement...'),
        say(
            CHARACTERS.paj,
            'Bon, c’est une bonne chose de faite, on a évité de peu la catastrophe. Maintenant on va rétablir la couche de sécurité primaire...'
        ),
    ],
};

export default function CodingPuzzle4({ onSolve, isSolved }: PuzzleProps) {
    return <CodingPuzzle scripts={SCRIPTS} onSolve={onSolve} isSolved={isSolved} />;
}
