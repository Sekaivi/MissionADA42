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

    {
        type: 'boolean',
        question: 'Le CSS permet de styliser les pages web.',
        answer: 'Vrai',
    },
];

export default function Enigme3() {
    const router = useRouter();

    return (
        <QuizGame
            title="Test de Logique"
            questions={QUESTIONS_LOGIC}
            onComplete={() => router.push('/enigme4')}
        />
    );
}
