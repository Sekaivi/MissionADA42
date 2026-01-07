// src/types/game.ts

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
}
