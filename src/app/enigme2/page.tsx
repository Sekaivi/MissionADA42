'use client';
import { useRouter } from 'next/navigation';

import QuizGame, { Question } from '@/components/Games/QuizGame';

// Exemple de configuration mixant QCM, Image, et Texte
const QUESTIONS_POLICE: Question[] = [
    {
        // Question 1 : Image + QCM
        type: 'qcm',
        question:
            'Analysez cette empreinte digitale retrouvée sur la scène de crime. À qui appartient-elle ? ( indice le hacker )',
        image: '/images/fingerprint_evidence.jpg', // Assure-toi d'avoir cette image dans public/images/
        options: [
            { id: 1, text: 'Suspect A (Le Jardinier)' },
            { id: 2, text: 'Suspect B (Le Hacker)' },
            { id: 3, text: 'Suspect C (Le Directeur)' },
        ],
        answer: 2, // La bonne réponse est l'ID 2 (Le Hacker)
    },
    {
        // Question 2 : Texte seul (Énigme logique)
        type: 'text',
        question: "Je suis le cœur de l'ordinateur, mais je n'ai pas de sang. Qui suis-je ?",
        answer: 'Processeur', // La réponse attendue (la casse est ignorée automatiquement)
    },
    {
        // Question 3 : Image + Texte (Observation)
        type: 'text',
        question: "Regardez bien ce code source. Quel est le numéro de l'erreur (Error code 404) ?",
        image: '/images/code_error.png',
        answer: '404',
    },
];

export default function Enigme2() {
    const router = useRouter();

    return (
        <main className="flex min-h-screen w-full items-center justify-center bg-gray-50 p-4">
            <QuizGame
                title="Laboratoire d'Analyse"
                description="Utilisez vos outils pour analyser les preuves."
                questions={QUESTIONS_POLICE}
                onComplete={() => router.push('/enigme3')}
            />
        </main>
    );
}
