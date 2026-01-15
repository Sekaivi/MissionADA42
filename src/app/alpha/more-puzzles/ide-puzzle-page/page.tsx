'use client';
import { AlphaHeader } from '@/components/alpha/AlphaHeader';
import IdePuzzle, { IdePuzzlePhases } from '@/components/puzzles/IdePuzzle';
import { CHARACTERS } from '@/data/characters';
import { DialogueLine } from '@/types/dialogue';
import { say } from '@/utils/dialogueUtils';

const SCRIPTS: Partial<Record<IdePuzzlePhases, DialogueLine[]>> = {
    intro: [
        say(
            CHARACTERS.fabien,
            'Ce site est une catastrophe. Répare la CSS avant que mes yeux ne saignent.'
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
    win: [say(CHARACTERS.fabien, "Beau travail. C'est... acceptable. Projet déployé.")],
};

export default function ChestCodePuzzlePage() {
    return (
        <>
            <AlphaHeader title={'IDE'} />
            <IdePuzzle
                isSolved={false}
                scripts={SCRIPTS}
                onSolve={() =>
                    window.alert(
                        "Bravo, vous avez réussi le module de jeu IDE ! Lors de l'escape game, on passerait à l'étape suivante."
                    )
                }
            />
        </>
    );
}
