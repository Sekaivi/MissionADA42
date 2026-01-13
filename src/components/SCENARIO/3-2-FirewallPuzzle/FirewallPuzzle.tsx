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
        say(CHARACTERS.paj, "Oulaaaah... Le système a l'air instable et en surchauffe !"),
        say(
            CHARACTERS.paj,
            'Essayez de réparer ça avant que toute foute le camp. Et puis, la température continue de monter.'
        ),
    ],
    win: [
        say(
            CHARACTERS.fabien,
            "OK, le pare-feu est rétabli. Il est encore plus sécurisé qu'avant."
        ),
        say(CHARACTERS.fabien, 'Mais maintenant, il faut trouver la clé USB...'),
        say(CHARACTERS.fabien, "Ah, tiens ! Notre malfaiteur semble reprendre de l'activité !"),
    ],
};

export default function FirewallPuzzle({ isSolved, onSolve }: PuzzleProps) {
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

    if (isSolved) return <AlphaSuccess message={'Pare-feu validé'} />;

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
