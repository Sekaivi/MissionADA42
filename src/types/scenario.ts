import { DialogueLine } from './dialogue';

export interface GameScripts {
    intro: DialogueLine[];
    success: DialogueLine[];
    failure?: DialogueLine[];
}

export type ScenarioState =
    | 'intro_dialogue' // Le joueur lit l'intro
    | 'playing'        // Le joueur joue
    | 'end_dialogue'   // Le joueur lit la conclusion
    | 'finished';      // Le jeu est fini (écran de score/restart)