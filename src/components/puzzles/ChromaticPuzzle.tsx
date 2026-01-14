'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { CheckIcon, QuestionMarkCircleIcon } from '@heroicons/react/24/solid';
import clsx from 'clsx';

import { AlphaButton } from '@/components/alpha/AlphaButton';
import { AlphaCard } from '@/components/alpha/AlphaCard';
import { AlphaError } from '@/components/alpha/AlphaError';
import AlphaFeedbackPill from '@/components/alpha/AlphaFeedbackPill';
import { AlphaModal } from '@/components/alpha/AlphaModal';
import { AlphaSuccess } from '@/components/alpha/AlphaSuccess';
import { AlphaVideoContainer } from '@/components/alpha/AlphaVideoContainer';
import { DialogueBox } from '@/components/dialogueBox';
import { SCENARIO } from '@/data/alphaScenario';
import { useCamera } from '@/hooks/useCamera';
import { useColorDetection } from '@/hooks/useColorDetection';
import { useGameScenario, useScenarioTransition } from '@/hooks/useGameScenario';
import { ColorDefinition } from '@/types/colorDetection';

import { PuzzlePhases, PuzzleProps } from './PuzzleRegistry';

export type ChromaticPuzzlePhases = PuzzlePhases | 'memory' | 'scan';

// def type de la config
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
                            'flex h-12 w-12 items-center justify-center rounded-full border-2 font-bold transition-all duration-300',
                            isMemory && 'scale-110 text-white shadow-lg',
                            isCompleted && 'text-white opacity-50',
                            isActive && 'scale-110 animate-pulse border-current bg-transparent',
                            isPending && 'bg-surface-highlight border-border text-muted opacity-30'
                        )}
                    >
                        {!isMemory && (
                            <>
                                {isCompleted ? (
                                    <CheckIcon className="h-6 w-6" />
                                ) : (
                                    <QuestionMarkCircleIcon className="h-6 w-6" />
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
}: PuzzleProps<ChromaticPuzzlePhases, ChromaticConfig>) => {
    const GAME_PRESETS = useMemo(() => {
        return puzzleConfig?.sequence || [];
    }, [puzzleConfig?.sequence]);

    const MEMO_TIME = useMemo(() => {
        return GAME_PRESETS.length > 0 ? Math.max(3, Math.ceil(GAME_PRESETS.length * 1.5)) : 0;
    }, [GAME_PRESETS.length]);

    const { gameState, triggerPhase, isDialogueOpen, currentScript, onDialogueComplete } =
        useGameScenario<ChromaticPuzzlePhases>(scripts);

    const { videoRef, error, isMirrored } = useCamera('environment');

    const scanConfig = useMemo(() => ({ size: 180, xOffset: 0, yOffset: 0 }), []);

    const activePresets = useMemo(() => GAME_PRESETS, [GAME_PRESETS]);

    const displayPhase = (gameState === 'idle' ? 'init' : gameState) as ChromaticPuzzlePhases;

    const [sequence, setSequence] = useState<string[]>([]);
    const [step, setStep] = useState(0);
    const [, setTimeLeft] = useState(MEMO_TIME);
    const [feedbackMsg, setFeedbackMsg] = useState('Initialisation...');
    const [isValidating, setIsValidating] = useState(false);
    const processingRef = useRef(false);

    const { detectedId } = useColorDetection(
        videoRef,
        activePresets,
        gameState === 'scan',
        scanConfig
    );

    const generateSequence = useCallback(() => {
        if (GAME_PRESETS.length === 0) return; // sécurité

        const availableIds = GAME_PRESETS.map((p) => p.id);
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
        setFeedbackMsg(`Mémorisez la séquence : ${MEMO_TIME}s`);

        processingRef.current = false;
        setIsValidating(false);
    }, [generateSequence, triggerPhase, MEMO_TIME]);

    // timer
    useEffect(() => {
        if (gameState !== 'memory') return;
        const timer = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    triggerPhase('scan');
                    setFeedbackMsg("SCANNEZ LES OBJETS DANS L'ORDRE");
                    return 0;
                }
                setFeedbackMsg(`Mémorisez la séquence : ${prev - 1}s`);
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(timer);
    }, [gameState, triggerPhase]);

    // validation de la couleur détectée
    useEffect(() => {
        let timer: NodeJS.Timeout;

        if (gameState === 'scan' && detectedId && !processingRef.current) {
            const expectedId = sequence[step];

            if (detectedId === expectedId) {
                processingRef.current = true;

                requestAnimationFrame(() => {
                    setIsValidating(true);
                    setFeedbackMsg(`Analyse en cours...`);
                });

                timer = setTimeout(() => {
                    const colorName = GAME_PRESETS.find((p) => p.id === detectedId)?.name;

                    setFeedbackMsg(`CORRECT ! ${colorName} validé.`);
                    const nextStep = step + 1;
                    setStep(nextStep);

                    processingRef.current = false;
                    setIsValidating(false);

                    if (nextStep >= sequence.length) {
                        triggerPhase('win');
                        setFeedbackMsg('Séquence Complète.\nAccès Autorisé.');
                    }
                }, 800);
            }
        }

        return () => {
            clearTimeout(timer);
            if (processingRef.current) {
                if (gameState === 'scan') {
                    setFeedbackMsg('Analyse interrompue (mouvement détecté)');
                }
                processingRef.current = false;
                setIsValidating(false);
            }
        };
    }, [detectedId, gameState, sequence, step, onSolve, triggerPhase, GAME_PRESETS]);

    // init
    useEffect(() => {
        // ne pas lancer l'intro si pas de config
        if (GAME_PRESETS.length > 0) {
            triggerPhase('intro');
        }
    }, [triggerPhase, GAME_PRESETS.length]);

    // transitions automatiques après dialogues
    useScenarioTransition(gameState, isDialogueOpen, {
        intro: startGame,
        win: () => {
            setTimeout(() => onSolve(), SCENARIO.defaultTimeBeforeNextStep);
        },
    });

    if (isSolved) return <AlphaSuccess message={'SÉQUENCE CHROMATIQUE VALIDÉE'} />;

    // erreur si la config est manquante
    if (GAME_PRESETS.length === 0)
        return <AlphaError message="Erreur de configuration : séquence vide" />;

    if (error) return <AlphaError message={error} />;

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

            <AlphaCard title="Module de Sécurité Chromatique">
                <AlphaSequenceDisplay
                    sequence={sequence}
                    presets={GAME_PRESETS}
                    gameState={displayPhase}
                    step={step}
                    className="mb-6"
                />

                <AlphaFeedbackPill
                    message={feedbackMsg}
                    type={gameState === 'win' ? 'success' : 'info'}
                    isLoading={gameState === 'intro' || (isValidating && gameState !== 'win')}
                />
            </AlphaCard>

            {gameState !== 'win' && (
                <AlphaCard>
                    <AlphaVideoContainer
                        scanSettings={gameState === 'scan' ? scanConfig : undefined}
                        label={gameState === 'scan' ? 'SCAN EN COURS' : 'ATTENTE'}
                        videoRef={videoRef}
                        isMirrored={isMirrored}
                    >
                        {detectedId && gameState === 'scan' && (
                            <div className="absolute right-0 bottom-4 left-0 text-center">
                                <span
                                    className="border-border rounded border bg-black/80 px-3 py-1 font-bold text-white shadow-lg backdrop-blur-sm"
                                    style={{
                                        borderColor: GAME_PRESETS.find((p) => p.id === detectedId)
                                            ?.displayHex,
                                        color: GAME_PRESETS.find((p) => p.id === detectedId)
                                            ?.displayHex,
                                    }}
                                >
                                    {GAME_PRESETS.find((p) => p.id === detectedId)?.name}
                                </span>
                            </div>
                        )}
                    </AlphaVideoContainer>
                </AlphaCard>
            )}

            {(gameState === 'scan' || gameState === 'win') && !isDialogueOpen && (
                <div className="flex justify-center">
                    <AlphaButton onClick={startGame}>Réinitialiser la séquence</AlphaButton>
                </div>
            )}
        </div>
    );
};
