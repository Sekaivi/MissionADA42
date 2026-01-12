import { GameScenario } from '@/types/scenario';

export const SCENARIO: GameScenario = {
    id: 'scenario_alpha_01',
    name: 'Protocole Alpha',
    description: 'Première incursion dans le système.',
    defaultDuration: 3600,
    defaultTimeBeforeNextStep: 3000,
    steps: [
        {
            id: 'step_1',
            title: 'QCM',
            description: '',
            componentId: 'qcm-puzzle',
            solution: '',
            hints: [],
        },
        {
            id: 'step_2',
            title: 'Jeu de rotation',
            description: '',
            componentId: 'spin-puzzle',
            solution: '',
            hints: [],
        },
        {
            id: 'step_3',
            title: 'Jeu des couleurs',
            description: '',
            componentId: 'chromatic-puzzle',
            solution: '',
            hints: [],
        },
        {
            id: 'step_4',
            title: 'Jeu de code',
            description: '',
            componentId: 'coding-puzzle',
            solution: '',
            hints: [],
        },
        {
            id: 'step_5',
            title: "Séquence d'orientation",
            description: '',
            componentId: 'orientation-puzzle',
            solution: '',
            hints: [],
        },
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
