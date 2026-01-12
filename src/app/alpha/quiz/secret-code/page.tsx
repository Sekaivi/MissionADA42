'use client';

import { AlphaHeader } from '@/components/alpha/AlphaHeader';
import QuizGame, { Question, QuizScenarioStep } from '@/components/puzzles/QuizGame';
import { CHARACTERS } from '@/data/characters';
import { DialogueLine } from '@/types/dialogue';
import { say } from '@/utils/dialogueUtils';

const QUESTIONS_ADMIN: Question[] = [
    {
        type: 'number',
        question: 'Veuillez entrer le mot de passe administrateur',
        answer: 6092,
        showLegend: true,
    },
];

const SCRIPTS: Partial<Record<QuizScenarioStep, DialogueLine[]>> = {
    init: [say(CHARACTERS.fabien, 'Bip bip boup')],
    win: [say(CHARACTERS.fabien, 'Boup bidoup bip')],
};

export default function AdminAccessPage() {
    return (
        <>
            <AlphaHeader
                title={'Accès administrateur'}
                subtitle={'Mot de passe à 4 chiffres requis'}
            />

            <QuizGame
                scripts={SCRIPTS}
                questions={QUESTIONS_ADMIN}
                onSolve={() => window.alert('ACCÈS AUTORISÉ — suite des énigmes débloquée')}
            />
        </>
    );
}
