export interface GameContext {
    sessionId: string; // Ex: "X92"
    requiredSum: number; // Ex: 15
}

export interface PasswordRule {
    id: number;
    title: string;
    description: string;
    validator: (input: string, context: GameContext) => boolean;
}

export type RuleStatus = 'pending' | 'valid' | 'invalid';
