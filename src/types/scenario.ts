import { PuzzleComponentId } from '@/components/puzzles/PuzzleRegistry';

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

export interface GameScenario {
    id: string;
    name: string;
    description: string;
    defaultDuration: number; // en secondes
    defaultTimeBeforeNextStep: number;
    steps: GameStep[];
}
