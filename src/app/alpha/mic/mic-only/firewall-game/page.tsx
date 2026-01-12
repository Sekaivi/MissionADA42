'use client';

import { useEffect, useRef, useState } from 'react';

import { FireIcon, HandThumbUpIcon } from '@heroicons/react/24/solid';

import { AlphaButton } from '@/components/alpha/AlphaButton';
import { AlphaCard } from '@/components/alpha/AlphaCard';
import { AlphaHeader } from '@/components/alpha/AlphaHeader';
import { useFirewallLogic } from '@/hooks/useFirewallLogic';
import { useMicrophone } from '@/hooks/useMicrophone';
import { useOrientation } from '@/hooks/useOrientation';

const GAME_STATES = {
    IDLE: 'IDLE',
    PLAYING: 'PLAYING',
    WIN: 'WIN',
} as const;
type GameStatus = (typeof GAME_STATES)[keyof typeof GAME_STATES];

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
            color: 'text-red-500',
            border: 'border-red-500',
            shadow: 'shadow-red-500/40',
            bg: 'bg-red-500',
        };
    return {
        color: 'text-red-900',
        border: 'border-red-900',
        shadow: 'shadow-red-900/60',
        bg: 'bg-red-900',
    };
};

export default function FirewallGame() {
    const [gameState, setGameState] = useState<GameStatus>(GAME_STATES.IDLE);

    // CAPTEURS
    const { data: orientationData } = useOrientation();
    const { data: mic, requestPermission } = useMicrophone();

    // LOGIQUE DE JEU
    const { temp, stabilityProgress, isStable } = useFirewallLogic({
        isActive: gameState === GAME_STATES.PLAYING,
        orientation: orientationData,
        isBlowing: mic.isBlowing,
        onWin: () => setGameState(GAME_STATES.WIN),
    });

    const onStart = async () => {
        await requestPermission();
        setGameState(GAME_STATES.PLAYING);
    };

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

    return (
        <>
            <style jsx global>{`
                .fan-smooth {
                    transition:
                        transform 0.1s linear,
                        color 0.5s ease;
                }
            `}</style>

            <AlphaHeader
                title="Pare-feu : Surchauffe"
                subtitle="Refroidissement d'urgence requis"
            />

            <AlphaCard title="Interface Système">
                <div className="flex min-h-[400px] flex-col items-center justify-center p-4">
                    {/* ÉTAT 1: DEMANDE D'ACCÈS */}
                    {gameState === GAME_STATES.IDLE && (
                        <div className="w-full max-w-sm">
                            <AlphaCard
                                className="relative border-red-500/50 bg-black shadow-[0_0_30px_rgba(220,38,38,0.4)]"
                                title="ALERTE CRITIQUE"
                            >
                                <div className="pointer-events-none absolute inset-0 animate-pulse bg-red-500/10" />
                                <div className="relative z-10 flex flex-col items-center gap-6 py-6 text-center">
                                    <div className="relative">
                                        <div className="absolute inset-0 animate-ping rounded-full bg-red-600/30" />
                                        <FireIcon className="h-20 w-20 text-red-500" />
                                    </div>

                                    <div className="space-y-2">
                                        <h2 className="text-xl font-black tracking-widest text-red-500 uppercase">
                                            {'>>'}Surchauffe Imminente
                                        </h2>
                                        <p className="text-xs font-bold text-white/50">
                                            {'>_'}INTERVENTION MANUELLE REQUISE
                                        </p>
                                        <p className="font-mono text-xs text-red-300/80">
                                            Le système a l’air instable et en surchauffe, essayez de
                                            réparer ça avant que tout foute le camp
                                        </p>
                                    </div>

                                    <AlphaButton onClick={onStart}>
                                        DÉPLOYER L'UNITÉ DE REFROIDISSEMENT
                                    </AlphaButton>
                                    <div className="flex w-full justify-between pt-4 text-[8px] font-bold tracking-[0.2em] text-red-600 uppercase">
                                        <span>Auth: ADMIN_01</span>
                                        <span className="animate-bounce">Action nécessaire</span>
                                    </div>
                                </div>
                            </AlphaCard>
                        </div>
                    )}

                    {/* ÉTAT 2: JEU EN COURS */}
                    {gameState === GAME_STATES.PLAYING && (
                        <div className="w-full max-w-sm space-y-8">
                            {/* LE CERCLE PARE-FEU */}
                            <div className="relative flex items-center justify-center py-4">
                                {/* Wrapper pour le tremblement */}
                                <div
                                    ref={shakeRef}
                                    className="relative transition-transform duration-75 will-change-transform"
                                >
                                    {/* Le Cercle SVG */}
                                    <div
                                        className={`relative h-48 w-48 rounded-full border-8 ${thermalStyle.border} ${thermalStyle.shadow} flex items-center justify-center bg-black/50 shadow-[0_0_50px_currentColor] backdrop-blur-sm transition-all duration-500`}
                                    >
                                        {/* Texte Température au centre */}
                                        <div className="flex flex-col items-center">
                                            <span
                                                className={`font-mono text-4xl font-black ${thermalStyle.color} transition-colors duration-300`}
                                            >
                                                {Math.floor(temp)}°C
                                            </span>
                                            <span className="mt-1 text-[9px] tracking-widest text-neutral-500 uppercase">
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
                                        className={`fan-smooth h-16 w-16 ${mic.isBlowing && isStable ? 'text-cyan-400' : 'text-neutral-700'}`}
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
                                        <circle
                                            cx="12"
                                            cy="12"
                                            r="3"
                                            className="fill-current opacity-20"
                                        />
                                    </svg>
                                </div>
                                <div className="h-4 text-center font-mono text-[10px] tracking-widest">
                                    {mic.isBlowing ? (
                                        isStable ? (
                                            <span className="animate-pulse text-cyan-400">
                                                FLUX D'AIR ACTIF
                                            </span>
                                        ) : (
                                            <span className="text-red-500">
                                                ERREUR: INSTABILITÉ
                                            </span>
                                        )
                                    ) : (
                                        <span className="text-neutral-600">
                                            EN ATTENTE DE SOUFFLE...
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* BARRE DE STABILITÉ */}
                            <div className="space-y-2">
                                <div className="flex justify-between text-[10px] font-bold text-neutral-400 uppercase">
                                    <span>Stabilité Gyroscopique</span>
                                    <span
                                        className={
                                            !isStable
                                                ? 'animate-pulse text-red-500'
                                                : 'text-green-500'
                                        }
                                    >
                                        {Math.floor(stabilityProgress)}%
                                    </span>
                                </div>
                                <div className="relative h-2 w-full overflow-hidden border border-neutral-800 bg-neutral-900">
                                    <div
                                        className={`absolute inset-y-0 left-0 transition-all duration-300 ease-out ${isStable ? 'bg-cyan-500' : 'bg-red-900'}`}
                                        style={{ width: `${stabilityProgress}%` }}
                                    />
                                    {/* Effet de scanline si en cours */}
                                    {stabilityProgress > 0 && stabilityProgress < 100 && (
                                        <div className="absolute inset-0 animate-[pulse_0.5s_infinite] bg-white/20" />
                                    )}
                                </div>
                                <p
                                    className={`text-center font-mono text-[9px] ${stabilityProgress > 0 && stabilityProgress < 100 ? 'animate-pulse text-cyan-500' : 'text-neutral-600'}`}
                                >
                                    {isStable
                                        ? "MAINTENEZ LA POSITION DE L'APPAREIL"
                                        : 'RECALIBRAGE EN COURS'}
                                </p>
                            </div>
                        </div>
                    )}

                    {/* ÉTAT 3: VICTOIRE */}
                    {gameState === GAME_STATES.WIN && (
                        <div className="animate-in fade-in zoom-in text-center duration-500">
                            <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-green-500/20 shadow-[0_0_40px_rgba(34,197,94,0.4)]">
                                <HandThumbUpIcon className="h-14 w-14 animate-bounce text-green-500" />
                            </div>
                            <h2 className="mb-2 text-2xl font-black text-white">
                                REFROIDISSEMENT RÉUSSI
                            </h2>
                            <p className="font-mono text-sm text-green-400">
                                "Ah voilà une bonne chose de faite."
                            </p>
                            <div className="mt-8">
                                <AlphaButton onClick={() => window.location.reload()}>
                                    REINITIALISER LE SYSTÈME
                                </AlphaButton>
                            </div>
                        </div>
                    )}
                </div>
            </AlphaCard>
        </>
    );
}
