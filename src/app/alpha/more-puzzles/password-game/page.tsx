'use client';

import { AlphaHeader } from '@/components/alpha/AlphaHeader';
import { PasswordPuzzle } from '@/components/puzzles/PasswordPuzzle';

export default function ChromaticPuzzlePage() {
    return (
        <>
            <AlphaHeader title={'Mot de passe'} />
            <PasswordPuzzle
                onSolve={() =>
                    window.alert(
                        "Bravo, vous avez réussi le module de jeu du mot de passe ! Lors de l'escape game, on passerait à l'étape suivante."
                    )
                }
            />
        </>
    );
}
