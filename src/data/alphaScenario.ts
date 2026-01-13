import { GameScenario } from '@/types/scenario';

export const SCENARIO: GameScenario = {
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

        // étape 2 énigme 1 : DNS : 4 post-it pour trouver le code : QuizGame type number

        // et2 en2 : IDE (mayssa)

        {
            id: 'step_4',
            title: 'Jeu de code',
            description: '',
            componentId: 'coding-puzzle',
            solution: '',
            hints: [],
        },

        // et3 en1 : post-it code : QuizGame type number

        // et3 en2 : Firewall (micro souffler)

        {
            id: 'step_5',
            title: "Séquence d'orientation",
            description: '',
            componentId: 'orientation-puzzle',
            solution: '',
            hints: [],
        },

        // et3 en4 : GPS (mess précisant que iPhone marche mais pas Android)

        // et4 en1a 1b 1c 1d : ChestCode

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
