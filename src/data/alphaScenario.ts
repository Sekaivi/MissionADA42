import { Scenario } from '@/types/scenario';

export const SCENARIO: Scenario = {
    id: 'scenario_alpha_01',
    name: 'Protocole Alpha',
    description: 'Première incursion dans le système.',
    defaultDuration: 3600,
    defaultTimeBeforeNextStep: 3000,
    steps: [
        {
            id: 'step_1_1',
            title: 'Texte simple',
            description: '',
            componentId: 'qcm-puzzle',
            solution: '',
            hints: [],
        },
        {
            id: 'step_1_2',
            title: 'Jeu de rotation',
            description: '',
            componentId: 'spin-puzzle',
            solution: '',
            hints: [],
        },
        {
            id: 'step_1_3',
            title: 'Jeu des couleurs',
            description: '',
            componentId: 'chromatic-puzzle',
            solution: '',
            hints: [],
        },
        {
            // etape 1 enigme 4 : code morse -> quizGame type text. Image morse dans le gdrive
            id: 'step_1_4',
            title: 'Code morse',
            description: '',
            componentId: 'morse-puzzle',
            solution: '',
            hints: [],
        },

        {
            // étape 2 énigme 1 : DNS : 4 post-it pour trouver le code : QuizGame type number
            id: 'step_2_1',
            title: 'DNS',
            description: '',
            componentId: 'dns-puzzle',
            solution: '',
            hints: [],
        },
        {
            // et2 en2 : IDE (mayssa)

            id: 'step_2_2',
            title: 'IDE',
            description: '',
            componentId: 'ide-puzzle',
            solution: '',
            hints: [],
        },
        {
            id: 'step_2_3',
            title: 'Jeu de code',
            description: '',
            componentId: 'coding-puzzle',
            solution: '',
            hints: [],
        },

        {
            // et3 en1 : post-it code : QuizGame type number
            id: 'step_3_1',
            title: 'Post-it',
            description: '',
            componentId: 'post-it-puzzle',
            solution: '',
            hints: [],
        },
        {
            // et3 en2 : Firewall (micro souffler)
            id: 'step_3_Z',
            title: 'Pare-feu',
            description: '',
            componentId: 'firewall-puzzle',
            solution: '',
            hints: [],
        },

        {
            id: 'step_3_3',
            title: "Séquence d'orientation",
            description: '',
            componentId: 'orientation-puzzle',
            solution: '',
            hints: [],
        },

        // et3 en4 : GPS (mess précisant que iPhone marche mais pas Android)

        // et4 en1a 1b 1c 1d : ChestCode
        {
            id: 'step_4_1',
            title: 'Coffre-fort',
            description: '',
            componentId: 'chest-puzzle',
            solution: '',
            hints: [],
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
