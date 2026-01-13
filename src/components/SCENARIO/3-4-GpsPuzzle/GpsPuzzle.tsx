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
            CHARACTERS.fabien,
            'On a réussi à localiser d’où provient le signal de son puzzle, j’imagine que la suite de son épreuve se passe là-bas.'
        ),
        say(
            CHARACTERS.fabien,
            'Allez encore un peu de détermination et je réfléchirai à vous mettre une note bonus en Intégration.'
        ),
    ],
};

export default function GpsPuzzle({ isSolved, onSolve }: PuzzleProps) {
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

    if (isSolved) return <AlphaSuccess message={'GPS validé'} />;

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
