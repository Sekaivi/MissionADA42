'use client';

import { AlphaHeader } from '@/components/alpha/AlphaHeader';
import GpsGame, { GpsPuzzlePhases } from '@/components/puzzles/GpsGame';
import { CHARACTERS } from '@/data/characters';
import { DialogueLine } from '@/types/dialogue';
import { say } from '@/utils/dialogueUtils';

const puzzleConfig = {
    lat: 45.20372213834273,
    long: 5.701471833458243,
};

const SCRIPTS: Partial<Record<GpsPuzzlePhases, DialogueLine[]>> = {
    intro: [
        say(
            CHARACTERS.fabien,
            "On a réussi à localiser d'où provient le signal de son puzzle, j'imagine que la suite de son épreuve se passe là-bas."
        ),
        say(
            CHARACTERS.fabien,
            'Allez encore un peu de détermination et je réfléchirai à vous mettre une note bonus en Intégration.'
        ),
        say(
            CHARACTERS.paj,
            "J'aurais jamais cru dire ça mais pour une fois le petit GPS qu'on vous a préparé ne marche que sur iOS..."
        ),
        say(CHARACTERS.paj, 'Bon démerdez-vous pour suivre le signal !'),
    ],
    win: [
        say(
            CHARACTERS.fabien,
            "Vous êtes assez près maintenant, c'est bien de la salle 132 dont provient le signal."
        ),
    ],
};

export default function AlphaGPSPage() {
    return (
        <>
            <AlphaHeader title="GPS Boussole" subtitle="Navigation directionnelle vers une cible" />

            <GpsGame
                puzzleConfig={puzzleConfig}
                scripts={SCRIPTS}
                onSolve={() =>
                    window.alert(
                        "Vous êtes arrivés assez proche du signal qui vient de la salle 109. Lors de l'escape game, on passerait à l'étape suivante."
                    )
                }
            />
        </>
    );
}
