export const CHARACTERS = {
    harry: {
        id: 'harry',
        name: 'Harry',
        avatars: {
            default: '/images/avatars/harry/harry_final.gif',
        },
        defaultSide: 'left',
    },
    unknown: {
        id: 'fanfaron-mystérieux',
        name: 'Fanfaron mystérieux',
        avatars: {
            default: '/images/avatars/harry/glitch.gif',
        },
        defaultSide: 'left',
    },
    fabien: {
        id: 'fabien',
        name: 'Fabien Romanens',
        avatars: {
            default: '/images/avatars/romanens/default.gif',
            shocked: '/images/avatars/romanens/shocked.gif',
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
            default: '/images/avatars/jacquot/default.gif',
            angry: '/images/avatars/jacquot/angry.gif',
        },
        defaultSide: 'right',
    },
    goguey: {
        id: 'goguey',
        name: 'Alix Goguey',
        avatars: {
            default: '/images/avatars/goguey/default.gif',
            happy: '/images/avatars/goguey/happy.gif',
        },
        defaultSide: 'right',
    },
    beatlesBOB: {
        id: 'beatlesBOB',
        name: 'beatlesBOB',
        avatars: {
            default: '/images/avatars/beatlesBOB.webp',
        },
        defaultSide: 'right',
    },
} as const;

export type CharacterId = keyof typeof CHARACTERS;
