import { PasswordRule } from '@/types/passwordGame';

export const PASSWORD_RULES: PasswordRule[] = [
    {
        id: 1,
        title: 'Length Check',
        description: 'Le mot de passe doit faire au moins 6 caractères.',
        validator: (input) => input.length >= 6,
    },
    {
        id: 2,
        title: 'Numeric Layer',
        description: 'Le mot de passe doit contenir au moins un chiffre.',
        validator: (input) => /\d/.test(input),
    },
    {
        id: 3,
        title: 'Protocol Syntax',
        description: 'Le mot de passe doit contenir la séquence : // ',
        validator: (input) => input.includes('//'),
    },
    {
        id: 4,
        title: 'Session Binding',
        description: "Le mot de passe doit contenir l'ID de session.",
        validator: (input, ctx) => input.includes(ctx.sessionId),
    },
    {
        id: 5,
        title: 'Checksum',
        description:
            'La somme de tous les chiffres du mot de passe doit correspondre à la somme ciblée.',
        validator: (input, ctx) => {
            const numbers = input.match(/\d/g);
            if (!numbers) return false;
            const sum = numbers.reduce((acc, curr) => acc + parseInt(curr), 0);
            return sum === ctx.requiredSum;
        },
    },
    {
        id: 6,
        title: 'Forbidden Characters',
        description: 'Le mot de passe ne doit pas contenir la lettre e.',
        validator: (input) => !/e/i.test(input),
    },
    {
        id: 7,
        title: 'PHP Version',
        description: 'Le mot doit inclure la dernière version de PHP.',
        validator: (input) => input.includes('8.5'),
    },
    {
        id: 8,
        title: 'Final Override',
        description:
            'Le mot de passe doit contenir le nom en majuscule du porteur de la chemise verte.',
        validator: (input) => input.includes('JACQUOT'),
    },
];
