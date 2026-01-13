'use client';

import { AlphaHeader } from '@/components/alpha/AlphaHeader';
import { PasswordPuzzle, PasswordPuzzlePhases } from '@/components/puzzles/PasswordPuzzle';
import { CHARACTERS } from '@/data/characters';
import { DialogueLine } from '@/types/dialogue';
import { say } from '@/utils/dialogueUtils';

const SCRIPTS: Partial<Record<PasswordPuzzlePhases, DialogueLine[]>> = {
    intro: [say(CHARACTERS.fabien, 'Here I am')],
    win: [say(CHARACTERS.fabien, 'Rock you like a hurricane')],
};

export default function ChromaticPuzzlePage() {
    return (
        <>
            <AlphaHeader title={'Mot de passe'} />
            <PasswordPuzzle
                scripts={SCRIPTS}
                onSolve={() =>
                    window.alert(
                        "Bravo, vous avez réussi le module de jeu du mot de passe ! Lors de l'escape game, on passerait à l'étape suivante."
                    )
                }
            />
        </>
    );
}
