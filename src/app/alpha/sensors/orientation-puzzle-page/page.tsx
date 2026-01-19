'use client';

import { AlphaHeader } from '@/components/alpha/AlphaHeader';
import { OrientationPuzzle, OrientationPuzzlePhases } from '@/components/puzzles/OrientationPuzzle';
import { CHARACTERS } from '@/data/characters';
import { DialogueLine } from '@/types/dialogue';
import { say } from '@/utils/dialogueUtils';

const SCRIPTS: Partial<Record<OrientationPuzzlePhases, DialogueLine[]>> = {
    win: [
        say(
            CHARACTERS.harry,
            "Vous voyez le dev c'est pas si dur, vous faites les acteurs mais vous êtes juste plus flemmards encore que vous n'êtes bêtes..."
        ),
        say(
            CHARACTERS.harry,
            "En tout cas c'est bien vous avez réussi cette étape mais n'oubliez pas qu'il vous reste peu de temps avant que MMI ne soit anéanti par mon petit virus !"
        ),
        say(
            CHARACTERS.harry,
            "Je parie que n'importe lequel d'entre vous serait incapable de coder un virus pareil même après la 3e année, alors bonne chance pour retrouver la clé USB !"
        ),
    ],
};

export default function OrientationPuzzlePage() {
    return (
        <>
            <AlphaHeader
                title={"Jeu d'inclinaison"}
                subtitle={'Orientez votre appareil pour valider la séquence de sécurité.'}
            />
            <OrientationPuzzle
                scripts={SCRIPTS}
                onSolve={() =>
                    window.alert(
                        "Bravo, vous avez réussi le module de jeu d'orientation ! Lors de l'escape game, on passerait à l'étape suivante."
                    )
                }
            />
        </>
    );
}
