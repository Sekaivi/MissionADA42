'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { CheckIcon, QuestionMarkCircleIcon } from '@heroicons/react/24/solid';
import clsx from 'clsx';

import { ChromaticPuzzleScenarioStep } from '@/app/alpha/camera/chromatic-puzzle-page/page';
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
import { PRESETS } from '@/utils/colorPresets';

import { PuzzleProps } from './PuzzleRegistry';

const GAME_PRESETS = [PRESETS.ROUGE];
const MEMO_TIME = Math.max(3, Math.ceil(GAME_PRESETS.length * 1.5));

interface ColorPreset {
    id: string;
    displayHex: string;
    name?: string;
}

interface AlphaSequenceDisplayProps {
    sequence: string[];
    presets: ColorPreset[];
    phase: ChromaticPuzzleScenarioStep;
    step: number;
    className?: string;
}

export const AlphaSequenceDisplay: React.FC<AlphaSequenceDisplayProps> = ({
    sequence,
    presets,
    phase,
    step,
    className,
}) => {
    return (
        <div className={clsx('flex flex-wrap justify-center gap-4', className)}>
            {sequence.map((colorId, index) => {
                const preset = presets.find((p) => p.id === colorId);
                if (!preset) return null;

                const isMemory = phase === 'memory';
                const isCompleted = index < step && !isMemory;
                const isActive = index === step && phase === 'scan';
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

export const ChromaticPuzzle = ({ onSolve, isSolved, scripts = {} }: PuzzleProps) => {
    const {
        gameState: phase,
        triggerPhase,
        isDialogueOpen,
        currentScript,
        onDialogueComplete,
    } = useGameScenario<ChromaticPuzzleScenarioStep>(scripts);

    const { videoRef, error } = useCamera();

    const scanConfig = useMemo(() => ({ size: 180, xOffset: 0, yOffset: 0 }), []);
    const activePresets = useMemo(() => GAME_PRESETS, []);

    // gestion du typage pour l'affichage (idle -> init)
    const displayPhase = (phase === 'idle' ? 'init' : phase) as ChromaticPuzzleScenarioStep;

    const [sequence, setSequence] = useState<string[]>([]);
    const [step, setStep] = useState(0);
    const [, setTimeLeft] = useState(MEMO_TIME);
    const [feedbackMsg, setFeedbackMsg] = useState('Initialisation...');
    const [isValidating, setIsValidating] = useState(false);
    const processingRef = useRef(false);

    const { detectedId } = useColorDetection(videoRef, activePresets, phase === 'scan', scanConfig);

    const generateSequence = useCallback(() => {
        const availableIds = GAME_PRESETS.map((p) => p.id);
        for (let i = availableIds.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [availableIds[i], availableIds[j]] = [availableIds[j], availableIds[i]];
        }
        setSequence(availableIds);
    }, []);

    const startGame = useCallback(() => {
        generateSequence();
        triggerPhase('memory');
        setStep(0);
        setTimeLeft(MEMO_TIME);
        setFeedbackMsg(`Mémorisez la séquence : ${MEMO_TIME}s`);

        processingRef.current = false;
        setIsValidating(false);
    }, [generateSequence, triggerPhase]);

    // timer
    useEffect(() => {
        if (phase !== 'memory') return;
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
    }, [phase, triggerPhase]);

    // validation de la couleur détectée
    useEffect(() => {
        let timer: NodeJS.Timeout;

        if (phase === 'scan' && detectedId && !processingRef.current) {
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
                if (phase === 'scan') {
                    setFeedbackMsg('Analyse interrompue (mouvement détecté)');
                }
                processingRef.current = false;
                setIsValidating(false);
            }
        };
    }, [detectedId, phase, sequence, step, onSolve, triggerPhase]);

    // init
    useEffect(() => {
        triggerPhase('init');
    }, [triggerPhase]);

    // transitions automatiques après dialogues
    useScenarioTransition(phase, isDialogueOpen, {
        init: startGame,
        win: () => {
            setTimeout(() => onSolve(), SCENARIO.defaultTimeBeforeNextStep);
        },
    });

    if (isSolved) return <AlphaSuccess message={'SÉQUENCE CHROMATIQUE VALIDÉE'} />;
    if (error) return <AlphaError message={error} />;

    return (
        <div className="space-y-6">
            <DialogueBox
                isOpen={isDialogueOpen}
                script={currentScript}
                onComplete={onDialogueComplete}
            />

            <AlphaCard title="Module de Sécurité Chromatique">
                <AlphaSequenceDisplay
                    sequence={sequence}
                    presets={GAME_PRESETS}
                    phase={displayPhase}
                    step={step}
                    className="mb-6"
                />

                <AlphaFeedbackPill
                    message={feedbackMsg}
                    type={phase === 'win' ? 'success' : 'info'}
                    isLoading={phase === 'init' || (isValidating && phase !== 'win')}
                />
            </AlphaCard>

            {phase !== 'win' && (
                <AlphaCard>
                    <AlphaVideoContainer
                        scanSettings={phase === 'scan' ? scanConfig : undefined}
                        label={phase === 'scan' ? 'SCAN EN COURS' : 'ATTENTE'}
                    >
                        <video
                            ref={videoRef}
                            autoPlay
                            playsInline
                            muted
                            className="h-full w-full object-cover"
                        />

                        {detectedId && phase === 'scan' && (
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

            <AlphaModal
                isOpen={phase === 'win' && !isDialogueOpen}
                message={feedbackMsg}
                autoCloseDuration={SCENARIO.defaultTimeBeforeNextStep}
                durationUnit={'ms'}
            />

            {(phase === 'scan' || phase === 'win') && !isDialogueOpen && (
                <div className="flex justify-center">
                    <AlphaButton onClick={startGame}>Réinitialiser la séquence</AlphaButton>
                </div>
            )}
        </div>
    );
};
