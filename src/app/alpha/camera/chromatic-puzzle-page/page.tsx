'use client';

import { AlphaHeader } from '@/components/alpha/AlphaHeader';
import { ChromaticPuzzle, ChromaticPuzzleScenarioStep } from '@/components/puzzles/ChromaticPuzzle';
import { CHARACTERS } from '@/data/characters';
import { DialogueLine } from '@/types/dialogue';
import { say } from '@/utils/dialogueUtils';

const SCRIPTS: Partial<Record<ChromaticPuzzleScenarioStep, DialogueLine[]>> = {
    intro: [
        say(
            CHARACTERS.harry,
            'Bienvenue ! Je te mets au défi de retenir la séquence de couleur qui arrive et de trouver des objets autour de toi pour les scanner !'
        ),
        say(CHARACTERS.harry, "J'espère que tu n'es pas daltonien, sinon tu vas morfler...", {
            emotion: 'happy',
        }),
        say(CHARACTERS.system, "Ce n'est pas très woke dis-donc !", { side: 'right' }),
        say(CHARACTERS.harry, 'Oui bon ben, allez vas-y toi...'),
    ],
    win: [say(CHARACTERS.harry, 'Pas mal pour un nooby noob...', { emotion: 'scared' })],
};

export default function ChromaticPuzzlePage() {
    return (
        <>
            <AlphaHeader title={'Module de Sécurité'} />
            <ChromaticPuzzle
                scripts={SCRIPTS}
                onSolve={() =>
                    window.alert(
                        "Bravo, vous avez réussi le module de jeu ! Lors de l'escape game, on passerait à l'étape suivante."
                    )
                }
            />
        </>
    );
}
