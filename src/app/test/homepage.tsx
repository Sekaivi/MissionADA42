'use client';

import React, { useEffect, useState } from 'react';

import { HashtagIcon, PuzzlePieceIcon } from '@heroicons/react/24/outline';
import { clsx } from 'clsx';

import { WelcomeScreen } from '@/app/test/WelcomeScreen';
import { AlphaCircularGauge } from '@/components/alpha/AlphaCircularGauge';
import AlphaFeedbackPill from '@/components/alpha/AlphaFeedbackPill';
import { AlphaModal } from '@/components/alpha/AlphaModal';
import {
    ModuleAction,
    PUZZLE_COMPONENTS,
    PuzzleComponentId,
} from '@/components/puzzles/PuzzleRegistry';
import { DefeatScreen } from '@/components/puzzles/PuzzleRegistry';
import { useEscapeGame } from '@/context/EscapeGameContext';
import { SCENARIO } from '@/data/alphaScenario';
import { GameState } from '@/types/game';

interface HomepageProps {
    missionStatus?: string;
    missionStep?: number;
    isTimerRunning?: boolean;
    isTimeUp?: boolean;
    notificationCount?: number;
    activePuzzleId?: string | null;
    gameState?: GameState | null;
    onPuzzleSolve?: (id?: string, data?: Record<string, unknown>) => void;
    isValidationPending?: boolean;
    onVoteReady?: () => void;
    isPlayerReady?: boolean;
    lastModuleAction?: ModuleAction | null;
    showLobby?: boolean;
}

const formatTime = (seconds: number) => {
    if (isNaN(seconds) || seconds < 0) return '00:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

export default function Homepage({
    missionStatus,
    missionStep,
    isTimerRunning = false,
    isTimeUp = false,
    activePuzzleId,
    gameState,
    onPuzzleSolve,
    isValidationPending,
    onVoteReady,
    isPlayerReady,
    lastModuleAction,
    showLobby = false,
}: HomepageProps) {
    const { gameCode, logic } = useEscapeGame();

    const isHost = logic?.isHost || false;
    const timerEndTime = logic?.timerEndTime || 0;
    const totalDuration = logic?.currentTotalDuration || SCENARIO.defaultDuration;
    const isGameActive = !!missionStatus;

    const [showModal, setShowModal] = useState(false);

    const [now, setNow] = useState(0);

    // 'now' contient toujours l'heure réelle ou 0
    useEffect(() => {
        const initTimer = setTimeout(() => setNow(Date.now()), 0);

        if (!isGameActive || !isTimerRunning) return;

        const interval = setInterval(() => {
            setNow(Date.now());
        }, 1000);

        return () => {
            clearTimeout(initTimer);
            clearInterval(interval);
        };
    }, [isGameActive, isTimerRunning]);

    useEffect(() => {
        const timer = setTimeout(() => {
            // ouvre la modale uniquement si une validation commence, qu'on n'est pas l'hôte,
            // et qu'on n'a pas encore voté
            if (isValidationPending && !isHost && !isPlayerReady) {
                setShowModal(true);
            } else {
                setShowModal(false);
            }
        }, 0);

        return () => clearTimeout(timer);
    }, [isValidationPending, isHost, isPlayerReady]);

    const handleVoteAndClose = () => {
        if (onVoteReady) onVoteReady(); // envoie le vote au serveur
        setShowModal(false);
    };

    // calcul du temps restant
    let remainingSeconds: number;

    if (now === 0) {
        // chargement initial
        remainingSeconds = totalDuration;
    } else if (!isTimerRunning && isGameActive && gameState?.startTime && gameState?.lastUpdate) {
        // victoire => figé
        // calcule la durée réelle de la partie : Restant = Durée Max - (Fin - Début)
        const elapsedMs = gameState.lastUpdate - gameState.startTime;
        const remainingMs = totalDuration * 1000 - elapsedMs;
        remainingSeconds = Math.max(0, Math.floor(remainingMs / 1000));
    } else {
        // jeu en cours : Restant = Date de fin prévue - Heure actuelle
        remainingSeconds = Math.max(0, Math.floor((timerEndTime - now) / 1000));
    }

    if (isTimeUp) remainingSeconds = 0;

    const percentage = Math.min(100, Math.max(0, (remainingSeconds / totalDuration) * 100));
    const timeString = formatTime(remainingSeconds);

    const variant = percentage < 20 ? 'error' : percentage < 50 ? 'warning' : 'success';

    // puzzle actif (registre)
    const ActivePuzzle = activePuzzleId
        ? PUZZLE_COMPONENTS[activePuzzleId as PuzzleComponentId]
        : null;

    return (
        <>
            {isGameActive && (
                <>
                    <div className="bg-surface-highlight rounded p-2">
                        <div className="text-muted mb-1 flex items-center gap-1">
                            <HashtagIcon className="h-3 w-3" /> SESSION
                        </div>
                        <div className="text-brand-emerald font-mono text-2xl font-black tracking-widest">
                            {gameCode}
                        </div>
                    </div>

                    <div
                        className={clsx(
                            'mx-auto transition-all duration-500',
                            isGameActive
                                ? 'h-32 w-32 scale-100 opacity-100'
                                : 'h-0 scale-90 overflow-hidden opacity-0'
                        )}
                    >
                        <AlphaCircularGauge
                            progress={percentage}
                            variant={isTimeUp ? 'error' : variant}
                            size="h-32 w-32"
                            strokeWidth={8}
                            showGlow={variant === 'error' || isTimeUp}
                        >
                            <div className="text-center">
                                <div
                                    className={clsx(
                                        'text-2xl font-black tracking-tighter',
                                        variant === 'error' || isTimeUp
                                            ? 'text-brand-error animate-pulse'
                                            : 'text-muted'
                                    )}
                                >
                                    {timeString}
                                </div>
                                <div className="text-muted text-xs font-bold uppercase">
                                    {isTimeUp ? 'ÉCHEC' : 'RESTANT'}
                                </div>
                            </div>
                        </AlphaCircularGauge>
                    </div>

                    <div className={'text-center'}>
                        {!isTimeUp && (
                            <AlphaFeedbackPill
                                message={isValidationPending ? 'SUCCÈS' : 'EN COURS'}
                                type={isValidationPending ? 'success' : 'info'}
                                pulse={isValidationPending}
                            />
                        )}
                    </div>

                </>
            )}

            {/* main content */}
            <>
                {isGameActive ? (
                    <>
                        {/* modale de validation */}
                        <AlphaModal
                            isOpen={showModal}
                            variant={'success'}
                            title={"L'équipe se regroupe !"}
                            message={
                                "La solution a été validée. Confirmez votre présence pour passer à l'étape suivante."
                            }
                            // joueur est prêt => n'affiche plus le bouton (normalement la modale se ferme avant)
                            actionLabel={!isPlayerReady ? 'JE SUIS PRÊT' : undefined}
                            onAction={handleVoteAndClose}
                            onClose={() => setShowModal(false)}
                        />

                        {isTimeUp ? (
                            <div className="animate-in fade-in zoom-in mt-8 duration-500">
                                <DefeatScreen />
                            </div>
                        ) : (
                            <>
                                <h2 className="text-muted text-center text-xs font-bold uppercase">
                                    Mission &bull; Étape {missionStep}
                                </h2>
                                <h1 className="text-brand-emerald text-center text-2xl font-black">
                                    {missionStatus}
                                </h1>

                                {/* ZONE PUZZLE */}
                                <>
                                    {ActivePuzzle ? (
                                        <ActivePuzzle
                                            onSolve={onPuzzleSolve || (() => {})}
                                            isSolved={false}
                                            data={gameState || undefined}
                                            lastModuleAction={lastModuleAction}
                                        />
                                    ) : (
                                        <div className="text-muted flex flex-col items-center justify-center text-center">
                                            <PuzzlePieceIcon
                                                className={'h-12 w-12 animate-pulse'}
                                            />
                                            <p className="mt-2 text-sm italic">
                                                Synchronisation du module...
                                            </p>
                                            <span className="font-mono text-xs">
                                                ID: {activePuzzleId}
                                            </span>
                                        </div>
                                    )}
                                </>
                            </>
                        )}
                    </>
                ) : (
                    // accueil
                    <WelcomeScreen showLobby={showLobby} />
                )}
            </>
        </>
    );
}
