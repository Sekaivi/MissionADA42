// src/utils/colorPresets.ts
import { ColorDefinition, RGB } from '@/types/colorDetection';

const isBright = ({ r, g, b }: RGB) => r > 50 || g > 50 || b > 50;

export const PRESETS: Record<string, ColorDefinition> = {
    ROUGE: {
        id: 'red',
        name: 'Rouge',
        displayHex: '#ff3333',
        match: ({ r, g, b }) => {
            // on durcit le rouge : il doit être presque 1.8x plus fort que le vert
            // avant: r > g * 1.5 (trop permissif pour l'orange)
            return isBright({ r, g, b }) && r > 130 && r > g * 1.8 && r > b * 2.0;
        },
    },
    ORANGE: {
        id: 'orange',
        name: 'Orange',
        displayHex: '#ff8800',
        match: ({ r, g, b }) => {
            return (
                isBright({ r, g, b }) &&
                r > 130 && // Rouge fort
                g > 80 && // Vert présent
                r > g && // Plus rouge que vert
                r < g * 2.5 && // Pas rouge pur
                // fix anti peau
                // sur la peau, le bleu est élevé (120 vs 180).
                // sur du vrai orange, très peu de bleu, donc on veut b < 40% du rouge
                b < r * 0.4 &&
                // sur l'orange, l'écart entre le vert et le bleu est grand.
                g - b > 30
            );
        },
    },
    JAUNE: {
        id: 'yellow',
        name: 'Jaune',
        displayHex: '#ffff33',
        match: ({ r, g, b }) => {
            // Jaune : Rouge et Vert sont élevés et proches
            return isBright({ r, g, b }) && r > 130 && g > 130 && b < 100 && Math.abs(r - g) < 50; // La différence entre R et V doit être faible
        },
    },
    VERT: {
        id: 'green',
        name: 'Vert',
        displayHex: '#33ff33',
        match: ({ r, g, b }) => {
            // seuil de luminosité (de 120 à 90) pour capter les verts mats
            const minGreen = 90;

            return (
                isBright({ r, g, b }) &&
                g > minGreen &&
                // rouge * 1.2 pour détecter un vert éclairé par une lampe jaune
                g > r * 1.2 &&
                // éviter le cyan
                g > b * 1.2
            );
        },
    },
    BLEU: {
        id: 'blue',
        name: 'Bleu',
        displayHex: '#3333ff',
        match: ({ r, g, b }) => isBright({ r, g, b }) && b > 120 && b > r * 1.4 && b > g * 1.4,
    },
    BLANC: {
        id: 'white',
        name: 'Blanc',
        displayHex: '#ffffff',
        match: ({ r, g, b }) => {
            // plus le seul de luminosité est haut (max 255), plus il faut un blanc éclatant
            const minLevel = 160;

            // tolérance de teinte (gris vs couleur)
            // l'écart entre les canaux doit être faible.
            // si R=200 et B=250, c'est du bleu clair, pas du blanc.
            const maxDiff = 40;

            return (
                r > minLevel &&
                g > minLevel &&
                b > minLevel &&
                Math.abs(r - g) < maxDiff &&
                Math.abs(g - b) < maxDiff &&
                Math.abs(b - r) < maxDiff
            );
        },
    },
    NOIR: {
        id: 'black',
        name: 'Noir',
        displayHex: '#000000',
        match: ({ r, g, b }) => {
            const maxLevel = 60; // tout doit être très sombre
            return r < maxLevel && g < maxLevel && b < maxLevel;
        },
    },
};
