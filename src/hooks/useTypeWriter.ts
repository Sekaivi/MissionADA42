// hooks/useTypewriter.ts
import { useState, useEffect, useRef, useCallback } from 'react';

export const useTypewriter = (text: string, speed: number = 30) => {
    const [displayedText, setDisplayedText] = useState('');
    const [isTyping, setIsTyping] = useState(false);

    // On utilise une référence pour garder une trace du timer
    // et pouvoir le tuer n'importe quand sans dépendre du cycle de rendu
    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    const clearTypingInterval = () => {
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }
    };

    useEffect(() => {
        // 1. Nettoyage préalable et reset
        clearTypingInterval();
        setDisplayedText('');
        setIsTyping(true);

        let currentIndex = 0;

        // 2. Démarrage de l'intervalle
        intervalRef.current = setInterval(() => {
            currentIndex++;

            // ASTUCE : On découpe la chaîne originale au lieu d'ajouter au state précédent.
            // Cela empêche les duplications de lettres ("HHeelllloo") si React re-rend le composant.
            setDisplayedText(text.slice(0, currentIndex));

            if (currentIndex >= text.length) {
                clearTypingInterval();
                setIsTyping(false);
            }
        }, speed);

        // Cleanup quand le composant est démonté ou que le texte change
        return clearTypingInterval;
    }, [text, speed]);

    // Fonction pour afficher tout immédiatement
    const completeText = useCallback(() => {
        clearTypingInterval(); // On tue le timer immédiatement
        setDisplayedText(text); // On force le texte complet
        setIsTyping(false);
    }, [text]);

    return { displayedText, isTyping, completeText };
};