export interface DialogueLine {
    id: string;
    speaker: string;
    text: string;
    avatar?: string;
    side?: 'left' | 'right';
}