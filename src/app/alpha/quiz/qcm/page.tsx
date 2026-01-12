'use client';
import { AlphaHeader } from '@/components/alpha/AlphaHeader';
import QuizGame, { Question } from '@/components/puzzles/QuizGame';
import { CHARACTERS } from '@/data/characters';
import { DialogueLine } from '@/types/dialogue';
import { say } from '@/utils/dialogueUtils';

const QUESTIONS_MMI: Question[] = [
    {
        type: 'qcm',
        question: 'Quels sont les 3 parcours en M.M.I ?',
        options: [
            { id: 1, text: 'Informatique / Web / Design' },
            { id: 2, text: 'Développement / Communication / Création' },
            { id: 3, text: 'Marketing / Finance / Design' },
        ],
        answer: 2,
    },
    {
        type: 'qcm',
        question: 'Quelle est la particularité de la formation M.M.I ?',
        options: [
            { id: 1, text: 'Spécialisée' },
            { id: 2, text: 'Optionnel' },
            { id: 3, text: 'Pluridisciplinarité' },
        ],
        answer: 3,
    },
    {
        type: 'qcm',
        question: 'Combien de semestres dure le tronc commun ?',
        options: [
            { id: 1, text: '2 semestres' },
            { id: 2, text: '3 semestres' },
            { id: 3, text: '4 semestres' },
        ],
        answer: 2,
    },
    {
        type: 'qcm',
        question: 'Que veut dire M.M.I ?',
        options: [
            { id: 1, text: 'Métier du Marketing Informatique' },
            { id: 2, text: 'Métier du Multimédia et de l’Internet' },
            { id: 3, text: 'Module de Management et Informatique' },
        ],
        answer: 2,
    },
    {
        type: 'qcm',
        question:
            'Analysez cette empreinte digitale retrouvée sur la scène de crime. À qui appartient-elle ? ( indice le hacker )',
        image: '/images/fingerprint_evidence.webp',
        options: [
            { id: 1, text: 'Suspect A (Le Jardinier)' },
            { id: 2, text: 'Suspect B (Le Hacker)' },
            { id: 3, text: 'Suspect C (Le Directeur)' },
        ],
        answer: 2,
    },
    {
        type: 'qcm',
        question: 'Quelle balise sert à insérer une image ?',
        options: [
            { id: 1, text: '\x3Cimg>' },
            { id: 2, text: '\x3Csrc>' },
            { id: 3, text: '\x3Cdiv>' },
            { id: 4, text: '\x3Cpic>' },
        ],
        answer: 1,
    },
    {
        type: 'qcm',
        question:
            "Parmi les propositions suivantes, laquelle n'est pas une boucle en programmation ?",
        options: [
            { id: 1, text: 'for' },
            { id: 2, text: 'while' },
            { id: 3, text: 'if' },
            { id: 4, text: 'do...while' },
        ],
        answer: 3,
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
            'Bon les élèves de 3e année vous ont déjà expliqué la situation j’imagine mais pour faire court, un élève de MMI vient de développer un virus qui menace toutes les machines alors Pierre-Alain a créé un antivirus mais la clé USB sur laquelle il était stocké a été subtilisée par cet élève.'
        ),
        say(
            CHARACTERS.fabien,
            'Comme par hasard, cet évènement est survenu juste après une SAE de dev… On a reçu un message de la part du malfaiteur et il nous a laissé un puzzle pour retrouver la clé USB avec l’antivirus préparé par M. Jacquot.'
        ),
        say(
            CHARACTERS.fabien,
            ' Il a menacé d’activer immédiatement le virus si ce puzzle n’était pas fait exclusivement par des première année, donc vous avez été choisis pour trouver cette clé, pour l’activer et sauver l’IUT. D’ailleurs, même si c’est pas la priorité ultime, il faudrait aussi trouver l’identité de l’élève qui a créé ce virus…'
        ),
        say(
            CHARACTERS.paj,
            'Si on l’attrape, il subira les conséquences de ses actes et je m’en assurerai personnellement.',
            {}
        ),
        say(CHARACTERS.harry, 'Bienvenue ! HAHAHAHAHA !', { side: 'left' }),
        say(
            CHARACTERS.harry,
            'Alors comme ça vous voulez retrouver l’antivirus et empêcher mon petit bébé de prendre le contrôle de l’IUT ?',
            { side: 'left' }
        ),
        say(
            CHARACTERS.harry,
            'Bonne chance, on va voir si les MMI sont si intelligents que ça… D’ailleurs comme vous pouvez le voir, dans maintenant moins d’une heure le virus va s’activer et vous pourrez dire bye-bye à votre diplôme !',
            { side: 'left' }
        ),
    ],
    win: [
        say(
            CHARACTERS.harry,
            'Bravo, maintenant que vous vous croyez tellement intelligents, passons à l’énigme suivante…',
            { emotion: 'scared' }
        ),
    ],
};

export default function QuizQcmPage() {
    return (
        <>
            <AlphaHeader
                title={'Échauffement MMI'}
                subtitle="Répondez correctement pour débloquer l'accès au système."
            />

            <QuizGame
                scripts={SCRIPTS}
                questions={QUESTIONS_MMI}
                onSolve={() =>
                    window.alert(
                        "Bravo, vous avez réussi le module de jeu ! Lors de l'escape game, on passerait à l'étape suivante."
                    )
                }
            />
        </>
    );
}
