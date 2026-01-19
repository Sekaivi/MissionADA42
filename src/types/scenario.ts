import { PuzzleComponentId } from '@/components/puzzles/PuzzleRegistry';
import { CharacterId } from '@/data/characters';

export interface Hint {
    id: string;
    text: string;
    isLocked: boolean;
    characterId?: CharacterId;
    unlockDelay?: number;
}

export interface ScenarioStep {
    id: string;
    title: string;
    description: string; // visible par le MJ
    componentId: PuzzleComponentId; // clef pour charger le composant
    hints: Hint[];
    solution: string; // visible par le MJ
}

export interface Scenario {
    id: string;
    name: string;
    description: string;
    defaultDuration: number; // en secondes
    defaultTimeBeforeNextStep: number;
    steps: ScenarioStep[];
}
