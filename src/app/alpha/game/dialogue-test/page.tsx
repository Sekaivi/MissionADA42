'use client';

import { useEffect } from 'react';

import { AlphaButton } from '@/components/alpha/AlphaButton';
import { AlphaCard } from '@/components/alpha/AlphaCard';
import { AlphaHeader } from '@/components/alpha/AlphaHeader';
import { DialogueBox } from '@/components/dialogueBox';
import { CHARACTERS } from '@/data/characters';
import { useGameScenario } from '@/hooks/useGameScenario';
import { DialogueLine } from '@/types/dialogue';
import { say } from '@/utils/dialogueUtils';

export type BioScenarioStep = 'intro' | 'breach' | 'error_too_many' | 'success';

const BIO_SCRIPTS: Partial<Record<BioScenarioStep, DialogueLine[]>> = {
    intro: [
        say(CHARACTERS.harry, "Reconstitue l'empreinte digitale pour déverrouiller l'accès."),
        say(CHARACTERS.harry, 'Je te souhaite bonne chance hihihi !', { emotion: 'happy' }),
        say(CHARACTERS.system, 'Bon courage jeune développeur !', { side: 'right' }),
        say(CHARACTERS.harry, 'Il en aura bien besoin...'),
    ],
    breach: [say(CHARACTERS.fabien, "Tu fais n'importe quoi, les fragments ne collent pas !")],
    success: [say(CHARACTERS.harry, 'Oh non ! Tu as réussi...', { emotion: 'scared' })],
};

export default function DialogueTest() {
    const { isDialogueOpen, currentScript, triggerPhase, onDialogueComplete } =
        useGameScenario<BioScenarioStep>(BIO_SCRIPTS);

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

                    <AlphaButton onClick={() => triggerPhase('success')} variant="primary">
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
