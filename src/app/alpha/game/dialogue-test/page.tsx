'use client';

import { useEffect } from 'react';

import { AlphaButton } from '@/components/alpha/AlphaButton';
import { AlphaCard } from '@/components/alpha/AlphaCard';
import { AlphaHeader } from '@/components/alpha/AlphaHeader';
import { DialogueBox } from '@/components/dialogueBox';
import { PuzzlePhases } from '@/components/puzzles/PuzzleRegistry';
import { SCENARIO } from '@/data/alphaScenario';
import { CHARACTERS } from '@/data/characters';
import { useGameScenario, useScenarioTransition } from '@/hooks/useGameScenario';
import { DialogueLine } from '@/types/dialogue';
import { say } from '@/utils/dialogueUtils';

export type DialoguePuzzlePhases = PuzzlePhases | 'breach';

const SCRIPTS: Partial<Record<DialoguePuzzlePhases, DialogueLine[]>> = {
    intro: [
        say(CHARACTERS.harry, "Reconstitue l'empreinte digitale pour déverrouiller l'accès."),
        say(CHARACTERS.harry, 'Je te souhaite bonne chance hihihi !', { emotion: 'happy' }),
        say(CHARACTERS.system, 'Bon courage jeune développeur !', { side: 'right' }),
        say(CHARACTERS.harry, 'Il en aura bien besoin...'),
    ],
    breach: [say(CHARACTERS.fabien, "Tu fais n'importe quoi, les fragments ne collent pas !")],
    win: [say(CHARACTERS.harry, 'Oh non ! Tu as réussi...', { emotion: 'scared' })],
};

export default function DialogueTest() {
    const { gameState, isDialogueOpen, currentScript, triggerPhase, onDialogueComplete } =
        useGameScenario<DialoguePuzzlePhases>(SCRIPTS);

    useScenarioTransition(gameState, isDialogueOpen, {
        idle: () => {
            triggerPhase('intro');
        },
        win: () => {
            setTimeout(
                () => window.alert('exécuter le onSolve'),
                SCENARIO.defaultTimeBeforeNextStep
            );
        },
    });

    useEffect(() => {
        triggerPhase('intro');
    }, [triggerPhase]);

    return (
        <>
            <AlphaHeader title={`Dialogue (Phase: )`} subtitle="Test du système avancé" />

            <AlphaCard title="Actions de Debug">
                <div className="flex flex-wrap gap-2">
                    <AlphaButton onClick={() => triggerPhase('intro')} variant="secondary">
                        Rejouer Intro
                    </AlphaButton>

                    <AlphaButton onClick={() => triggerPhase('breach')} variant="danger">
                        Simuler Breach
                    </AlphaButton>

                    <AlphaButton onClick={() => triggerPhase('win')} variant="primary">
                        Simuler Victoire
                    </AlphaButton>
                </div>
            </AlphaCard>

            <DialogueBox
                isOpen={isDialogueOpen}
                script={currentScript}
                onComplete={onDialogueComplete}
            />
        </>
    );
}
