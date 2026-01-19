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

export interface ValidationRequest {
    nextStep: number;
    triggeredBy: string;
    readyPlayers: string[]; // IDs des joueurs prêts
    timestamp: number;
}

export interface ModuleActionEvent {
    id: string; // ex: 'color_scanner'
    payload: string; // ex: 'RED'
    playerId: string;
    timestamp: number;
}

export type LogType = 'INFO' | 'SUCCESS' | 'WARNING' | 'ERROR' | 'ADMIN' | 'PLAYER';

export interface GameLogEntry {
    id: string;
    timestamp: number;
    type: LogType;
    message: string;
    details?: string;
}

export interface GameState {
    step: number;
    message: string;
    startTime: number;
    players: Player[];
    history: HistoryEntry[];
    pendingProposal: PendingProposal | null;
    lastModuleAction?: ModuleActionEvent | null;
    validationRequest?: ValidationRequest | null;
    lastUpdate: number;
    lastStepTime?: number;
    timestamp?: number;
    admin_command?: AdminCommand; // canal 1 : flash info / effets
    active_challenge?: ChallengeCommand | null; // canal 2 : défis bloquants persistants
    bonusTime?: number; // temps ajouté/retiré en MINUTES (ex: 5, -2)
    logs?: GameLogEntry[];
    inventory?: InventoryItem[];
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
    payload?: string | number | Record<string, unknown>; // accepte string, nombre, ou objet générique (ex: { difficulty: 1 })
}

export interface InventoryItem {
    id: string;
    name: string;
    desc: string;
    isFound: boolean; // pour savoir si on l'a déjà ou non
    sprite: string; // chemin vers l'image
}
