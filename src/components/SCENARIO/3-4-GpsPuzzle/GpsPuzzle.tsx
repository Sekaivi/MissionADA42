'use client';

import GpsGame, { GpsPuzzlePhases } from '@/components/puzzles/GpsGame';
import { PuzzleProps } from '@/components/puzzles/PuzzleRegistry';
import { CHARACTERS } from '@/data/characters';
import { DialogueLine } from '@/types/dialogue';
import { say } from '@/utils/dialogueUtils';

const SCRIPTS: Partial<Record<GpsPuzzlePhases, DialogueLine[]>> = {
    intro: [
        say(
            CHARACTERS.fabien,
            'On a réussi à localiser d’où provient le signal de son puzzle, j’imagine que la suite de son épreuve se passe là-bas.'
        ),
        say(
            CHARACTERS.fabien,
            'Allez encore un peu de détermination et je réfléchirai à vous mettre une note bonus en Intégration.'
        ),
        say(
            CHARACTERS.paj,
            "J'aurais jamais cru dire ça mais pour une fois le petit GPS qu'on vous a préparé ne marche que sur iOS..."
        ),
        say(
            CHARACTERS.paj,
            "Donc si quelqu'un est sur un téléphone avec iOS, suivez-le ! Et pour le reste..."
        ),
        say(CHARACTERS.paj, '... Et bah démerdez-vous.'),
    ],
    win: [
        say(
            CHARACTERS.fabien,
            "Vous êtes assez près maintenant, c'est bien de la salle 132 dont provient le signal."
        ),
    ],
};

export default function GpsPuzzle({ isSolved, onSolve }: PuzzleProps) {
    return <GpsGame scripts={SCRIPTS} onSolve={onSolve} isSolved={isSolved} />;
}
