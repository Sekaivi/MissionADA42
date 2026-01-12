'use client';

import React, { useCallback, useEffect, useState } from 'react';

import {
    ArrowDownIcon,
    ArrowLeftIcon,
    ArrowRightIcon,
    ArrowUpIcon,
    DevicePhoneMobileIcon,
    StopCircleIcon,
} from '@heroicons/react/24/solid';

import { AlphaButton } from '@/components/alpha/AlphaButton';
import { AlphaCard } from '@/components/alpha/AlphaCard';
import { AlphaError } from '@/components/alpha/AlphaError';
import { AlphaGrid } from '@/components/alpha/AlphaGrid';
import { AlphaInfoRow } from '@/components/alpha/AlphaInfoRow';
import { AlphaModal } from '@/components/alpha/AlphaModal';
import { AlphaSuccess } from '@/components/alpha/AlphaSuccess';
import { DialogueBox } from '@/components/dialogueBox';
import { PuzzleProps } from '@/components/puzzles/PuzzleRegistry';
import { SCENARIO } from '@/data/alphaScenario';
import { useGameScenario, useScenarioTransition } from '@/hooks/useGameScenario';
import { useOrientation } from '@/hooks/useOrientation';
import { useOrientationGesture } from '@/hooks/useOrientationGesture';
import { Direction } from '@/types/orientation';

// config du mini jeu
export type OrientationPuzzleGameState = 'intro' | 'playing' | 'won';
const GAME_LENGTH = 1;
const POSSIBLE_DIRECTIONS: Direction[] = ['Haut', 'Bas', 'Gauche', 'Droite'];

const DIRECTION_CONFIG: Record<
    string,
    { label: string; Icon: React.ElementType; color: string; border: string }
> = {
    // couleurs brutes
    Haut: {
        label: 'HAUT',
        Icon: ArrowDownIcon,
        color: 'text-blue-400',
        border: 'border-blue-500',
    },
    Droite: {
        label: 'DROITE',
        Icon: ArrowRightIcon,
        color: 'text-purple-400',
        border: 'border-purple-500',
    },
    Bas: {
        label: 'BAS',
        Icon: ArrowUpIcon,
        color: 'text-orange-400',
        border: 'border-orange-500',
    },
    Gauche: {
        label: 'GAUCHE',
        Icon: ArrowLeftIcon,
        color: 'text-pink-400',
        border: 'border-pink-500',
    },
    Stable: {
        label: 'STABLE',
        Icon: StopCircleIcon,
        color: 'text-muted',
        border: 'border-border',
    },
};

export const OrientationPuzzle: React.FC<PuzzleProps> = ({ onSolve, isSolved, scripts = {} }) => {
    const { gameState, triggerPhase, isDialogueOpen, currentScript, onDialogueComplete } =
        useGameScenario<OrientationPuzzleGameState>(scripts);

    const { data, error, permissionGranted, requestPermission } = useOrientation();

    const { instantDirection, validatedDirection } = useOrientationGesture(data, {
        threshold: 30,
        stableTime: 500,
    });

    // states
    const [sequence, setSequence] = useState<Direction[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [hasSensorData, setHasSensorData] = useState(false);

    useEffect(() => {
        if (!hasSensorData && (data.alpha !== 0 || data.beta !== 0 || data.gamma !== 0)) {
            const timer = setTimeout(() => setHasSensorData(true), 0);
            return () => clearTimeout(timer);
        }
    }, [data, hasSensorData]);

    // jeu
    const generateSequence = useCallback(() => {
        const newSeq: Direction[] = [];
        let lastDir: Direction | null = null;

        for (let i = 0; i < GAME_LENGTH; i++) {
            let nextDir: Direction;
            do {
                nextDir =
                    POSSIBLE_DIRECTIONS[Math.floor(Math.random() * POSSIBLE_DIRECTIONS.length)];
            } while (nextDir === lastDir);

            newSeq.push(nextDir);
            lastDir = nextDir;
        }
        setSequence(newSeq);
    }, []);

    const startGame = () => {
        generateSequence();
        setCurrentIndex(0);
        triggerPhase('playing');
    };

    // boucle de validation
    useEffect(() => {
        if (gameState !== 'playing') return;

        const targetDirection = sequence[currentIndex];

        if (validatedDirection === targetDirection) {
            const timer = setTimeout(() => {
                const nextIndex = currentIndex + 1;

                setCurrentIndex(nextIndex);

                if (nextIndex >= sequence.length) {
                    triggerPhase('won');
                }
            }, 200);

            return () => clearTimeout(timer);
        }
    }, [validatedDirection, currentIndex, gameState, sequence, triggerPhase]);

    // helpers pour l'affichage
    const currentDir = sequence[currentIndex];
    // fallback safe si l'index dépasse la taille du tableau (écran de victoire)
    const targetConfig = currentDir ? DIRECTION_CONFIG[currentDir] : DIRECTION_CONFIG['Stable'];

    const TargetIcon = targetConfig.Icon;
    const CurrentGestureIcon = DIRECTION_CONFIG[instantDirection].Icon;
    const ValidatedGestureIcon = DIRECTION_CONFIG[validatedDirection].Icon;

    // init
    useEffect(() => {
        triggerPhase('intro');
    }, [triggerPhase]);

    // transitions automatiques après dialogues
    useScenarioTransition(gameState, isDialogueOpen, {
        won: () => {
            setTimeout(() => onSolve(), SCENARIO.defaultTimeBeforeNextStep);
        },
    });

    if (isSolved) return <AlphaSuccess message={'SÉQUENCE VALIDÉE'} />;

    return (
        <>
            <DialogueBox
                isOpen={isDialogueOpen}
                script={currentScript}
                onComplete={onDialogueComplete}
            />

            <AlphaModal
                isOpen={gameState === 'won' && !isDialogueOpen}
                message={'Protocole complété avec succès.'}
                autoCloseDuration={SCENARIO.defaultTimeBeforeNextStep}
                durationUnit={'ms'}
            />

            {/* cas iOS demande la permission */}
            {!permissionGranted && !error && (
                <AlphaCard title={'Permissions requises'}>
                    <p className="mb-4">Accès gyroscope requis pour le protocole.</p>
                    <AlphaButton onClick={requestPermission}>Initialiser les Capteurs</AlphaButton>
                </AlphaCard>
            )}

            <AlphaError message={error} />

            {permissionGranted && !hasSensorData && (
                <AlphaError message="En attente de signal... (Sur PC : Ouvrez DevTools > Sensors)" />
            )}

            {permissionGranted && (
                <AlphaGrid>
                    {/* col 1 : mini jeu */}
                    <AlphaCard
                        title={`Séquence de Sécurité [${currentIndex}/${sequence.length}]`}
                        contentClassName={'space-y-6'}
                    >
                        {gameState === 'intro' && (
                            <div className="my-6 space-y-6 text-center">
                                <DevicePhoneMobileIcon className="mx-auto h-18 w-18" />
                                <p className="text-muted">
                                    Une série de directions va s'afficher.
                                    <br />
                                    Inclinez votre appareil pour les valider une par une.
                                </p>
                                <AlphaButton onClick={startGame}>Démarrer la Séquence</AlphaButton>
                            </div>
                        )}

                        {gameState === 'won' && (
                            <div className="my-6 space-y-6 text-center">
                                <AlphaSuccess message={'Protocole complété avec succès.'} />
                                <AlphaButton onClick={startGame}>Nouvelle Séquence</AlphaButton>
                            </div>
                        )}

                        {gameState === 'playing' && sequence.length > 0 && (
                            <div className="flex flex-col items-center justify-center space-y-4">
                                {/* mouvement cible à effectuer */}
                                <div
                                    className={`bg-surface relative flex h-40 w-40 items-center justify-center rounded-full border-4 shadow-[0_0_30px_rgba(0,0,0,0.2)] transition-colors duration-300 ${DIRECTION_CONFIG[sequence[currentIndex]].border}`}
                                >
                                    <TargetIcon
                                        className={`h-24 w-24 transition-colors ${DIRECTION_CONFIG[sequence[currentIndex]].color}`}
                                    />
                                </div>

                                <span className="text-lg font-bold">
                                    {sequence[currentIndex].toUpperCase()}
                                </span>

                                {/* barre de progression (dots) */}
                                <div className="flex gap-2">
                                    {sequence.map((dir, idx) => (
                                        <div
                                            key={idx}
                                            className={`h-3 w-3 rounded-full transition-all duration-300 ${
                                                idx < currentIndex
                                                    ? 'bg-brand-emerald shadow-[0_0_8px_var(--color-brand-emerald)]' // validé
                                                    : idx === currentIndex
                                                      ? 'bg-foreground scale-125 animate-pulse' // current
                                                      : 'bg-surface-highlight' // next
                                            }`}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}
                    </AlphaCard>

                    {/* col 2 : feedback */}
                    <AlphaCard title="État des Capteurs" contentClassName={'space-y-6'}>
                        <div className="border-border bg-surface-highlight/30 relative mx-auto flex h-32 w-32 items-center justify-center rounded-full border-2 border-dashed">
                            {/* réticule */}
                            <div className="bg-border absolute h-full w-[1px]" />
                            <div className="bg-border absolute h-[1px] w-full" />

                            <CurrentGestureIcon
                                className={`h-16 w-16 transition-all duration-200 ${
                                    instantDirection !== 'Stable'
                                        ? DIRECTION_CONFIG[instantDirection].color
                                        : 'text-muted'
                                }`}
                            />
                        </div>

                        <div>
                            <AlphaInfoRow
                                label={'Détecté :'}
                                value={
                                    <span
                                        className={`flex items-center gap-2 font-bold ${instantDirection !== 'Stable' ? 'text-brand-blue' : 'text-muted'}`}
                                    >
                                        <CurrentGestureIcon className="h-4 w-4" />
                                        {instantDirection}
                                    </span>
                                }
                            />

                            <AlphaInfoRow
                                label={'Validé :'}
                                value={
                                    <span
                                        className={`flex items-center gap-2 font-bold ${validatedDirection !== 'Stable' ? 'text-brand-emerald' : 'text-muted'}`}
                                    >
                                        <ValidatedGestureIcon className="h-4 w-4" />
                                        {validatedDirection}
                                    </span>
                                }
                            />
                        </div>

                        <p className="text-muted text-center text-xs">
                            Maintenez l'inclinaison jusqu'à ce que la validation passe au vert.
                        </p>
                    </AlphaCard>
                </AlphaGrid>
            )}
        </>
    );
};
