// hooks/useGameEffects.ts
import { useEffect, useRef } from 'react';

import { GameState } from '@/types/game';

const STORAGE_KEY = 'escape_game_last_command_id';

// Ajout du paramètre onMessage
export function useGameEffects(
    gameState: GameState | null,
    onMessage: (text: string) => void // <--- Callback pour le parent
) {
    const lastCommandIdRef = useRef<number>(0);

    useEffect(() => {
        if (!gameState?.admin_command) return;

        const command = gameState.admin_command;

        // Récupération du localStorage...
        const storedId =
            typeof window !== 'undefined'
                ? parseInt(localStorage.getItem(STORAGE_KEY) || '0', 10)
                : 0;

        lastCommandIdRef.current = Math.max(lastCommandIdRef.current, storedId);

        if (command.id > lastCommandIdRef.current) {
            console.log('⚡ EFFET DÉCLENCHÉ :', command.type);

            switch (command.type) {
                case 'GLITCH':
                    document.body.classList.add('glitch-active');
                    setTimeout(() => document.body.classList.remove('glitch-active'), 2000);
                    break;

                case 'GYRO':
                    alert('⚠️ STABILISATION REQUISE !');
                    break;

                case 'INVERT':
                    document.documentElement.style.filter =
                        command.payload === 'on' ? 'invert(1)' : 'none';
                    break;

                case 'MESSAGE':
                    // AU LIEU DE L'ALERT : On appelle le callback du parent
                    if (typeof command.payload === 'string') {
                        onMessage(command.payload);
                    }
                    break;
            }

            lastCommandIdRef.current = command.id;
            localStorage.setItem(STORAGE_KEY, command.id.toString());
        }
    }, [gameState, onMessage]); // on ajoute onMessage aux dépendances
}
