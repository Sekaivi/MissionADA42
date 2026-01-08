'use client';

import { AlphaButton } from '@/components/alpha/AlphaButton';
import { AlphaCard } from '@/components/alpha/AlphaCard';
import { AlphaHeader } from '@/components/alpha/AlphaHeader';
import { DialogueBox } from '@/components/dialogueBox';
import { useGameScenario } from '@/hooks/useGameScenario';
import { DialogueLine } from '@/types/dialogue';

const SCRIPTS = {
    intro: [
        { id: '1', speaker: 'Harry', text: 'Bienvenue dans mon énigme. Essaie de la résoudre.' },
        { id: '2', speaker: 'Fabien Romanens', text: "Oh non ! C'est peut-être trop simple..." },
    ] as DialogueLine[],
    someState: [
        { id: '1', speaker: 'Harry', text: 'Bienvenue dans mon énigme. Essaie de la résoudre.' },
    ],
    success: [
        {
            id: '3',
            speaker: 'Fabien Romanens',
            text: 'Bravo ! Tu as correctement simulé la validation, quel gros malin !',
        },
    ] as DialogueLine[],
};

export default function DialogueTest() {
    const { scenarioState, currentScript, onDialogueComplete, triggerWin } =
        useGameScenario(SCRIPTS);

    console.log(currentScript)

    return (
        <>
            <AlphaHeader title="Dialogue" subtitle="Test du hook de dialogues" />
            <AlphaCard title={"En effet ce n'est pas très compliqué... "}>
                <AlphaButton onClick={triggerWin}>Simuler une validation</AlphaButton>
                <AlphaButton variant={'secondary'}>Aide-moi</AlphaButton>
                <AlphaButton variant={'secondary'}>Je fais action quelconque</AlphaButton>
            </AlphaCard>

            <DialogueBox
                isOpen={scenarioState === 'intro_dialogue' || scenarioState === 'end_dialogue'}
                script={currentScript}
                onComplete={onDialogueComplete}
            />
        </>
    );
}
