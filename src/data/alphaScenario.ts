import { Scenario } from '@/types/scenario';

export const SCENARIO: Scenario = {
    id: 'scenario_alpha_01',
    name: 'Mission Ada42',
    description:
        '',
    defaultDuration: 3600,
    defaultTimeBeforeNextStep: 3000,
    steps: [
        {
            id: 'step_1_1',
            title: 'Texte simple',
            description: '',
            componentId: 'qcm-puzzle',
            solution: '',
            hints: [
                {
                    id: 'h_qcm-puzzle_1',
                    text: 'Si c’est ce que je pense on l’a vraiment beaucoup répété…',
                    isLocked: true,
                    characterId: 'fabien',
                    unlockDelay: 1,
                },
                {
                    id: 'h_qcm-puzzle_2',
                    text: 'Allez, c’est vraiment ce qui caractérise MMI.',
                    isLocked: true,
                    characterId: 'fabien',
                    unlockDelay: 180,
                },
                {
                    id: 'h_qcm-puzzle_3',
                    text: 'Normalement la réponse est Pluridisciplinarité.',
                    isLocked: true,
                    characterId: 'fabien',
                    unlockDelay: 360,
                },
            ],
        },
        {
            id: 'step_1_2',
            title: 'Jeu de rotation',
            description: '',
            componentId: 'spin-puzzle',
            solution: '',
            hints: [
                {
                    id: 'h_spin_1',
                    text: 'Là visiblement il faut juste tourner deux fois sur vous-même.',
                    isLocked: true,
                    characterId: 'fabien',
                    unlockDelay: 1,
                },
            ],
        },
        {
            id: 'step_1_3',
            title: 'Jeu des couleurs',
            description: '',
            componentId: 'chromatic-puzzle',
            solution: '',
            hints: [
                {
                    id: 'h_chromatic-puzzle_1',
                    text: "Jetez peut-être un coup d'œil aux outils qu’on a mis en place.",
                    isLocked: true,
                    characterId: 'fabien',
                    unlockDelay: 1,
                },
                {
                    id: 'h_chromatic-puzzle_2',
                    text: 'Regardez si vous ne trouvez pas ces couleurs dans la salle, ça pourrait peut-être servir.',
                    isLocked: true,
                    characterId: 'fabien',
                    unlockDelay: 180,
                },
                {
                    id: 'h_chromatic-puzzle_3',
                    text: 'J’imagine qu’il faut scanner les couleurs demandées avec l’outil adapté.',
                    isLocked: true,
                    characterId: 'fabien',
                    unlockDelay: 360,
                },
            ],
        },
        {
            // etape 1 enigme 4 : code morse -> quizGame type text. Image morse dans le gdrive
            id: 'step_1_4',
            title: 'Code morse',
            description: '',
            componentId: 'morse-puzzle',
            solution: '',
            hints: [
                {
                    id: 'h_morse-puzzle_1',
                    text: 'Ca ressemble beaucoup à du morse…',
                    isLocked: true,
                    characterId: 'fabien',
                    unlockDelay: 1,
                },
                {
                    id: 'h_morse-puzzle_2',
                    text: 'Maintenant on dirait que notre malfaiteur a du mal à se servir d’un clavier correctement.',
                    isLocked: true,
                    characterId: 'fabien',
                    unlockDelay: 180,
                },
                {
                    id: 'h_morse-puzzle_3',
                    text: 'Pourtant il suffit d’appuyer sur la touche Windows + Espace pour changer son clavier de QWERTY à AZERTY',
                    isLocked: true,
                    characterId: 'fabien',
                    unlockDelay: 360,
                },
            ],
        },

        {
            // étape 2 énigme 1 : DNS : 4 post-it pour trouver le code : QuizGame type number
            id: 'step_2_1',
            title: 'DNS',
            description: '',
            componentId: 'dns-puzzle',
            solution: '',
            hints: [
                {
                    id: 'h_dns-puzzle_1',
                    text: 'Même si vous vous en souvenez pas c’est logique !',
                    isLocked: true,
                    characterId: 'paj',
                    unlockDelay: 1,
                },
                {
                    id: 'h_dns-puzzle_2',
                    text: 'Allez, faites honneur à mon cours...',
                    isLocked: true,
                    characterId: 'paj',
                    unlockDelay: 180,
                },
                {
                    id: 'h_dns-puzzle_3',
                    text: 'Vous me désespérez... La réponse c’est d’abord saisie puis requête, contact avec le serveur et enfin réponse du serveur.',
                    isLocked: true,
                    characterId: 'paj',
                    unlockDelay: 360,
                },
            ],
        },
        {
            // et2 en2 : IDE (mayssa)

            id: 'step_2_2',
            title: 'IDE',
            description: '',
            componentId: 'ide-puzzle',
            solution: '',
            hints: [
                {
                    id: 'h_ide-puzzle_1',
                    text: 'Si y a bien un endroit où je me marre c’est bien le tableau de memes.',
                    isLocked: true,
                    characterId: 'goguey',
                    unlockDelay: 1,
                },
                {
                    id: 'h_ide-puzzle_2',
                    text: 'J’ai l’impression que des nouveaux memes ont fait leur apparition.',
                    isLocked: true,
                    characterId: 'fabien',
                    unlockDelay: 180,
                },
                {
                    id: 'h_ide-puzzle_3',
                    text: 'Regardez-bien ceux qui concernent les lignes à compléter.',
                    isLocked: true,
                    characterId: 'fabien',
                    unlockDelay: 360,
                },
            ],
        },
        {
            id: 'step_2_3',
            title: 'Jeu de code',
            description: '',
            componentId: 'coding-puzzle',
            solution: '',
            hints: [
                {
                    id: 'h_coding-puzzle_1',
                    text: "Rappelez-vous de vos cours d'algorithmique, l’important ici c’est la structure du code pas le contenu des fonctions. Vous avez pas besoin de comprendre ce que ça fait tant que vous comprenez dans quel ordre ça s’exécute.",
                    isLocked: true,
                    characterId: 'fabien',
                    unlockDelay: 1,
                },
            ],
        },

        {
            // et3 en1 : post-it code : QuizGame type number
            id: 'step_3_1',
            title: 'Post-it',
            description: '',
            componentId: 'post-it-puzzle',
            solution: '',
            hints: [
                {
                    id: 'h_post-it-puzzle_1',
                    text: 'Le post-it que vous avez trouvez, ça pourrait être du morse ? Pourquoi il a cette forme ?',
                    isLocked: true,
                    characterId: 'fabien',
                    unlockDelay: 1,
                },
                {
                    id: 'h_post-it-puzzle_2',
                    text: 'J’ai l’impression que ça pourrait être une clé d’accès, donc une suite de chiffres.',
                    isLocked: true,
                    characterId: 'fabien',
                    unlockDelay: 180,
                },
                {
                    id: 'h_post-it-puzzle_3',
                    text: 'Je crois que j’ai compris, on dirait que c’est du morse qui dessine la forme de sa signification.',
                    isLocked: true,
                    characterId: 'fabien',
                    unlockDelay: 360,
                },
            ],
        },
        {
            // et3 en2 : Firewall (micro souffler)
            id: 'step_3_2',
            title: 'Pare-feu',
            description: '',
            componentId: 'firewall-puzzle',
            solution: '',
            hints: [
                {
                    id: 'h_firewall-puzzle_1',
                    text: 'Les mouvements semblent le rendre encore plus instable et la température continue de monter...',
                    isLocked: true,
                    characterId: 'paj',
                    unlockDelay: 1,
                },
                {
                    id: 'h_firewall-puzzle_2',
                    text: 'Arrêtez de bouger de suite et refroidissez-moi ce pare-feu comme vous pouvez !',
                    isLocked: true,
                    characterId: 'paj',
                    unlockDelay: 180,
                },
                {
                    id: 'h_firewall-puzzle_3',
                    text: 'Mais soufflez dessus, sacrebleu !',
                    isLocked: true,
                    characterId: 'paj',
                    unlockDelay: 360,
                },
            ],
        },

        {
            id: 'step_3_3',
            title: "Séquence d'orientation",
            description: '',
            componentId: 'orientation-puzzle',
            solution: '',
            hints: [
                {
                    id: 'h_orientation-puzzle_1',
                    text: 'C’est la séquence pour refermer la couche de sécurité du pare-feu.',
                    isLocked: true,
                    characterId: 'paj',
                    unlockDelay: 1,
                },
                {
                    id: 'h_orientation-puzzle_2',
                    text: 'Allez, il faut juste la reproduire, c’est pas sorcier normalement.',
                    isLocked: true,
                    characterId: 'paj',
                    unlockDelay: 180,
                },
                {
                    id: 'h_orientation-puzzle_3',
                    text: 'Bon... Il faut simplement faire les mouvements indiqués dans l’ordre.',
                    isLocked: true,
                    characterId: 'paj',
                    unlockDelay: 360,
                },
            ],
        },

        {
            id: 'step_3_4',
            title: 'GPS',
            description: '',
            componentId: 'gps-puzzle',
            solution: '',
            hints: [
                {
                    id: 'h_gps-puzzle_1',
                    text: 'Si vous arrivez pas à utiliser mon GPS au pire vous avez une chance sur 80 environ de trouver la bonne salle...',
                    isLocked: true,
                    characterId: 'fabien',
                    unlockDelay: 1,
                },
                {
                    id: 'h_gps-puzzle_2',
                    text: 'Pourtant il faut juste suivre les flèches...',
                    isLocked: true,
                    characterId: 'fabien',
                    unlockDelay: 180,
                },
                {
                    id: 'h_gps-puzzle_3',
                    text: 'Bon, alors il faut aller en salle 109.',
                    isLocked: true,
                    characterId: 'fabien',
                    unlockDelay: 360,
                },
            ],
        },

        // et4 en1a 1b 1c 1d : ChestCode
        {
            id: 'step_4_1',
            title: 'Coffre-fort',
            description: '',
            componentId: 'chest-puzzle',
            solution: '',
            hints: [
                {
                    id: 'h_chest-puzzle_1',
                    text: 'Essayez par tous les moyens de trouver ce mot de passe, la clé est à l’intérieur du coffre !',
                    isLocked: true,
                    characterId: 'fabien',
                    unlockDelay: 1,
                },
            ],
        },

        // fin : mettre le code trouvé dans la clef de Jacquot

        {
            id: 'step_win',
            title: 'Victoire',
            description: 'Fin de partie',
            componentId: 'victory-screen',
            solution: '-',
            hints: [],
        },
    ],
};
