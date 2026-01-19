import { useCallback, useEffect, useMemo, useState } from 'react';

import { CHARACTERS } from '@/data/characters';
import { DialogueLine } from '@/types/dialogue';
import { ScenarioStep } from '@/types/scenario';
import { say } from '@/utils/dialogueUtils';

interface UseHintSystemProps {
    currentStep: ScenarioStep | undefined;
    stepStartTime: number;
    onOpenDialogue: (script: DialogueLine[]) => void;
}

export const useHintSystem = ({
    currentStep,
    stepStartTime,
    onOpenDialogue,
}: UseHintSystemProps) => {
    const [hintIndex, setHintIndex] = useState(0);

    const [now, setNow] = useState(() => Date.now());

    // Timer pour mettre à jour le compte à rebours chaque seconde
    useEffect(() => {
        const interval = setInterval(() => setNow(Date.now()), 1000);
        return () => clearInterval(interval);
    }, []);

    // Calculs de temps
    const elapsedTimeInSeconds = Math.max(0, (now - stepStartTime) / 1000);

    const availableHints = useMemo(() => {
        return currentStep?.hints || [];
    }, [currentStep]);

    const nextHint = availableHints[hintIndex];

    // Vérifie si le prochain indice est bloqué par le temps
    const requiredDelay = nextHint?.unlockDelay || 0;
    const isNextHintLocked = nextHint ? elapsedTimeInSeconds < requiredDelay : false;
    const secondsRemaining = Math.max(0, requiredDelay - elapsedTimeInSeconds);

    const triggerHint = useCallback(() => {
        if (!currentStep) return;

        if (availableHints.length === 0) return;

        if (hintIndex >= availableHints.length) {
            const recapLines = availableHints.map((h) => {
                const speaker = h.characterId ? CHARACTERS[h.characterId] : CHARACTERS.system;
                return say(speaker, `Rappel : ${h.text}`);
            });
            onOpenDialogue([
                say(CHARACTERS.system, 'Historique complet des transmissions :'),
                ...recapLines,
            ]);
            return;
        }

        if (isNextHintLocked) {
            onOpenDialogue([
                say(CHARACTERS.system, `Données en cours de décryptage. Veuillez patienter.`),
            ]);
            return;
        }

        const hintToReveal = availableHints[hintIndex];
        const speaker = hintToReveal.characterId
            ? CHARACTERS[hintToReveal.characterId]
            : CHARACTERS.system;

        const dialogue = [
            hintToReveal.characterId
                ? say(CHARACTERS.system, `Interception d'un message de ${speaker.name}...`)
                : say(CHARACTERS.system, `Indice ${hintIndex + 1} décrypté...`),
            say(speaker, hintToReveal.text),
        ];

        onOpenDialogue(dialogue);
        setHintIndex((prev) => prev + 1);
    }, [currentStep, hintIndex, onOpenDialogue, availableHints, isNextHintLocked]);

    return {
        triggerHint,
        totalHints: availableHints.length,
        unlockedCount: hintIndex,
        isNextHintLocked,
        secondsRemaining,
    };
};
