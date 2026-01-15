'use client';

import React from 'react';

import IdePuzzle, { IdePuzzlePhases } from '@/components/puzzles/IdePuzzle';
import { PuzzleProps } from '@/components/puzzles/PuzzleRegistry';
import { CHARACTERS } from '@/data/characters';
import { DialogueLine } from '@/types/dialogue';
import { say } from '@/utils/dialogueUtils';

const SCRIPTS: Partial<Record<IdePuzzlePhases, DialogueLine[]>> = {
    intro: [
        say(
            CHARACTERS.unknown,
            'Vous êtes plutôt créatifs en MMI non ? Alors arrangez-moi tout ça.'
        ),
        say(CHARACTERS.unknown, "Si vous aimez rigoler, croyez-moi qu'on va rigoler !"),
        say(
            CHARACTERS.goguey,
            "Moi s'il y a bien un endroit où je rigole, c'est devant le tableau des memes !"
        ),
        say(
            CHARACTERS.goguey,
            "D'ailleurs je crois avoir vu de nouveaux memes affichés récemment, vous devriez aller inspecter."
        ),
    ],
    nyan: [say(CHARACTERS.paj, 'Merci. Ce chat commençait à me rendre complètement barge.')],
    h1Color: [say(CHARACTERS.fabien, "Le noir c'est bien plus lisible ! Continue comme ça.")],
    pSize: [
        say(
            CHARACTERS.beatlesBOB,
            "12 c'est ni trop grand ni trop petit ! C'est la taille parfaite !"
        ),
        say(
            CHARACTERS.fabien,
            "Merci BeatlesBOB, tu es plein de bons conseils ! J'ai réussi à t'enlever la police d'écriture affreuse... Tu n'auras pas besoin de t'en occuper !"
        ),
    ],
    bg: [
        say(
            CHARACTERS.fabien,
            "Pfiou, on respire davantage ! L'image de fond était atroce... Le fond blanc c'est classique mais efficace, bien joué !"
        ),
    ],
    zIndex: [
        say(
            CHARACTERS.fabien,
            "C'est une technique douteuse pour masquer une image, mais comme on doit vite retrouver l'antivirus, ça ira pour cette fois !"
        ),
    ],
    marquee: [say(CHARACTERS.unknown, 'Enfin le calme. Je déteste les textes qui bougent.')],
    regression: [
        say(CHARACTERS.fabien, "Mais qu'est-ce que tu fais ? C'était juste avant !"),
        say(CHARACTERS.paj, "Je ne pensais pas qu'on pouvait faire pire, mais tu as réussi."),
    ],
    refix: [say(CHARACTERS.fabien, 'Voilà. Ne touche plus à ça.')],
    win: [
        say(
            CHARACTERS.unknown,
            "Alors ? Vous avez bien rigolé ? Je l'aime bien aussi ce tableau des memes."
        ),
        say(
            CHARACTERS.unknown,
            "J'y avais laissé un symbole de paix entre MMI et MPH il y a longtemps, mais ça a été retiré depuis..."
        ),
    ],
};

export default function IDEPuzzle({ onSolve, isSolved }: PuzzleProps) {
    return <IdePuzzle isSolved={isSolved} scripts={SCRIPTS} onSolve={onSolve} />;
}
