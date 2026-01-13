// data/characters.ts
import { Character } from '@/types/dialogue';

export const CHARACTERS: Record<string, Character> = {
    harry: {
        id: 'harry',
        name: 'Harry',
        avatars: {
            default: '/images/avatars/shrekos.jpg',
            scared: '/images/avatars/shrekos_scared.png',
            happy: '/images/avatars/shrekos_happy.webp',
        },
        defaultSide: 'left',
    },
    unknown: {
        id: 'fanfaron-mystérieux',
        name: 'Fanfaron mystérieux',
        avatars: {
            default: '/images/avatars/mysterious.jpg',
        },
        defaultSide: 'left',
    },
    fabien: {
        id: 'fabien',
        name: 'Fabien Romanens',
        avatars: {
            default: '/images/avatars/fabos.jpeg',
            shocked: '/images/avatars/fabos_shocked.jpeg',
        },
        defaultSide: 'right',
    },
    system: {
        id: 'system',
        name: 'SYSTEM',
        avatars: {
            default: '/images/avatars/mettaton.webp',
            error: '/images/avatars/mettaton_error.webp',
        },
        defaultSide: 'left',
    },
    paj: {
        id: 'paj',
        name: 'Pierre-Alain Jacquot',
        avatars: {
            default: '/images/avatars/paj.png',
        },
        defaultSide: 'right',
    },
    goguey: {
        id: 'goguey',
        name: 'Alix Goguey',
        avatars: {
            default: '/images/avatars/alixgoguey.jpg',
        },
        defaultSide: 'right',
    },
};
