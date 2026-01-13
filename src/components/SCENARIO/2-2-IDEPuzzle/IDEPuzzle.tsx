'use client';

import React from 'react';

import { AlphaModal } from '@/components/alpha/AlphaModal';
import { AlphaSuccess } from '@/components/alpha/AlphaSuccess';
import { DialogueBox } from '@/components/dialogueBox';
import { PuzzlePhases, PuzzleProps } from '@/components/puzzles/PuzzleRegistry';
import { SCENARIO } from '@/data/alphaScenario';
import { CHARACTERS } from '@/data/characters';
import { useGameScenario, useScenarioTransition } from '@/hooks/useGameScenario';
import { DialogueLine } from '@/types/dialogue';
import { say } from '@/utils/dialogueUtils';

export type DialoguePuzzlePhases = PuzzlePhases;

const SCRIPTS: Partial<Record<DialoguePuzzlePhases, DialogueLine[]>> = {
    intro: [
        say(
            CHARACTERS.unknown,
            'Vous êtes plutôt créatifs en MMI non ? Alors arrangez-moi tout ça.'
        ),
        say(CHARACTERS.unknown, "Si vous aimez rigoler, croyez-moi qu'on va rigoler !"),
        say(
            CHARACTERS.goguey,
            "Moi s'il y a bien un endroit où je rigole, c'est devant le tableau des memes !"
        ),
    ],
    win: [
        say(
            CHARACTERS.unknown,
            "Alors ? Vous avez bien rigolé ? Je l'aime bien aussi ce tableau des memes."
        ),
        say(
            CHARACTERS.unknown,
            "J'y avais laissé un symbole de paix entre MMI et MPH il y a longtemps, mais ça a été retiré depuis..."
        ),
    ],
};

export default function IDEPuzzle({ isSolved, onSolve }: PuzzleProps) {
    const { gameState, isDialogueOpen, currentScript, triggerPhase, onDialogueComplete } =
        useGameScenario<DialoguePuzzlePhases>(SCRIPTS);

    useScenarioTransition(gameState, isDialogueOpen, {
        idle: () => {
            triggerPhase('intro');
        },
        intro: () => {
            triggerPhase('win');
        },
        win: () => {
            setTimeout(() => onSolve(), SCENARIO.defaultTimeBeforeNextStep);
        },
    });

    if (isSolved) return <AlphaSuccess message={'IDE validé'} />;

    return (
        <>
            <DialogueBox
                isOpen={isDialogueOpen}
                script={currentScript}
                onComplete={onDialogueComplete}
            />

            <AlphaModal
                isOpen={gameState === 'win' && !isDialogueOpen}
                title={'Succès'}
                message="Epreuve passée avec succès"
                subMessage={
                    "Ce puzzle n'a pas encore été implémenté, vous avez seulement lu les dialogues associés"
                }
                autoCloseDuration={SCENARIO.defaultTimeBeforeNextStep}
                durationUnit={'ms'}
            />
        </>
    );
}
