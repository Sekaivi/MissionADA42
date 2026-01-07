import { useState } from 'react';

// Types
export type TerminalMessage = {
    id: number;
    sender: 'Virus' | 'Toi' | 'Système' | 'Prof';
    text: string;
};

const FINAL_KEY = 'SECURITE';
const HINTS = [
    {
        prof: 'M. Jaquot',
        text: "Réfléchissez... Quel est le mot que j'utilise tout le temps en CM  ?",
    },
    {
        prof: 'M. Goguey',
        text: "C'est un mot de 8 lettres. Sans ça, internet ne serait qu'une prison.",
    },
    { prof: 'M. Romanens', text: 'La première lettre commence par : S !' },
];

export function useDebogageGame() {
    const [input, setInput] = useState('');
    const [hintLevel, setHintLevel] = useState(0);
    const [isSuccess, setIsSuccess] = useState(false);
    const [messages, setMessages] = useState<TerminalMessage[]>([
        { id: 1, sender: 'Système', text: 'ALERTE : Noyau verrouillé par Ransomware.' },
        { id: 2, sender: 'Virus', text: "Vos fichiers m'appartiennent désormais." },
    ]);

    const addMessage = (sender: TerminalMessage['sender'], text: string) => {
        setMessages((prev) => [...prev, { id: Date.now(), sender, text }]);
    };

    const handleVerify = () => {
        const attempt = input.trim().toUpperCase();
        addMessage('Toi', `Exécution du script : ${attempt}`);

        if (attempt === FINAL_KEY) {
            // 1. VICTOIRE DANS LE JEU
            setTimeout(() => addMessage('Système', 'CLÉ VALIDÉE. INITIALISATION...'), 500);

            // 2. SAUVEGARDE GLOBALE (C'est ici que ça se joue)
            // On enregistre que le jeu est gagné pour la page Home
            if (typeof window !== 'undefined') {
                localStorage.setItem('escapeGame_status', 'success');
                // Optionnel : On peut aussi sauvegarder l'heure de fin pour calculer le score
                localStorage.setItem('escapeGame_endTime', Date.now().toString());
            }

            // 3. LANCEMENT ANIMATION
            setTimeout(() => setIsSuccess(true), 1500);
        } else {
            setTimeout(() => {
                const mockeries = ['Accès refusé.', 'Tu perds ton temps.', 'Faux. Essaye encore.'];
                addMessage('Virus', mockeries[Math.floor(Math.random() * mockeries.length)]);
            }, 600);
        }
    };

    const handleHelp = () => {
        if (hintLevel >= 3) return;
        const currentHint = HINTS[hintLevel];
        addMessage('Toi', "Demande d'assistance...");
        setTimeout(() => {
            addMessage('Prof', `${currentHint.prof} : ${currentHint.text}`);
            setHintLevel((prev) => prev + 1);
        }, 1000);
    };

    return { input, setInput, messages, hintLevel, isSuccess, handleVerify, handleHelp };
}
