import { DialogueLine } from './dialogue';

export interface GameScripts {
    intro: DialogueLine[];
    success: DialogueLine[];
    failure?: DialogueLine[];
}

export type PuzzleComponentId = 'tutorial-code' | 'logic-circuit' | 'victory-screen';

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
    description: string; // Visible par le MJ
    componentId: PuzzleComponentId; // Clé pour charger le composant
    hints: GameHint[];
    dialogues: GameDialogue[];
    solution: string; // Visible par le MJ
}

export type ScenarioState =
    | 'intro_dialogue' // Le joueur lit l'intro
    | 'playing' // Le joueur joue
    | 'end_dialogue' // Le joueur lit la conclusion
    | 'finished'; // Le jeu est fini (écran de score/restart)

export interface GameScenario {
    id: string;
    name: string;
    description: string;
    defaultDuration: number; // en secondes
    steps: GameStep[];
}
