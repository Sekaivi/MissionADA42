'use client';
import { AlphaHeader } from '@/components/alpha/AlphaHeader';
import QuizGame, { Question } from '@/components/puzzles/QuizGame';

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

export default function QuizQcmPage() {
    return (
        <>
            <AlphaHeader
                title={'Échauffement MMI'}
                subtitle="Répondez correctement pour débloquer l'accès au système."
            />

            <QuizGame
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
