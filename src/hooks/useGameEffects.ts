// hooks/useGameEffects.ts
import { useCallback, useEffect, useRef } from 'react';

import { GameState } from '@/types/game';

const STORAGE_KEY_COMMAND = 'escape_last_command_id';
const STORAGE_KEY_CHALLENGE = 'escape_resolved_challenge_id';

export function useGameEffects(
    gameState: GameState | null,
    callbacks: {
        onMessage: (text: string) => void;
        onChallenge: (type: string, id: number) => void;
        onChallengeClear: () => void;
    }
) {
    // init à 0, elles seront synchronisées dans les effets
    const lastProcessedCommandId = useRef<number>(0);
    const lastTriggeredChallengeId = useRef<number>(0);

    const resolveChallenge = useCallback((id: number) => {
        if (typeof window === 'undefined') return;
        const currentMax = parseInt(localStorage.getItem(STORAGE_KEY_CHALLENGE) || '0', 10);
        localStorage.setItem(STORAGE_KEY_CHALLENGE, Math.max(currentMax, id).toString());
    }, []);

    // COMMANDES ÉPHÉMÈRES
    useEffect(() => {
        if (!gameState?.admin_command) return;
        const cmd = gameState.admin_command;

        // lecture synchrone du storage = vérité absolu de ce qu'on a déjà vu
        const storedCmdId =
            typeof window !== 'undefined'
                ? parseInt(localStorage.getItem(STORAGE_KEY_COMMAND) || '0', 10)
                : 0;

        // si la commande reçue est plus vieille ou égale à ce qu'on a stocké => on arrête
        if (cmd.id <= storedCmdId) {
            // màj la ref juste pour être propre mais on n'exécute rien
            lastProcessedCommandId.current = Math.max(lastProcessedCommandId.current, storedCmdId);
            return;
        }

        console.log('Nouvelle commande reçue :', cmd.type);

        // marquer lu pour éviter les doubles exécutions
        localStorage.setItem(STORAGE_KEY_COMMAND, cmd.id.toString());
        lastProcessedCommandId.current = cmd.id;

        // exe
        if (cmd.type === 'MESSAGE' && typeof cmd.payload === 'string') {
            callbacks.onMessage(cmd.payload);
        } else if (cmd.type === 'GLITCH') {
            document.body.classList.add('glitch-active');
            setTimeout(() => document.body.classList.remove('glitch-active'), 2000);
        } else if (cmd.type === 'INVERT') {
            document.documentElement.style.filter = cmd.payload === 'on' ? 'invert(1)' : 'none';
        }
    }, [gameState?.admin_command, callbacks]);

    // CHALLENGES & NETTOYAGE
    useEffect(() => {
        // PAS DE CHALLENGE SUR LE SERVEUR (Admin a arrêté)
        if (!gameState?.active_challenge) {
            // si challenge en cours localement
            if (lastTriggeredChallengeId.current !== 0) {
                console.log("Arrêt du challenge par l'admin");

                // ferme l'interface + message rp
                callbacks.onChallengeClear();
                callbacks.onMessage('ALERTE ANNULÉE : Faux positif détecté par le système.');

                // reset
                lastTriggeredChallengeId.current = 0;
            }
            return;
        }

        // CHALLENGE ACTIF
        const challenge = gameState.active_challenge;

        const resolvedId =
            typeof window !== 'undefined'
                ? parseInt(localStorage.getItem(STORAGE_KEY_CHALLENGE) || '0', 10)
                : 0;

        // si déjà résolu ou déjà ouvert dans cette session => on ignore
        if (challenge.id <= resolvedId || challenge.id === lastTriggeredChallengeId.current) return;

        console.log('🔥 ACTIVATION CHALLENGE :', challenge.type);
        lastTriggeredChallengeId.current = challenge.id;
        callbacks.onChallenge(challenge.type, challenge.id);
    }, [gameState?.active_challenge, callbacks]);

    return { resolveChallenge };
}
