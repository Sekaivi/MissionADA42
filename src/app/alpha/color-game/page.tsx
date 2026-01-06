'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { CheckIcon, QuestionMarkCircleIcon } from '@heroicons/react/24/solid';

import { AlphaButton } from '@/components/alpha/AlphaButton';
import { AlphaCard } from '@/components/alpha/AlphaCard';
import { AlphaError } from '@/components/alpha/AlphaError';
import { AlphaHeader } from '@/components/alpha/AlphaHeader';
import { AlphaVideoContainer } from '@/components/alpha/AlphaVideoContainer';
import { useCamera } from '@/hooks/useCamera';
import { useColorDetection } from '@/hooks/useColorDetection';
import { PRESETS } from '@/utils/colorPresets';

const GAME_PRESETS = [PRESETS.BLEU, PRESETS.VERT, PRESETS.ROUGE, PRESETS.ORANGE];

// couleurs brutes pour les éléments du jeu
const STYLE_MAP: Record<string, string> = {
    [PRESETS.ROUGE.id]: 'bg-red-500 border-red-500',
    [PRESETS.VERT.id]: 'bg-green-500 border-green-500',
    [PRESETS.BLEU.id]: 'bg-blue-600 border-blue-600',
    [PRESETS.ORANGE.id]: 'bg-orange-500 border-orange-500',
};

export default function ChromaticGame() {
    const { videoRef, error } = useCamera();

    const scanConfig = useMemo(
        () => ({
            size: 180,
            xOffset: 0,
            yOffset: 0,
        }),
        []
    );

    const activePresets = useMemo(() => GAME_PRESETS, []);

    // states du jeu
    const [sequence, setSequence] = useState<string[]>([]);
    const [step, setStep] = useState(0);
    const [phase, setPhase] = useState<'init' | 'memory' | 'scan' | 'win'>('init');
    const [timeLeft, setTimeLeft] = useState(8);
    const [feedbackMsg, setFeedbackMsg] = useState('Initialisation...');

    // ref pour stocker une valeur mutable sans déclencher de re-render
    const processingRef = useRef(false);

    const { detectedId } = useColorDetection(videoRef, activePresets, phase === 'scan', scanConfig);

    const generateSequence = useCallback(() => {
        const array = GAME_PRESETS.map((p) => p.id);
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        setSequence(array);
    }, []);

    const startGame = useCallback(() => {
        generateSequence();
        setStep(0);
        setTimeLeft(5);
        setPhase('memory');
        setFeedbackMsg('');
        processingRef.current = false; // reset du verrou
    }, [generateSequence]);

    // timer phase mémoire
    useEffect(() => {
        if (phase !== 'memory') return;

        const timer = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    setPhase('scan');
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [phase]);

    // validation de la couleur détectée
    useEffect(() => {
        // check la ref
        if (phase === 'scan' && detectedId && !processingRef.current) {
            const expectedId = sequence[step];

            if (detectedId === expectedId) {
                processingRef.current = true; // vérrouille

                // logique asynchrone
                const timer = setTimeout(() => {
                    const colorName = GAME_PRESETS.find((p) => p.id === detectedId)?.name;
                    setFeedbackMsg(`CORRECT ! ${colorName} validé.`);

                    const nextStep = step + 1;
                    setStep(nextStep);

                    processingRef.current = false; // déverrouille

                    if (nextStep >= sequence.length) {
                        setPhase('win');
                        setFeedbackMsg('Séquence Complète. Accès Autorisé.');
                    }
                }, 500);

                return () => clearTimeout(timer);
            }
        }
    }, [detectedId, phase, sequence, step]);

    // init au montage dans un timeout(0) pour ne pas bloquer le premier rendu
    useEffect(() => {
        const t = setTimeout(() => startGame(), 0);
        return () => clearTimeout(t);
    }, [startGame]);

    if (error) return <AlphaError message={error} />;

    return (
        <>
            <AlphaHeader title={'Module de Sécurité'} />

            <div className="space-y-6">
                <AlphaCard>
                    <div className={'mb-6 flex justify-center gap-4'}>
                        {sequence.map((colorId, index) => {
                            const colorStyle = STYLE_MAP[colorId] || 'bg-muted';
                            let styles =
                                'w-12 h-12 rounded-full border-2 flex items-center justify-center font-bold transition-all duration-300 ';

                            if (phase === 'memory') {
                                // phase memory => on affiche les vraies couleurs
                                styles += `${colorStyle} text-white shadow-lg`;
                            } else {
                                if (index < step) {
                                    // couleur validée => couleur atténuée
                                    styles += `${colorStyle} opacity-50 text-white`;
                                } else if (index === step && phase === 'scan') {
                                    // étape actuelle
                                    styles +=
                                        'bg-background border-foreground scale-110 shadow-[0_0_15px_var(--color-foreground)] text-foreground';
                                } else {
                                    // étapes manquantes
                                    styles += 'bg-surface-highlight border-border text-muted';
                                }
                            }

                            return (
                                <div key={index} className={styles}>
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

                    <div className="text-muted text-center font-mono">
                        {phase === 'memory' && (
                            <span className="text-foreground animate-pulse">
                                MÉMORISEZ : {timeLeft}s
                            </span>
                        )}
                        {phase === 'scan' && "SCANNEZ LES OBJETS DANS L'ORDRE"}
                        {phase === 'win' && (
                            <span className="text-brand-emerald font-bold">
                                SYSTÈME DÉVERROUILLÉ
                            </span>
                        )}
                    </div>
                </AlphaCard>

                <AlphaCard>
                    <AlphaVideoContainer
                        scanSettings={phase === 'scan' ? scanConfig : undefined}
                        label="COLOR GAME"
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
                                {/* badge de couleur détectée */}
                                <span
                                    className="border-border bg-background text-foreground rounded border px-3 py-1 font-bold shadow-lg backdrop-blur-sm"
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

                {/* feedback */}
                <div
                    className={`mt-6 min-h-[60px] w-full rounded border p-4 text-center font-bold transition-colors ${
                        phase === 'win'
                            ? 'border-brand-emerald bg-brand-emerald/10 text-brand-emerald'
                            : 'text-foreground border-transparent'
                    }`}
                >
                    {feedbackMsg}
                </div>

                {(phase === 'scan' || phase === 'win') && (
                    <AlphaButton onClick={startGame}>Réinitialiser le système</AlphaButton>
                )}
            </div>
        </>
    );
}
