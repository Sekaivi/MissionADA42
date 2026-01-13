'use client';

import { AlphaHeader } from '@/components/alpha/AlphaHeader';
import ChestCodePuzzle, { ChestCodePuzzlePhases } from '@/components/puzzles/ChestCodePuzzle';
import { CHARACTERS } from '@/data/characters';
import { DialogueLine } from '@/types/dialogue';
import { say } from '@/utils/dialogueUtils';

const CODE = [4, 2, 7, 1];

const SCRIPTS: Partial<Record<ChestCodePuzzlePhases, DialogueLine[]>> = {
    intro: [
        say(CHARACTERS.fabien, 'Le système est verrouillé. Il faut les 4 clefs de chiffrement.', {
            emotion: 'neutral',
        }),
        say(
            CHARACTERS.fabien,
            'Chaque module te donnera un chiffre. Trouve les 4 et entre-les en bas.',
            { emotion: 'happy' }
        ),
    ],

    solved_quiz: [
        say(CHARACTERS.fabien, 'Ah, le protocole HTTPS... Un classique.', { emotion: 'happy' }),
        say(CHARACTERS.system, 'Fragment de code récupéré. Continue comme ça !', { side: 'right' }),
    ],
    solved_cultura: [
        say(CHARACTERS.harry, "Sérieusement ? Un post-it collé sur l'écran ?", {
            emotion: 'scared',
        }),
        say(CHARACTERS.harry, "C'est la faille de sécurité la plus vieille du monde...", {
            emotion: 'neutral',
        }),
    ],
    solved_maze: [
        say(CHARACTERS.system, "Tu as traversé le pare-feu comme si c'était du beurre.", {
            emotion: 'happy',
        }),
    ],
    solved_password: [
        say(
            CHARACTERS.fabien,
            "Mot de passe craqué. On dirait que '123456' n'est plus à la mode.",
            {
                emotion: 'happy',
            }
        ),
    ],

    win: [
        say(CHARACTERS.system, 'Accès autorisé. Félicitations.', { side: 'right' }),
        say(CHARACTERS.fabien, 'Et voilà le travail ! On passe à la suite.', { emotion: 'happy' }),
    ],
};

export default function ChestCodePuzzlePage() {
    return (
        <>
            <AlphaHeader title={'Mot de passe'} />
            <ChestCodePuzzle
                solution={CODE}
                scripts={SCRIPTS}
                onSolve={() =>
                    window.alert(
                        "Bravo, vous avez réussi le module de jeu du mot de passe de coffre ! Lors de l'escape game, on passerait à l'étape suivante."
                    )
                }
            />
        </>
    );
}
