export const normalizeText = (text: string | number) => {
    return String(text)
        .toLowerCase()
        .normalize('NFD') // sépare les accents des lettres
        .replace(/[\u0300-\u036f]/g, '') // supprime les accents
        .trim();
};
