'use client';

import { useEffect, useRef, useState } from 'react';

import { FireIcon } from '@heroicons/react/24/solid';

import { AlphaButton } from '@/components/alpha/AlphaButton';
import { AlphaCard } from '@/components/alpha/AlphaCard';
import AlphaFeedbackPill from '@/components/alpha/AlphaFeedbackPill';
import { AlphaMessageScreen } from '@/components/alpha/AlphaMessageScreen';
import { AlphaSuccess } from '@/components/alpha/AlphaSuccess';
import { DialogueBox } from '@/components/dialogueBox';
import { PuzzlePhases, PuzzleProps } from '@/components/puzzles/PuzzleRegistry';
import { useFirewallLogic } from '@/hooks/useFirewallLogic';
import { useGameScenario, useScenarioTransition } from '@/hooks/useGameScenario';
import { useMicrophone } from '@/hooks/useMicrophone';
import { useOrientation } from '@/hooks/useOrientation';

export type FirewallPuzzlePhases = PuzzlePhases;

// Fonction pour déterminer la couleur et le style selon la température
const getThermalStyle = (temp: number) => {
    if (temp < 150)
        return {
            color: 'text-emerald-400',
            border: 'border-emerald-500',
            shadow: 'shadow-emerald-500/20',
            bg: 'bg-emerald-500',
        };
    if (temp < 200)
        return {
            color: 'text-orange-400',
            border: 'border-orange-500',
            shadow: 'shadow-orange-500/30',
            bg: 'bg-orange-500',
        };
    if (temp < 300)
        return {
            color: 'text-brand-error',
            border: 'border-brand-error',
            shadow: 'shadow-brand-error/40',
            bg: 'bg-brand-error',
        };
    return {
        color: 'text-brand-error',
        border: 'border-brand-error',
        shadow: 'shadow-brand-error/60',
        bg: 'bg-brand-error',
    };
};

export default function FirewallPuzzle({ onSolve, isSolved, scripts = {} }: PuzzleProps) {
    const { gameState, triggerPhase, isDialogueOpen, currentScript, onDialogueComplete } =
        useGameScenario<FirewallPuzzlePhases>(scripts);

    // CAPTEURS
    const { data: orientationData, error, permissionGranted } = useOrientation();
    const { data: mic, requestPermission } = useMicrophone();

    // LOGIQUE DE JEU
    const { temp, stabilityProgress, isStable } = useFirewallLogic({
        isActive: gameState === 'playing',
        orientation: orientationData,
        isBlowing: mic.isBlowing,
        onWin: () => triggerPhase('win'),
    });

    // DEBUG
    const [debugMessages, setDebugMessages] = useState('');

    const onStart = async () => {
        await requestPermission();
        triggerPhase('playing');
    };

    useScenarioTransition(gameState, isDialogueOpen, {
        idle: () => triggerPhase('intro'),
        win: () => {
            onSolve();
        },
    });

    // Calculs pour l'animation visuelle
    const thermalStyle = getThermalStyle(temp);

    // Calcul du tremblement du pare-feu
    const shakeRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        let frameId: number;

        const animate = () => {
            if (shakeRef.current) {
                if (temp > 250) {
                    // Calcul de l'intensité (max 10px à 400°C)
                    const intensity = Math.max(0, Math.min(10, (temp - 250) / 15));
                    const x = (Math.random() - 0.5) * intensity;
                    const y = (Math.random() - 0.5) * intensity;
                    shakeRef.current.style.transform = `translate(${x}px, ${y}px)`;
                } else {
                    shakeRef.current.style.transform = `translate(0px, 0px)`;
                }
            }
            frameId = requestAnimationFrame(animate);
        };

        frameId = requestAnimationFrame(animate);
        return () => cancelAnimationFrame(frameId);
    }, [temp]); // recalibrage si la température change

    // DEBUG
    useEffect(() => {
        setDebugMessages("isBlowing: " + mic.isBlowing + " and current Orientation data: " + orientationData)
    }, [mic.isBlowing])

    return (
        <>
            <DialogueBox
                isOpen={isDialogueOpen}
                script={currentScript}
                onComplete={onDialogueComplete}
            />

            {/*POUR DEBUG */}
            {debugMessages}
            <h1>Orientation Data:</h1>
            <p>Error: {error}</p>
            <p>Permission Granted: {permissionGranted} </p>
            <p>Alpha: {orientationData.alpha}</p>
            <p>beta: {orientationData.beta}</p>
            <p>gamma: {orientationData.gamma}</p>
            <p>heading: {orientationData.heading}</p>

            {/* ÉTAT 1: DEMANDE D'ACCÈS */}
            {gameState === 'intro' && (
                <AlphaCard
                    className="border-brand-error relative shadow-[0_0_30px_rgba(220,38,38,0.4)]"
                    title="ALERTE CRITIQUE"
                >
                    {/* layer rouge pulse */}
                    <div className="bg-brand-error/10 pointer-events-none absolute inset-0 m-0 animate-pulse" />

                    <div className="relative flex flex-col items-center gap-6 py-6 text-center">
                        <div className="relative">
                            <div className="bg-brand-error/30 absolute inset-0 animate-ping rounded-full" />
                            <FireIcon className="text-brand-error h-20 w-20" />
                        </div>
                    </div>

                    <AlphaMessageScreen
                        variant={'error'}
                        title={`Surchauffe Imminente`}
                        description={`INTERVENTION MANUELLE REQUISE`}
                    />
                    <AlphaButton onClick={onStart} className={'mx-auto mb-4'}>
                        REFROIDIR
                    </AlphaButton>
                </AlphaCard>
            )}

            {/* ÉTAT 2: JEU EN COURS */}
            {gameState === 'playing' && (
                <>
                    {/* LE CERCLE PARE-FEU */}
                    <div className="relative flex items-center justify-center py-4">
                        {/* Wrapper pour le tremblement */}
                        <div
                            ref={shakeRef}
                            className="relative transition-transform duration-75 will-change-transform"
                        >
                            {/* Le Cercle SVG */}
                            <div
                                className={`relative h-48 w-48 rounded-full border-8 ${thermalStyle.border} ${thermalStyle.shadow} bg-surface flex items-center justify-center shadow-[0_0_50px_currentColor] transition-all duration-500`}
                            >
                                {/* Texte Température au centre */}
                                <div className="flex flex-col items-center">
                                    <span
                                        className={`font-mono text-4xl font-black ${thermalStyle.color} transition-colors duration-300`}
                                    >
                                        {Math.floor(temp)}°C
                                    </span>
                                    <span className="text-muted mt-1 text-xs uppercase">
                                        Core Temp
                                    </span>
                                </div>

                                {/* Effet de particules/cercle interne qui tourne */}
                                <div
                                    className={`absolute inset-0 rounded-full border-2 border-dashed ${thermalStyle.border} animate-[spin_10s_linear_infinite] opacity-30`}
                                />
                            </div>
                        </div>
                    </div>

                    {/* VENTILATION */}
                    <div className="flex flex-col items-center gap-2">
                        <div
                            className={`relative transition-all duration-700 ${mic.isBlowing && isStable ? 'scale-125' : 'scale-100 opacity-80'}`}
                        >
                            {/* Le Ventilo */}
                            <svg
                                viewBox="0 0 24 24"
                                className={`h-16 w-16 transition-colors duration-100 ${mic.isBlowing && isStable ? 'text-brand-blue' : 'text-muted'}`}
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                style={{
                                    // Animation via CSS rotation
                                    animation: `spin ${mic.isBlowing && isStable ? '0.2s' : '10s'} linear infinite`,
                                    transition: 'all 1s ease-out',
                                }}
                            >
                                <path
                                    strokeLinecap="round"
                                    d="M12 12L12 2M12 12L21 12M12 12L12 21M12 12L3 12"
                                />
                                <path
                                    strokeLinecap="round"
                                    opacity="0.5"
                                    d="M12 12L19 5M12 12L19 19M12 12L5 19M12 12L5 5"
                                />
                                <circle cx="12" cy="12" r="3" className="fill-current opacity-20" />
                            </svg>
                        </div>
                        <div className="h-4 text-center font-mono text-xs">
                            {mic.isBlowing ? (
                                isStable ? (
                                    <span className="text-brand-blue animate-pulse">
                                        FLUX D'AIR ACTIF
                                    </span>
                                ) : (
                                    <span className="text-brand-error">ERREUR: INSTABILITÉ</span>
                                )
                            ) : (
                                <span className="text-muted">EN ATTENTE DE SOUFFLE...</span>
                            )}
                        </div>
                    </div>

                    {/* BARRE DE STABILITÉ */}
                    <div className="space-y-2">
                        <div className="text-muted flex justify-between text-xs font-bold uppercase">
                            <span>Stabilité Gyroscopique</span>
                            <span
                                className={
                                    !isStable
                                        ? 'text-brand-error animate-pulse'
                                        : 'text-brand-emerald'
                                }
                            >
                                {Math.floor(stabilityProgress)}%
                            </span>
                        </div>
                        <div className="border-border bg-surface-highlight relative h-2 w-full overflow-hidden border">
                            <div
                                className={`absolute inset-y-0 left-0 transition-all duration-300 ease-out ${isStable ? 'bg-brand-emerald' : 'bg-brand-error'}`}
                                style={{ width: `${stabilityProgress}%` }}
                            />
                            {/* Effet de scanline si en cours */}
                            {stabilityProgress > 0 && stabilityProgress < 100 && (
                                <div className="bg-surface/80 absolute inset-0 animate-[pulse_1s_infinite]" />
                            )}
                        </div>

                        <div className={'text-center'}>
                            <AlphaFeedbackPill
                                message={isStable ? 'RESTEZ STABLE' : 'RECALIBRAGE EN COURS'}
                                type={isStable ? 'success' : 'warning'}
                                pulse={!isStable}
                            />
                        </div>
                    </div>
                </>
            )}

            {gameState === 'win' ||
                (isSolved && <AlphaSuccess message={'Le pare-feu est opérationnel !'} />)}
        </>
    );
}
