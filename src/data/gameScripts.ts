// data/gameScripts.ts
import { Character, DialogueLine, GameScenarioStep } from '@/types/dialogue';

import { CHARACTERS } from './characters';

// Petite fonction utilitaire pour générer une ligne rapidement
const say = (char: Character, text: string, side?: 'left' | 'right'): DialogueLine => ({
    id: Math.random().toString(36).substr(2, 9), // ID unique auto
    speaker: char.name,
    text: text,
    avatar: char.avatar,
    side: side || char.defaultSide || 'left',
});

// Tes scripts organisés par état du jeu
export const GAME_SCRIPTS: Record<GameScenarioStep, DialogueLine[]> = {
    intro: [
        say(CHARACTERS.harry, 'Bienvenue dans mon énigme. Essaie de la résoudre.'),
        say(CHARACTERS.fabien, "Oh non ! C'est peut-être trop simple..."),
    ],
    breach: [
        say(CHARACTERS.system, "/// ALERTE DE SÉCURITÉ /// Tentative d'intrusion détectée."),
        say(CHARACTERS.harry, 'Mince, ils ont repéré le brute-force !'),
    ],
    lockdown: [say(CHARACTERS.system, 'Verrouillage du système en cours.')],
    success: [
        say(
            CHARACTERS.fabien,
            'Bravo ! Tu as correctement simulé la validation, quel gros malin !'
        ),
        say(CHARACTERS.harry, 'Pas mal du tout.'),
    ],
    failure: [say(CHARACTERS.fabien, "C'est raté pour cette fois.")],
};
