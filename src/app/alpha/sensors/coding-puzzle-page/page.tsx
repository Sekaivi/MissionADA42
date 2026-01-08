'use client';

import { AlphaHeader } from '@/components/alpha/AlphaHeader';
import { CodingPuzzle } from '@/components/puzzles/CodingPuzzle';

export default function CodingPuzzlePage() {
    return (
        <>
            <AlphaHeader title={'Module de code'} />
            <CodingPuzzle
                onSolve={() =>
                    window.alert(
                        "Bravo, vous avez réussi le module de jeu ! Lors de l'escape game, on passerait à l'étape suivante."
                    )
                }
            />
        </>
    );
}
