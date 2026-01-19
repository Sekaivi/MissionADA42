'use client';

import React, { ReactNode, createContext, useContext } from 'react';

import { AnimatePresence } from 'framer-motion';

import { DialogueBox } from '@/components/dialogueBox';
import { EmergencyOverlay } from '@/components/overlays/EmergencyOverlay';
import { useGameLogic } from '@/hooks/useGameLogic';
import { createGame } from '@/hooks/useGameSync';
import { usePlayerSession } from '@/hooks/usePlayerSession';

interface EscapeGameContextType {
    isConnected: boolean;
    initialIsHost: boolean;
    pseudo: string;
    playerId: string;
    gameCode: string | null;
    logic: ReturnType<typeof useGameLogic> | null;
    createSessionAsHost: (pseudo: string) => Promise<boolean>;
    joinSession: (code: string, pseudo: string) => void;
    logout: () => void;
}

const EscapeGameContext = createContext<EscapeGameContextType | null>(null);

export const EscapeGameProvider = ({ children }: { children: ReactNode }) => {
    const { session, saveSession, clearSession, isLoaded } = usePlayerSession();

    const initialIsHost = !!session?.playerId?.startsWith('host-') || !!session?.isPromoted;
    const gameCode = session?.gameCode || null;
    const playerId = session?.playerId || '';
    const pseudo = session?.pseudo || '';

    const gameLogic = useGameLogic(gameCode, initialIsHost, playerId, pseudo);

    const createSessionAsHost = async (pseudo: string) => {
        const hostId = `host-${crypto.randomUUID().slice(0, 8)}`;
        const res = await createGame();
        if (res.success && res.code) {
            saveSession(res.code, pseudo, hostId);
            return true;
        }
        return false;
    };

    const joinSession = (code: string, pseudo: string) => {
        const pid = `player-${crypto.randomUUID().slice(0, 8)}`;
        saveSession(code.toUpperCase(), pseudo, pid);
    };

    const value: EscapeGameContextType = {
        isConnected: !!session,
        initialIsHost,
        pseudo,
        playerId,
        gameCode,
        logic: session ? gameLogic : null,
        createSessionAsHost,
        joinSession,
        logout: clearSession,
    };

    if (!isLoaded) return null;

    return (
        <EscapeGameContext.Provider value={value}>
            <div className="relative z-[51]">
                <DialogueBox
                    script={gameLogic.adminScript}
                    onComplete={() => gameLogic.setAdminDialogueOpen(false)}
                    isOpen={gameLogic.adminDialogueOpen}
                />
                <AnimatePresence>
                    {gameLogic.activeChallenge && (
                        <EmergencyOverlay
                            key={gameLogic.activeChallenge.id}
                            type={gameLogic.activeChallenge.type}
                            onResolve={gameLogic.handleChallengeResolved}
                        />
                    )}
                </AnimatePresence>
            </div>
            {children}
        </EscapeGameContext.Provider>
    );
};

export const useEscapeGame = () => {
    const context = useContext(EscapeGameContext);
    if (!context) throw new Error('useEscapeGame must be used within EscapeGameProvider');
    return context;
};
