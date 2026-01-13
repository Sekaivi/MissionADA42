'use client';

import { AlphaHeader } from '@/components/alpha/AlphaHeader';
import { SpinPuzzle, SpinPuzzlePhases } from '@/components/puzzles/SpinPuzzle';
import { CHARACTERS } from '@/data/characters';
import { DialogueLine } from '@/types/dialogue';
import { say } from '@/utils/dialogueUtils';

const SCRIPTS: Partial<Record<SpinPuzzlePhases, DialogueLine[]>> = {
    win: [
        say(
            CHARACTERS.harry,
            'Haha, vous êtes si ridicules… Allez je m’adapte à vous, voici une petite énigme pour élève de CP.'
        ),
    ],
};

export default function SpinPuzzlePage() {
    return (
        <>
            <AlphaHeader
                title={'Jeu de rotation'}
                subtitle={'Tournez sur vous-même pour valider la séquence de sécurité.'}
            />
            <SpinPuzzle
                scripts={SCRIPTS}
                onSolve={() =>
                    window.alert(
                        "Bravo, vous avez réussi le module de jeu de rotation ! Lors de l'escape game, on passerait à l'étape suivante."
                    )
                }
            />
        </>
    );
}
