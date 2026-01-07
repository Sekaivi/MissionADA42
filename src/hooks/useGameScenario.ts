import { useState, useCallback } from 'react';
import { DialogueLine } from '@/types/dialogue';
import { GameScripts, ScenarioState } from '@/types/scenario';

export const useGameScenario = (scripts: GameScripts) => {
    const [scenarioState, setScenarioState] = useState<ScenarioState>('intro_dialogue');

    // Script actuellement affiché dans la DialogueBox
    const [currentScript, setCurrentScript] = useState<DialogueLine[]>(scripts.intro);

    // Stocke si c'était une victoire ou défaite pour la fin
    const [isWin, setIsWin] = useState(false);

    // 1. Appelé quand la DialogueBox a fini d'afficher le texte
    const onDialogueComplete = useCallback(() => {
        if (scenarioState === 'intro_dialogue') {
            setScenarioState('playing');
        } else if (scenarioState === 'end_dialogue') {
            setScenarioState('finished');
        }
    }, [scenarioState]);

    // 2. Appelé par le Jeu quand le joueur gagne
    const triggerWin = useCallback(() => {
        setIsWin(true);
        setCurrentScript(scripts.success);
        setScenarioState('end_dialogue');
    }, [scripts.success]);

    // 3. Appelé par le Jeu quand le joueur perd (optionnel)
    const triggerFailure = useCallback(() => {
        setIsWin(false);
        if (scripts.failure) {
            setCurrentScript(scripts.failure);
            setScenarioState('end_dialogue');
        } else {
            // Pas de dialogue de défaite, on restart direct ou on finit
            setScenarioState('finished');
        }
    }, [scripts.failure]);

    // 4. Pour recommencer le jeu
    const resetGame = useCallback(() => {
        setIsWin(false);
        setCurrentScript(scripts.intro);
        setScenarioState('intro_dialogue');
    }, [scripts.intro]);

    return {
        scenarioState,      // 'intro_dialogue' | 'playing' | ...
        currentScript,      // Le tableau de dialogue à passer à la Box
        onDialogueComplete, // À passer à la Box
        triggerWin,         // À appeler quand le jeu est gagné
        triggerFailure,     // À appeler quand le jeu est perdu
        resetGame,          // Pour le bouton "Recommencer"
        isWin               // Utile pour afficher un écran de fin spécifique
    };
};