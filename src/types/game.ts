// src/types/game.ts
export type Difficulty = 'easy' | 'medium' | 'hard';

export interface Player {
    id: string;
    name: string;
    isGM: boolean;
    joinedAt: number;
}

export interface HistoryEntry {
    step: number;
    solverName: string;
    solvedAt: number;
    duration: number;
}

export interface PendingProposal {
    playerId: string;
    playerName: string;
    actionLabel: string;
    timestamp: number;
}

export interface GameState {
    step: number;
    message: string;
    startTime: number;

    // force les tableaux, mais on acceptera 'undefined' dans le code via des checks
    players: Player[];
    history: HistoryEntry[];

    pendingProposal: PendingProposal | null;

    lastUpdate: number;
    lastStepTime?: number;
    timestamp?: number;

    admin_command?: AdminCommand; // canal 1 : flash info / effets
    active_challenge?: ChallengeCommand; // canal 2 : défis bloquants persistants
    bonusTime?: number; // temps ajouté/retiré en MINUTES (ex: 5, -2)
}

export type AdminCommandType = 'MESSAGE' | 'GLITCH' | 'INVERT' | 'SKIP' | 'ADD_TIME'; // commandes éphémères
export type ChallengeType = 'GYRO' | 'CODE_RED'; // types bloquants

export interface AdminCommand {
    id: number;
    type: AdminCommandType;
    payload?: string | number;
}

export interface ChallengeCommand {
    id: number;
    type: ChallengeType;
    payload?: any;
}
