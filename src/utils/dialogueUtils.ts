// utils/dialogueUtils.ts
import { Character, DialogueLine } from '@/types/dialogue';

interface SayOptions {
    side?: 'left' | 'right';
    emotion?: string;
}

export function say(char: Character, text: string, options?: SayOptions): DialogueLine;

export function say(
    char: Character,
    text: string,
    optionsOrSide?: 'left' | 'right' | SayOptions
): DialogueLine {
    let side: 'left' | 'right' | undefined;
    let emotion: string | undefined;

    if (typeof optionsOrSide === 'string') {
        side = optionsOrSide;
    } else if (typeof optionsOrSide === 'object') {
        side = optionsOrSide.side;
        emotion = optionsOrSide.emotion;
    }

    // on cherche l'émotion demandée
    // si pas trouvée ou pas demandée on prend 'default'
    // si 'default' n'existe pas, on prend la première valeur dispo
    const avatarUrl =
        emotion && char.avatars[emotion]
            ? char.avatars[emotion]
            : char.avatars.default || Object.values(char.avatars)[0];

    return {
        id: Math.random().toString(36).substring(2, 9),
        speaker: char.name,
        text: text,
        avatar: avatarUrl,
        side: side || char.defaultSide || 'left',
    };
}
