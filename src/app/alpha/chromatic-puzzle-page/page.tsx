'use client';

import { AlphaHeader } from '@/components/alpha/AlphaHeader';
import { ChromaticPuzzle } from '@/components/puzzles/ChromaticPuzzle';

export default function ChromaticPuzzlePage() {
    return (
        <>
            <AlphaHeader title={'Module de Sécurité'} />
            <ChromaticPuzzle
                onSolve={() =>
                    window.alert(
                        "Bravo, vous avez réussi le module ! Lors de l'escape game, on passerait à l'étape suivante."
                    )
                }
            />
        </>
    );
}
