'use client';

import { AlphaHeader } from '@/components/alpha/AlphaHeader';
import FirewallPuzzle, { FirewallPuzzlePhases } from '@/components/puzzles/FirewallPuzzle';
import { CHARACTERS } from '@/data/characters';
import { DialogueLine } from '@/types/dialogue';
import { say } from '@/utils/dialogueUtils';

const SCRIPTS: Partial<Record<FirewallPuzzlePhases, DialogueLine[]>> = {
    intro: [
        say(CHARACTERS.fabien, 'ça chauffe', {
            emotion: 'neutral',
        }),
    ],
    win: [say(CHARACTERS.fabien, 'bien froid', { emotion: 'happy' })],
};

export default function ChestCodePuzzlePage() {
    return (
        <>
            <AlphaHeader
                title="Pare-feu : Surchauffe"
                subtitle="Refroidissement d'urgence requis"
            />

            <FirewallPuzzle
                scripts={SCRIPTS}
                onSolve={() =>
                    window.alert(
                        "Bravo, vous avez réussi le module de jeu du mot du pare-feu ! Lors de l'escape game, on passerait à l'étape suivante."
                    )
                }
            />
        </>
    );
}
