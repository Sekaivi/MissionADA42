'use client';
import { useRouter } from 'next/navigation';

import QuizGame, { Question } from '@/components/Games/QuizGame';

const QUESTIONS_POLICE: Question[] = [
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
        type: 'text',
        question: "Je suis le cœur de l'ordinateur, mais je n'ai pas de sang. Qui suis-je ?",
        answer: 'Processeur',
    },
    {
        type: 'text',
        question: "Regardez bien ce code source. Quel est le numéro de l'erreur (Error code 404) ?",
        image: '/images/code_error.webp',
        answer: '404',
    },
];

export default function Enigme2() {
    const router = useRouter();

    return (
        <QuizGame
            title="Laboratoire d'Analyse"
            description="Utilisez vos outils pour analyser les preuves."
            questions={QUESTIONS_POLICE}
            onComplete={() => router.push('/enigme3')}
        />
    );
}
