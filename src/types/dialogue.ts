// types/dialogue.ts

export interface Character {
    id: string;
    name: string;
    avatars: {
        default: string;
        [emotion: string]: string; // ex: 'angry', 'happy', 'surprised'
    };
    defaultSide?: 'left' | 'right';
}

export interface DialogueLine {
    id: string;
    speaker: string;
    text: string;
    avatar: string;
    side?: 'left' | 'right';
}

// clefs possibles pour les scénarios (extensible)
export type GameScenarioStep = 'intro' | 'breach' | 'lockdown' | 'success' | 'failure';
