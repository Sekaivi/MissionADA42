'use client';
import { useRouter } from 'next/navigation';

import QuizGame, { Question } from '@/components/Games/QuizGame';

const QUESTIONS_MMI: Question[] = [
    {
        type: 'qcm',
        question: 'Quels sont les 3 parcours en M.M.I ?',
        options: [
            { id: 1, text: 'Informatique / Web / Design' },
            { id: 2, text: 'Développement / Communication / Création' },
            { id: 3, text: 'Marketing / Finance / Design' },
        ],
        answer: 2, // C'est l'ID 2 qui est la bonne réponse
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
        answer: 2, // ID 2 correspond à "3 semestres"
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
];

export default function Enigme1() {
    const router = useRouter();

    const handleComplete = () => {
        console.log('Quiz terminé !');
        setTimeout(() => {
            router.push('/enigme2');
        }, 500);
    };

    return (
        <main className="flex min-h-screen w-full items-center justify-center bg-gray-50 p-4">
            <QuizGame
                title="Échauffement MMI"
                description="Répondez correctement pour débloquer l'accès au système."
                questions={QUESTIONS_MMI}
                onComplete={handleComplete}
            />
        </main>
    );
}
