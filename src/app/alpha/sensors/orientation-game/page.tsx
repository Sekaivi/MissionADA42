'use client';

import { AlphaHeader } from '@/components/alpha/AlphaHeader';
import { OrientationPuzzle } from '@/components/puzzles/OrientationPuzzle';

export default function OrientationPuzzlePage() {
    return (
        <>
            <AlphaHeader
                title={"Jeu d'inclinaison"}
                subtitle={'Orientez votre appareil pour valider la séquence de sécurité.'}
            />
            <OrientationPuzzle
                onSolve={() =>
                    window.alert(
                        "Bravo, vous avez réussi le module de jeu d'orientation ! Lors de l'escape game, on passerait à l'étape suivante."
                    )
                }
            />
        </>
    );
}
