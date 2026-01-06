import { useCallback, useEffect, useState } from 'react';

import { GameState } from '@/types/game';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export function useGameSync(gameCode: string | null, isGM: boolean = false) {
    const [gameState, setGameState] = useState<GameState | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    // polling
    const fetchState = useCallback(async () => {
        if (!gameCode) return;

        try {
            const res = await fetch(`${API_BASE}/game/read?code=${gameCode}`);
            const json = await res.json();

            if (json.status) {
                setGameState(json.data);
                setError(null);
            } else {
                // si la partie n'existe pas, on vide le state et on met l'erreur
                setGameState(null);
                setError(json.msg || 'Partie introuvable');
            }
        } catch (err) {
            console.error(err);
            setError('Impossible de joindre le serveur');
        }
    }, [gameCode]);

    // update (hôte)
    const updateState = async (newState: GameState) => {
        if (!gameCode) return;
        setGameState(newState);

        try {
            await fetch(`${API_BASE}/game/update`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ code: gameCode, state: newState }),
            });
            fetchState();
        } catch (err) {
            console.error(err);
            setError('Échec de la sauvegarde');
        }
    };

    // boucle de synchro
    useEffect(() => {
        // Cas 1 : Pas de code, on nettoie
        if (!gameCode) {
            const timer = setTimeout(() => {
                setGameState(null);
                setIsLoading(false);
                setError(null);
            }, 0);
            return () => clearTimeout(timer);
        }

        // Cas 2 : Code présent, on charge
        const startTimer = setTimeout(() => {
            setIsLoading(true);
            fetchState().finally(() => {
                setIsLoading(false);
            });
        }, 0);

        const intervalDelay = isGM ? 3000 : 1000;
        const interval = setInterval(fetchState, intervalDelay);

        return () => {
            clearTimeout(startTimer);
            clearInterval(interval);
        };
    }, [gameCode, isGM, fetchState]);

    return { gameState, updateState, error, isLoading, refresh: fetchState };
}

export async function createGame(): Promise<{ success: boolean; code?: string; msg?: string }> {
    try {
        const res = await fetch(`${API_BASE}/game/create`);
        const json = await res.json();
        return json.status
            ? { success: true, code: json.data.code }
            : { success: false, msg: json.msg };
    } catch {
        return { success: false, msg: 'Erreur réseau' };
    }
}
