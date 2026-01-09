// hooks/useGameScenario.ts
import { useCallback, useEffect, useRef, useState } from 'react';

import { DialogueLine } from '@/types/dialogue';

// Le hook prend un type générique T pour les clés (ex: 'intro' | 'success')
export const useGameScenario = <T extends string>(scripts: Partial<Record<T, DialogueLine[]>>) => {
    const [isDialogueOpen, setIsDialogueOpen] = useState(false);
    const [currentScript, setCurrentScript] = useState<DialogueLine[]>([]);
    const [gameState, setGameState] = useState<T | 'idle'>('idle');

    const scriptsRef = useRef(scripts);

    // update la ref à chaque rendu pour être sûr d'avoir la dernière version
    useEffect(() => {
        scriptsRef.current = scripts;
    });

    // On passe la clé (ex: 'intro') qui DOIT exister dans les scripts fournis
    const triggerPhase = useCallback((phase: T) => {
        const selectedScript = scriptsRef.current[phase];

        setGameState(phase);

        if (selectedScript && selectedScript.length > 0) {
            setCurrentScript(selectedScript);
            setIsDialogueOpen(true);
        }
    }, []);

    const onDialogueComplete = useCallback(() => {
        setIsDialogueOpen(false);
    }, []);

    return {
        gameState,
        isDialogueOpen,
        currentScript,
        triggerPhase,
        onDialogueComplete,
    };
};

/**
 * Hook utilitaire pour déclencher des actions automatiquement à la fin d'un dialogue
 */
export const useScenarioTransition = <T extends string>(
    currentPhase: T | 'idle',
    isDialogueOpen: boolean,
    transitions: Partial<Record<T, () => void>>
) => {
    const transitionsRef = useRef(transitions);

    useEffect(() => {
        transitionsRef.current = transitions;
    });

    // surveille la fermeture du dialogue
    useEffect(() => {
        if (!isDialogueOpen && currentPhase !== 'idle') {
            const action = transitionsRef.current[currentPhase as T];
            if (action) {
                action();
            }
        }
        // on ne déclenche que si la phase change ou si le dialogue s'ouvre/ferme
    }, [currentPhase, isDialogueOpen]);
};
