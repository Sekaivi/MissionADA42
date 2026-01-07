import { PuzzleComponentId } from '@/components/puzzles/PuzzleRegistry';
import { DialogueLine } from '@/types/dialogue';

export interface GameHint {
    id: string;
    text: string;
    isLocked: boolean;
}

export interface GameDialogue {
    speaker: 'AI' | 'HQ' | 'System';
    message: string;
}

export interface GameStep {
    id: string;
    title: string;
    description: string; // visible par le MJ
    componentId: PuzzleComponentId; // clef pour charger le composant
    hints: GameHint[];
    solution: string; // visible par le MJ
}

export type ScenarioState =
    | 'intro_dialogue' // Le joueur lit l'intro
    | 'playing' // Le joueur joue
    | 'end_dialogue' // Le joueur lit la conclusion
    | 'finished'; // Le jeu est fini (écran de score/restart)

export interface GameScripts {
    intro: DialogueLine[]; // dialogues d'intro
    success: DialogueLine[]; // dialogues de victoire
    failure?: DialogueLine[]; // dialogues d'échec
}

export interface GameScenario {
    id: string;
    name: string;
    description: string;
    defaultDuration: number; // en secondes
    defaultTimeBeforeNextStep: number;
    steps: GameStep[];
}
