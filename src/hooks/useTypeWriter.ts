// hooks/useTypewriter.ts
import { useState, useEffect } from 'react';

export const useTypewriter = (text: string, speed: number = 30) => {
    const [displayedText, setDisplayedText] = useState('');
    const [isTyping, setIsTyping] = useState(false);

    useEffect(() => {
        setDisplayedText('');
        setIsTyping(true);
        let index = 0;

        const intervalId = setInterval(() => {
            // Ajoute une lettre à la fois
            setDisplayedText((prev) => prev + text.charAt(index));
            index++;

            if (index === text.length) {
                clearInterval(intervalId);
                setIsTyping(false);
            }
        }, speed);

        return () => clearInterval(intervalId);
    }, [text, speed]);

    // Fonction pour afficher tout le texte instantanément (skip)
    const completeText = () => {
        setDisplayedText(text);
        setIsTyping(false);
    };

    return { displayedText, isTyping, completeText };
};