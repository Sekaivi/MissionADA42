'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { ArrowPathIcon, CheckIcon, QuestionMarkCircleIcon } from '@heroicons/react/24/solid';
import clsx from 'clsx';

import { AlphaButton } from '@/components/alpha/AlphaButton';
import { AlphaCard } from '@/components/alpha/AlphaCard';
import { AlphaError } from '@/components/alpha/AlphaError';
import AlphaFeedbackPill from '@/components/alpha/AlphaFeedbackPill';
import { AlphaModal } from '@/components/alpha/AlphaModal';
import { AlphaSuccess } from '@/components/alpha/AlphaSuccess';
import { DialogueBox } from '@/components/dialogueBox';
import { SCENARIO } from '@/data/alphaScenario';
import { useGameScenario, useScenarioTransition } from '@/hooks/useGameScenario';
import { ColorDefinition } from '@/types/colorDetection';

import { PuzzlePhases, PuzzleProps } from './PuzzleRegistry';

export type ChromaticPuzzlePhases = PuzzlePhases | 'memory' | 'scan';

interface ChromaticConfig {
    sequence: ColorDefinition[];
}

interface AlphaSequenceDisplayProps {
    sequence: string[];
    presets: ColorDefinition[];
    gameState: ChromaticPuzzlePhases;
    step: number;
    className?: string;
}

export const AlphaSequenceDisplay: React.FC<AlphaSequenceDisplayProps> = ({
    sequence,
    presets,
    gameState,
    step,
    className,
}) => {
    return (
        <div className={clsx('flex flex-wrap justify-center gap-4', className)}>
            {sequence.map((colorId, index) => {
                const preset = presets.find((p) => p.id === colorId);
                if (!preset) return null;

                const isMemory = gameState === 'memory';
                const isCompleted = index < step && !isMemory;
                const isActive = index === step && gameState === 'scan';
                const isPending = !isMemory && !isCompleted && !isActive;

                const dynamicStyle: React.CSSProperties =
                    isMemory || isCompleted
                        ? { backgroundColor: preset.displayHex, borderColor: preset.displayHex }
                        : {};

                return (
                    <div
                        key={index}
                        style={dynamicStyle}
                        className={clsx(
                            'flex h-14 w-14 items-center justify-center rounded-full border-4 font-bold transition-all duration-300',
                            isMemory && 'scale-110 text-white shadow-lg',
                            isCompleted && 'scale-90 text-white opacity-50',
                            isActive && 'scale-125 animate-bounce border-current bg-transparent',
                            isPending && 'border-gray-300 bg-gray-100 text-gray-300'
                        )}
                    >
                        {!isMemory && (
                            <>
                                {isCompleted ? (
                                    <CheckIcon className="h-8 w-8" />
                                ) : (
                                    <QuestionMarkCircleIcon className="h-8 w-8" />
                                )}
                            </>
                        )}
                    </div>
                );
            })}
        </div>
    );
};

export const ChromaticPuzzle = ({
    onSolve,
    isSolved,
    scripts = {},
    puzzleConfig,
    lastModuleAction,
}: PuzzleProps<ChromaticPuzzlePhases, ChromaticConfig>) => {
    const GAME_PRESETS = useMemo(() => puzzleConfig?.sequence || [], [puzzleConfig?.sequence]);
    const MEMO_TIME = useMemo(() => {
        return GAME_PRESETS.length > 0 ? Math.max(3, Math.ceil(GAME_PRESETS.length * 1.5)) : 0;
    }, [GAME_PRESETS.length]);

    const { gameState, triggerPhase, isDialogueOpen, currentScript, onDialogueComplete } =
        useGameScenario<ChromaticPuzzlePhases>(scripts);

    const displayPhase = (gameState === 'idle' ? 'init' : gameState) as ChromaticPuzzlePhases;

    const [sequence, setSequence] = useState<string[]>([]);
    const [step, setStep] = useState(0);
    const [, setTimeLeft] = useState(MEMO_TIME);
    const [feedbackMsg, setFeedbackMsg] = useState('Initialisation...');

    const lastProcessedActionTime = useRef<number>(0);

    const generateSequence = useCallback(() => {
        if (GAME_PRESETS.length === 0) return;
        const availableIds = GAME_PRESETS.map((p) => p.id);
        // shuffle
        for (let i = availableIds.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [availableIds[i], availableIds[j]] = [availableIds[j], availableIds[i]];
        }
        setSequence(availableIds);
    }, [GAME_PRESETS]);

    const startGame = useCallback(() => {
        generateSequence();
        triggerPhase('memory');
        setStep(0);
        setTimeLeft(MEMO_TIME);
        setFeedbackMsg(`Mémorisez : ${MEMO_TIME}s`);
    }, [generateSequence, triggerPhase, MEMO_TIME]);

    // timer phase mémoire
    useEffect(() => {
        if (gameState !== 'memory') return;
        const timer = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    triggerPhase('scan');
                    setFeedbackMsg('SCANNEZ');
                    return 0;
                }
                setFeedbackMsg(`Mémorisez : ${prev - 1}s`);
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(timer);
    }, [gameState, triggerPhase]);

    // écoute module externe
    useEffect(() => {
        if (gameState !== 'scan') return;
        // pendant la phase de scan

        // SÉCURITÉ :
        // si pas d'action, on sort
        // si action déjà traitée (timestamp identique), on sort
        if (!lastModuleAction || lastModuleAction.timestamp === lastProcessedActionTime.current) {
            return;
        }

        // on flag comme traitée immédiatement pour ne pas y revenir
        lastProcessedActionTime.current = lastModuleAction.timestamp;

        console.log('ChromaticPuzzle : Nouvelle action reçue : ', lastModuleAction);

        if (lastModuleAction?.id === 'color_scanner' && lastModuleAction.data) {
            const scannedColorData = lastModuleAction.data;
            const scannedId = scannedColorData.id;

            const expectedId = sequence[step];
            const detectedPreset = GAME_PRESETS.find((p) => p.id === scannedId);

            setTimeout(() => {
                if (scannedId === expectedId) {
                    // succès
                    setFeedbackMsg(`CORRECT ! ${detectedPreset?.name || 'Couleur'} validé.`);
                    const nextStep = step + 1;
                    setStep(nextStep);

                    if (nextStep >= sequence.length) {
                        triggerPhase('win');
                        setFeedbackMsg('Séquence Complète. Accès Autorisé.');
                    }
                } else {
                    // erreur
                    setFeedbackMsg(
                        `ERREUR ! ${detectedPreset?.name || 'Couleur inconnue'} détecté.`
                    );
                    // TODO: reset ou pénalité ?
                }
            }, 0);
        }
    }, [lastModuleAction, gameState, sequence, step, triggerPhase, GAME_PRESETS]);

    useScenarioTransition(gameState, isDialogueOpen, {
        idle: () => {
            if (GAME_PRESETS.length > 0) triggerPhase('intro');
        },
        intro: startGame,
        win: () => {
            setTimeout(() => onSolve(), SCENARIO.defaultTimeBeforeNextStep);
        },
    });

    if (isSolved) return <AlphaSuccess message={'SÉQUENCE CHROMATIQUE VALIDÉE'} />;
    if (GAME_PRESETS.length === 0) return <AlphaError message="Erreur config" />;

    return (
        <div className="space-y-6">
            <DialogueBox
                isOpen={isDialogueOpen}
                script={currentScript}
                onComplete={onDialogueComplete}
            />

            <AlphaModal
                isOpen={gameState === 'win' && !isDialogueOpen}
                title={'Succès'}
                message="Epreuve passée avec succès"
                autoCloseDuration={SCENARIO.defaultTimeBeforeNextStep}
                durationUnit={'ms'}
            />

            <AlphaCard title="Séquence de Sécurité" className={'text-center'}>
                <AlphaSequenceDisplay
                    sequence={sequence}
                    presets={GAME_PRESETS}
                    gameState={displayPhase}
                    step={step}
                    className="mt-4 mb-8"
                />

                <AlphaFeedbackPill
                    message={feedbackMsg}
                    type={
                        gameState === 'win'
                            ? 'success'
                            : gameState === 'memory'
                              ? 'warning'
                              : 'info'
                    }
                    pulse={gameState === 'scan'}
                />
            </AlphaCard>

            {(gameState === 'scan' || gameState === 'win') && !isDialogueOpen && (
                <div className="flex justify-center">
                    <AlphaButton onClick={startGame} variant="secondary" size="sm">
                        <div className="flex items-center gap-2">
                            <ArrowPathIcon className="h-4 w-4" />
                            Réessayer
                        </div>
                    </AlphaButton>
                </div>
            )}
        </div>
    );
};
