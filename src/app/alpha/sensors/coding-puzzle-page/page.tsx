'use client';

import { AlphaHeader } from '@/components/alpha/AlphaHeader';
import { CodingPuzzle, CodingPuzzleGameState } from '@/components/puzzles/CodingPuzzle';
import { CHARACTERS } from '@/data/characters';
import { DialogueLine } from '@/types/dialogue';
import { say } from '@/utils/dialogueUtils';

const SCRIPTS: Partial<Record<CodingPuzzleGameState, DialogueLine[]>> = {
    win: [
        say(
            CHARACTERS.harry,
            'Vous voyez le dev c’est pas si dur, vous faites les acteurs mais vous êtes juste plus flemmards encore que vous n’êtes bêtes…'
        ),
        say(
            CHARACTERS.harry,
            'En tout cas c’est bien vous avez réussi cette étape mais n’oubliez pas qu’il vous reste peu de temps avant que MMI ne soit anéanti par mon petit virus !'
        ),
        say(
            CHARACTERS.harry,
            'Je parie que n’importe lequel d’entre vous serait incapable de coder un virus pareil même après la 3e année, alors bonne chance pour retrouver la clé USB !'
        ),
    ],
};

export default function CodingPuzzlePage() {
    return (
        <>
            <AlphaHeader title={'Module de code'} />
            <CodingPuzzle
                scripts={SCRIPTS}
                onSolve={() =>
                    window.alert(
                        "Bravo, vous avez réussi le module de jeu ! Lors de l'escape game, on passerait à l'étape suivante."
                    )
                }
            />
        </>
    );
}
