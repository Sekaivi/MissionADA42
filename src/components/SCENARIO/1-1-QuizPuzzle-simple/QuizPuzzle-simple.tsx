'use client';
import { PuzzleProps } from '@/components/puzzles/PuzzleRegistry';
import QuizGame, { Question } from '@/components/puzzles/QuizGame';
import { CHARACTERS } from '@/data/characters';
import { DialogueLine } from '@/types/dialogue';
import { say } from '@/utils/dialogueUtils';

const QUESTIONS_MMI: Question[] = [
    {
        type: 'text',
        question: 'Quelle est la particularité de la formation M.M.I ?',
        answer: ['pluridisciplinarité', 'pluridisciplinaire'],
    },
];

export type QCMScenarioStep = 'idle' | 'init' | 'memory' | 'scan' | 'win';

const SCRIPTS: Partial<Record<QCMScenarioStep, DialogueLine[]>> = {
    init: [
        say(
            CHARACTERS.fabien,
            'Ah, bonjour à tous, ça fait plaisir de vous voir mobilisés et prêts à aider l’IUT.'
        ),
        say(
            CHARACTERS.fabien,
            'Bon les élèves de 3e année vous ont déjà expliqué la situation j’imagine, donc faisons court.'
        ),
        say(
            CHARACTERS.fabien,
            'Un élève vient de développer un virus qui menace toutes les machines, alors M. Jacquot a créé un antivirus.'
        ),
        say(
            CHARACTERS.fabien,
            "Le problème, c'est que la clé USB sur laquelle il était stocké a été subtilisée par ce mystérieux élève..."
        ),
        say(
            CHARACTERS.fabien,
            'Comme par hasard, cet évènement est survenu juste après une SAE de dev !'
        ),
        say(
            CHARACTERS.fabien,
            'On a reçu un message du malfaiteur et il nous a laissé des puzzles pour retrouver notre précieuse clé USB !'
        ),
        say(
            CHARACTERS.fabien,
            'Il a menacé d’activer immédiatement le virus si ce puzzle n’était pas fait exclusivement par des premières années.'
        ),
        say(
            CHARACTERS.fabien,
            'Vous avez donc été choisis pour trouver cette clé, l’activer et sauver l’IUT !'
        ),
        say(
            CHARACTERS.fabien,
            "D’ailleurs, même si ce n'est pas la priorité ultime, il faudrait aussi trouver l’identité de l’élève qui a créé ce virus..."
        ),
        say(
            CHARACTERS.paj,
            'Si on l’attrape, il subira les conséquences de ses actes, et je m’en assurerai personnellement.',
            {}
        ),

        // rajouter goguey quand l'interface debug sera implémentée

        say(CHARACTERS.unknown, 'Bienvenue ! HAHAHAHAHA !'),
        say(
            CHARACTERS.unknown,
            'Alors comme ça vous voulez retrouver l’antivirus et empêcher mon petit bébé de prendre le contrôle de votre cher IUT ?'
        ),
        say(
            CHARACTERS.unknown,
            'Bonne chance, on va voir si les MMI sont si intelligents que ça...'
        ),
        say(
            CHARACTERS.unknown,
            'D’ailleurs comme vous pouvez le voir, dans maintenant moins d’une heure le virus va s’activer et vous pourrez dire bye-bye à votre diplôme !'
        ),
    ],
    win: [
        say(
            CHARACTERS.unknown,
            'Bravo, maintenant que vous vous croyez tellement intelligents, passons à l’énigme suivante...'
        ),
    ],
};

export default function QuizPuzzleSimple({ isSolved, onSolve }: PuzzleProps) {
    return (
        <QuizGame
            scripts={SCRIPTS}
            questions={QUESTIONS_MMI}
            onSolve={onSolve}
            isSolved={isSolved}
        />
    );
}
