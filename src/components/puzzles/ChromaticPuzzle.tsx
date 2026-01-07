'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { CheckCircleIcon, CheckIcon, QuestionMarkCircleIcon } from '@heroicons/react/24/solid';
import { AlphaButton } from '@/components/alpha/AlphaButton';
import { AlphaCard } from '@/components/alpha/AlphaCard';
import AlphaFeedbackPill from '@/components/alpha/AlphaFeedbackPill';
import { AlphaModal } from '@/components/alpha/AlphaModal';
import { AlphaVideoContainer } from '@/components/alpha/AlphaVideoContainer';
import { SCENARIO } from '@/data/alphaScenario';
import { useCamera } from '@/hooks/useCamera';
import { useColorDetection } from '@/hooks/useColorDetection';
import { PRESETS } from '@/utils/colorPresets';
import { PuzzleProps } from './PuzzleRegistry';

const GAME_PRESETS = [PRESETS.ROUGE];
const MEMO_TIME = Math.max(3, Math.ceil(GAME_PRESETS.length * 1.5));

export const ChromaticPuzzle: React.FC<PuzzleProps> = ({ onSolve, isSolved }) => {
    const { videoRef, error } = useCamera();

    const scanConfig = useMemo(() => ({ size: 180, xOffset: 0, yOffset: 0 }), []);
    const activePresets = useMemo(() => GAME_PRESETS, []);

    const [sequence, setSequence] = useState<string[]>([]);
    const [step, setStep] = useState(0);
    const [phase, setPhase] = useState<'init' | 'memory' | 'scan' | 'win'>('init');

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
        setStep(0);
        setPhase('memory');
        setTimeLeft(MEMO_TIME);
        setFeedbackMsg(`Mémorisez la séquence : ${MEMO_TIME}s`);

        processingRef.current = false;
        setIsValidating(false);
    }, [generateSequence]);

    // timer
    useEffect(() => {
        if (phase !== 'memory') return;
        const timer = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    setPhase('scan');
                    setFeedbackMsg("SCANNEZ LES OBJETS DANS L'ORDRE");
                    return 0;
                }
                setFeedbackMsg(`Mémorisez la séquence : ${prev - 1}s`);
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(timer);
    }, [phase]);

    // validation de la couleur détectée
    useEffect(() => {
        let timer: NodeJS.Timeout;

        if (phase === 'scan' && detectedId && !processingRef.current) {
            const expectedId = sequence[step];

            if (detectedId === expectedId) {
                // verrouillage logique
                processingRef.current = true;

                requestAnimationFrame(() => {
                    setIsValidating(true);
                    setFeedbackMsg(`Analyse en cours...`);
                });

                timer = setTimeout(() => {
                    const colorName = GAME_PRESETS.find((p) => p.id === detectedId)?.name;

                    // update state après succès
                    setFeedbackMsg(`CORRECT ! ${colorName} validé.`);
                    const nextStep = step + 1;
                    setStep(nextStep);

                    // déverrouillage
                    processingRef.current = false;
                    setIsValidating(false);

                    if (nextStep >= sequence.length) {
                        setPhase('win');
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
    }, [detectedId, phase, sequence, step, onSolve]);

    // init
    useEffect(() => {
        const t = setTimeout(() => startGame(), 100);
        return () => clearTimeout(t);
    }, [startGame]);

    if (isSolved) {
        return (
            <div className="rounded-xl border border-green-500 bg-green-900/20 p-6 text-center">
                <CheckCircleIcon className="mx-auto mb-4 h-16 w-16 text-green-500" />
                <h2 className="text-xl font-bold text-green-400">SÉQUENCE CHROMATIQUE VALIDÉE</h2>
            </div>
        );
    }

    if (error)
        return (
            <div className="rounded border border-red-500 p-4 text-red-500">Erreur : {error}</div>
        );

    return (
        <div className="animate-in fade-in space-y-6 duration-500">
            <AlphaCard title="Module de Sécurité Chromatique">
                <div className={'mb-6 flex flex-wrap justify-center gap-4'}>
                    {sequence.map((colorId, index) => {
                        const preset = GAME_PRESETS.find((p) => p.id === colorId);
                        if (!preset) return null;

                        let dynamicStyle: React.CSSProperties = {};
                        let classes =
                            'w-12 h-12 rounded-full border-2 flex items-center justify-center font-bold transition-all duration-300 ';

                        if (phase === 'memory') {
                            classes += 'text-white shadow-lg scale-110';
                            dynamicStyle = {
                                backgroundColor: preset.displayHex,
                                borderColor: preset.displayHex,
                            };
                        } else {
                            if (index < step) {
                                classes += 'opacity-50 text-white';
                                dynamicStyle = {
                                    backgroundColor: preset.displayHex,
                                    borderColor: preset.displayHex,
                                };
                            } else if (index === step && phase === 'scan') {
                                classes += 'bg-transparent animate-pulse scale-110';
                            } else {
                                classes +=
                                    'bg-surface-highlight border-border text-muted opacity-30';
                            }
                        }

                        return (
                            <div key={index} className={classes} style={dynamicStyle}>
                                {phase === 'memory' ? (
                                    ''
                                ) : index < step ? (
                                    <CheckIcon className="h-6 w-6" />
                                ) : (
                                    <QuestionMarkCircleIcon className="h-6 w-6" />
                                )}
                            </div>
                        );
                    })}
                </div>

                <AlphaFeedbackPill
                    message={feedbackMsg}
                    type={phase === 'win' ? 'success' : 'info'}
                    isLoading={phase === 'init' || isValidating}
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
                isOpen={phase === 'win'}
                message={feedbackMsg}
                autoCloseDuration={SCENARIO.defaultTimeBeforeNextStep}
                durationUnit={'ms'}
                onAutoClose={onSolve}
            />

            {(phase === 'scan' || phase === 'win') && (
                <div className="flex justify-center">
                    <AlphaButton onClick={startGame}>Réinitialiser la séquence</AlphaButton>
                </div>
            )}
        </div>
    );
};
