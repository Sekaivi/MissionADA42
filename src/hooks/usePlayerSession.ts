import { useEffect, useState } from 'react';

const STORAGE_KEY = 'alpha_escape_session';

interface SessionData {
    gameCode: string;
    pseudo: string;
    playerId: string;
    isPromoted?: boolean; // pour retenir si un joueur est devenu Hôte
}

export function usePlayerSession() {
    const [session, setSession] = useState<SessionData | null>(null);
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        // setTimeout pour sortir du cycle de rendu synchrone
        const timer = setTimeout(() => {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored) {
                try {
                    setSession(JSON.parse(stored));
                } catch (e) {
                    console.error('Session invalide', e);
                    localStorage.removeItem(STORAGE_KEY);
                }
            }
            setIsLoaded(true);
        }, 0);

        return () => clearTimeout(timer);
    }, []);

    const saveSession = (gameCode: string, pseudo: string, playerId: string) => {
        const data = { gameCode, pseudo, playerId };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        setSession(data);
    };

    // pour promouvoir le joueur Hôte localement
    const promoteSession = () => {
        if (session) {
            const newData = { ...session, isPromoted: true };
            localStorage.setItem(STORAGE_KEY, JSON.stringify(newData));
            setSession(newData);
        }
    };

    const clearSession = () => {
        localStorage.removeItem(STORAGE_KEY);
        setSession(null);
    };

    return { session, isLoaded, saveSession, promoteSession, clearSession };
}
