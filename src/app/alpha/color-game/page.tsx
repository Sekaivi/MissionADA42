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

    // état du jeu
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
                processingRef.current = true; // vérouille

                // logique asynchrone
                const timer = setTimeout(() => {
                    const colorName = GAME_PRESETS.find((p) => p.id === detectedId)?.name;
                    setFeedbackMsg(`CORRECT ! ${colorName} validé.`);

                    const nextStep = step + 1;
                    setStep(nextStep);

                    processingRef.current = false; // déverouille

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

            <AlphaCard>
                <div className={'mb-6 flex justify-center gap-4'}>
                    {sequence.map((colorId, index) => {
                        const colorStyle = STYLE_MAP[colorId] || 'bg-gray-500';
                        let styles =
                            'w-12 h-12 rounded-full border-2 flex items-center justify-center font-bold transition-all duration-300 ';

                        if (phase === 'memory') {
                            styles += `${colorStyle} text-black`;
                        } else {
                            if (index < step) {
                                styles += `${colorStyle} opacity-50 text-black`;
                            } else if (index === step && phase === 'scan') {
                                styles +=
                                    'bg-neutral-800 border-white scale-110 shadow-[0_0_15px_white] text-white';
                            } else {
                                styles += 'bg-neutral-800 border-neutral-600 text-neutral-600';
                            }
                        }

                        return (
                            <div key={index} className={styles}>
                                {phase === 'memory' ? (
                                    ''
                                ) : index < step ? (
                                    <CheckIcon />
                                ) : (
                                    <QuestionMarkCircleIcon />
                                )}
                            </div>
                        );
                    })}
                </div>

                <div className="text-center font-mono text-neutral-300">
                    {phase === 'memory' && `MÉMORISEZ : ${timeLeft}s`}
                    {phase === 'scan' && "SCANNEZ LES OBJETS DANS L'ORDRE"}
                    {phase === 'win' && 'SYSTÈME DÉVERROUILLÉ'}
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
                            <span
                                className="rounded border border-white/20 bg-black/70 px-3 py-1 font-bold text-white shadow-lg"
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

            <div
                className={`mt-6 min-h-[60px] w-full max-w-sm rounded border p-4 text-center font-bold transition-colors ${
                    phase === 'win'
                        ? 'border-green-500 bg-green-900/30 text-green-400'
                        : 'border-transparent text-white'
                }`}
            >
                {feedbackMsg}
            </div>

            {(phase === 'scan' || phase === 'win') && (
                <AlphaButton onClick={startGame}>Réinitialiser le système</AlphaButton>
            )}
        </>
    );
}
