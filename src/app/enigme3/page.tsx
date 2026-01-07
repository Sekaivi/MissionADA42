'use client';
import { useRouter } from 'next/navigation';

import QuizGame, { Question } from '@/components/Games/QuizGame';

const QUESTIONS_LOGIC: Question[] = [
    {
        type: 'boolean',
        question: 'Le langage HTML est un langage de programmation.',
        answer: 'Faux',
    },
    {
        type: 'qcm',
        question: 'Quelle balise sert à insérer une image ?',
        options: [
            { id: 1, text: '<img>' },
            { id: 2, text: '<src>' },
            { id: 3, text: '<div>' },
            { id: 4, text: '<pic>' },
        ],
        answer: 1, // La bonne réponse est l'ID 1 (<img>)
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
        answer: 3, // La bonne réponse est l'ID 3 (if)
    },

    {
        type: 'boolean',
        question: 'Le CSS permet de styliser les pages web.',
        answer: 'Vrai',
    },
];

export default function Enigme3() {
    const router = useRouter();

    return (
        <main className="flex min-h-screen w-full items-center justify-center bg-gray-50 p-4">
            <QuizGame
                title="Test de Logique"
                questions={QUESTIONS_LOGIC}
                onComplete={() => router.push('/enigme4')}
            />
        </main>
    );
}
