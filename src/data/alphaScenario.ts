import { GameScenario } from '@/types/scenario';

export const SCENARIO: GameScenario = {
    id: 'scenario_alpha_01',
    name: 'Protocole Alpha',
    description: 'Première incursion dans le système.',
    defaultDuration: 3035,
    defaultTimeBeforeNextStep: 3000,
    steps: [
        {
            id: 'step_1',
            title: 'Initialisation',
            description: 'Les joueurs doivent entrer le code affiché.',
            componentId: 'test-puzzle',
            solution: '1234',
            hints: [{ id: 'h1', text: "C'est écrit en gros.", isLocked: false }],
        },
        {
            id: 'step_2',
            title: 'Protocole colorimétrique',
            description: 'Les agents doivent reproduire la séquence de couleurs.',
            componentId: 'chromatic-puzzle',
            solution: 'Séquence correcte',
            hints: [
                {
                    id: 'h2a',
                    text: 'Il faut montrer des objets colorés à la caméra.',
                    isLocked: false,
                },
                { id: 'h2b', text: "L'ordre est affiché au début bouffon...", isLocked: true },
            ],
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
