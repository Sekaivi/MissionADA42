import { GameScenario } from '@/types/scenario';

export const ALPHA_SCENARIO: GameScenario = {
    id: 'scenario_alpha_01',
    name: 'Protocole Alpha',
    description: 'Première incursion dans le système.',
    defaultDuration: 3035,
    steps: [
        {
            id: 'step_1',
            title: 'Initialisation',
            description: 'Les joueurs doivent entrer le code affiché.',
            componentId: 'tutorial-code',
            solution: '1234',
            hints: [{ id: 'h1', text: "C'est écrit en gros.", isLocked: false }],
            dialogues: [{ speaker: 'HQ', message: 'Agents, identifiez-vous.' }],
        },
        {
            id: 'step_2',
            title: 'Surcharge',
            description: 'Logique pure.',
            componentId: 'logic-circuit',
            solution: 'Flux Rouge',
            hints: [],
            dialogues: [{ speaker: 'AI', message: 'Attention, énergie instable.' }],
        },
        {
            id: 'step_win',
            title: 'Victoire',
            description: 'Fin de partie',
            componentId: 'victory-screen',
            solution: '-',
            hints: [],
            dialogues: [],
        },
    ],
};
