'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { CheckCircleIcon, CheckIcon, QuestionMarkCircleIcon } from '@heroicons/react/24/solid';

import { AlphaButton } from '@/components/alpha/AlphaButton';
import { AlphaCard } from '@/components/alpha/AlphaCard';
import { AlphaVideoContainer } from '@/components/alpha/AlphaVideoContainer';
import { SCENARIO } from '@/data/alphaScenario';
import { useCamera } from '@/hooks/useCamera';
import { useColorDetection } from '@/hooks/useColorDetection';
import { PRESETS } from '@/utils/colorPresets';

import { PuzzleProps } from './PuzzleRegistry';

const GAME_PRESETS = [PRESETS.BLEU, PRESETS.VERT, PRESETS.ROUGE, PRESETS.ORANGE];
const MEMO_TIME = Math.max(3, Math.ceil(GAME_PRESETS.length * 1.5));

export const ChromaticPuzzle: React.FC<PuzzleProps> = ({ onSolve, isSolved }) => {
    const { videoRef, error } = useCamera();
    const scanConfig = useMemo(() => ({ size: 180, xOffset: 0, yOffset: 0 }), []);

    const activePresets = useMemo(() => GAME_PRESETS, []);

    const [sequence, setSequence] = useState<string[]>([]);
    const [step, setStep] = useState(0);
    const [phase, setPhase] = useState<'init' | 'memory' | 'scan' | 'win'>('init');
    const [timeLeft, setTimeLeft] = useState(8);
    const [feedbackMsg, setFeedbackMsg] = useState('Initialisation...');

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
        setTimeLeft(MEMO_TIME);
        setPhase('memory');
        setFeedbackMsg('Mémorisez la séquence...');
        processingRef.current = false;
    }, [generateSequence]);

    // timer
    useEffect(() => {
        if (phase !== 'memory') return;
        const timer = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    setPhase('scan');
                    setFeedbackMsg('À vous de jouer !');
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(timer);
    }, [phase]);

    // validation de la couleur détectée
    useEffect(() => {
        let timer: NodeJS.Timeout;

        // on vérifie qu'on est en phase scan, qu'on a une couleur, et que ce n'est pas déjà verrouillé
        if (phase === 'scan' && detectedId && !processingRef.current) {
            const expectedId = sequence[step];

            if (detectedId === expectedId) {
                // vérrouillage
                processingRef.current = true;

                // feedback visuel asynchrone
                // requestAnimationFrame pour que l'update se fasse à la prochaine frame
                requestAnimationFrame(() => {
                    if (processingRef.current) {
                        setFeedbackMsg(`Analyse en cours... Maintenez !`);
                    }
                });

                // timer de validation
                timer = setTimeout(() => {
                    const colorName = GAME_PRESETS.find((p) => p.id === detectedId)?.name;
                    setFeedbackMsg(`CORRECT ! ${colorName} validé.`);

                    const nextStep = step + 1;
                    setStep(nextStep);

                    // déverrouillage avant le re-render du step suivant
                    processingRef.current = false;

                    if (nextStep >= sequence.length) {
                        setPhase('win');
                        setFeedbackMsg('Séquence Complète. Accès Autorisé.');
                        setTimeout(() => onSolve(), SCENARIO.defaultTimeBeforeNextStep);
                    }
                }, 800);
            }
        }

        // cleanup
        return () => {
            clearTimeout(timer);
            // si on démonte l'effet alors qu'on était en train de processer (ex: perte de tracking)
            if (processingRef.current) {
                // on ne set le message que si on est toujours en phase de scan (pas si on vient de gagner)
                if (phase === 'scan') {
                    setFeedbackMsg('Analyse interrompue (mouvement détecté)');
                }
                processingRef.current = false;
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

                <div className="text-muted text-center font-mono text-sm">
                    {phase === 'memory' && (
                        <span className="text-brand-blue animate-pulse font-bold">
                            MÉMORISEZ : {timeLeft}s
                        </span>
                    )}
                    {phase === 'scan' && "SCANNEZ LES OBJETS DANS L'ORDRE"}
                    {phase === 'win' && (
                        <span className="text-brand-emerald font-bold">SYSTÈME DÉVERROUILLÉ</span>
                    )}
                </div>
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

            <div
                className={`mt-2 min-h-[40px] w-full rounded border p-2 text-center text-sm font-bold transition-colors ${
                    phase === 'win'
                        ? 'border-brand-emerald bg-brand-emerald/10 text-brand-emerald'
                        : 'border-border bg-surface text-foreground'
                }`}
            >
                {feedbackMsg}
            </div>

            {(phase === 'scan' || phase === 'win') && (
                <div className="flex justify-center">
                    <AlphaButton onClick={startGame}>Réinitialiser la séquence</AlphaButton>
                </div>
            )}
        </div>
    );
};
