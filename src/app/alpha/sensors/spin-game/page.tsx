'use client';

import { AlphaHeader } from '@/components/alpha/AlphaHeader';
import { SpinPuzzle } from '@/components/puzzles/SpinPuzzle';

export default function SpinPuzzlePage() {
    return (
        <>
            <AlphaHeader
                title={'Jeu de rotation'}
                subtitle={'Tournez sur vous-même pour valider la séquence de sécurité.'}
            />
            <SpinPuzzle
                onSolve={() =>
                    window.alert(
                        "Bravo, vous avez réussi le module de jeu de rotation ! Lors de l'escape game, on passerait à l'étape suivante."
                    )
                }
            />
        </>
    );
}
