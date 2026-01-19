// src/data/items.ts
import { DialogueLine } from '@/types/dialogue';
import { InventoryItem } from '@/types/game';
import { say } from '@/utils/dialogueUtils';

import { CHARACTERS } from './characters';

// soit un tableau fixe, soit une fonction qui prend l'inventaire et renvoie un tableau
type ScriptGenerator = (currentInventory: InventoryItem[]) => DialogueLine[];

// Omit 'isFound' qui est géré par le state
export interface ItemDefinition extends Omit<InventoryItem, 'isFound'> {
    onCollectScript?: DialogueLine[] | ScriptGenerator;
}

export const ITEMS_REGISTRY: Record<string, ItemDefinition> = {
    '1': {
        id: '1',
        name: 'Liste_Notes_SAE203.pdf',
        desc: 'Un relevé de notes étonnamment excellent. Aucune mauvaise note !',
        sprite: '/images/clues/notes.png',
        onCollectScript: [
            say(
                CHARACTERS.goguey,
                'Tiens tiens tiens... Vous êtes tombé sur un indice ! Regardez ce relevé de notes !'
            ),
            say(CHARACTERS.fabien, "SAE 203... Il n'y a que des bonnes notes !"),
            say(
                CHARACTERS.fabien,
                "On dirait que notre piste de vengeance de la SAE de dev n'est pas la bonne..."
            ),
            say(
                CHARACTERS.fabien,
                "Bon, ce genre de document nous aidera peut-être à trouver qui est à l'origine de ce virus et du vol de l'antivirus, mais en attendant, concentrez-vous sur la localisation de ce dernier."
            ),
        ],
    },
    '2': {
        id: '2',
        name: 'Lettre_Motivation_MMI.pdf',
        desc: 'Une lettre de supplication adressée au grand chef de département, M. Lestideau.',
        sprite: '/images/clues/lettre_motiv.png',
        onCollectScript: (inventory) => {
            // vérifie si l'item 1 est déjà dans l'inventaire
            const hasItem1 = inventory.some((i) => i.id === '1');

            if (hasItem1) {
                return [
                    say(
                        CHARACTERS.fabien,
                        "Encore une pièce à conviction ! Je sens qu'on se rapproche..."
                    ),
                ];
            } else {
                return [
                    say(
                        CHARACTERS.fabien,
                        'Tiens, une lettre de motivation pour rentrer en MMI ? On va peut-être pouvoir trouver lequel de nos élèves est derrière tout ça.'
                    ),
                ];
            }
        },
    },
    '3': {
        id: '3',
        name: 'Lettre_Refus_MMI.pdf',
        desc: 'Un document administratif froid avec un tampon "REFUSÉ".',
        sprite: '/images/clues/refus.png',
        onCollectScript: [
            say(
                CHARACTERS.fabien,
                'Et un indice de plus ! Je vais recouper les informations pendant que vous continuez à résoudre ce problème de virus, votre aide est très précieuse, merci.'
            ),
        ],
    },
    '4': {
        id: '4',
        name: 'Certificat_Scolarite_MPH.pdf',
        desc: "La preuve d'une réorientation subie et non choisie.",
        sprite: '/images/clues/certificat.png',
        onCollectScript: (inventory) => {
            const hasItem1 = inventory.some((i) => i.id === '1');

            if (hasItem1) {
                return [
                    say(
                        CHARACTERS.fabien,
                        "On n'est plus qu'à un pas. On devrait trouver notre malfaiteur dans quelques minutes seulement."
                    ),
                ];
            } else {
                return [
                    say(
                        CHARACTERS.fabien,
                        'Mince, il semblerait que ça ne soit pas un élève de MMI, bon ça complique un peu mes recherches, je vais faire de mon mieux.'
                    ),
                ];
            }
        },
    },
};
