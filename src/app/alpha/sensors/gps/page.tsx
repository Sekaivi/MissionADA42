'use client';

import { AlphaHeader } from '@/components/alpha/AlphaHeader';
import GpsPuzzle from '@/components/puzzles/GpsPuzzle';

export default function AlphaGPSPage() {
    return (
        <>
            <AlphaHeader title="GPS Boussole" subtitle="Navigation directionnelle vers une cible" />

            <GpsPuzzle
                onSolve={() =>
                    window.alert(
                        "Vous êtes arrivés assez proche du signal qui vient de la salle 109. Lors de l'escape game, on passerait à l'étape suivante."
                    )
                }
            />
        </>
    );
}
