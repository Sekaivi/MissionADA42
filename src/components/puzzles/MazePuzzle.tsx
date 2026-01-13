'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';

import {
    ClockIcon,
    DevicePhoneMobileIcon,
    ExclamationTriangleIcon,
    ShieldCheckIcon,
} from '@heroicons/react/24/solid';
import { clsx } from 'clsx';
import { AnimatePresence, motion } from 'framer-motion';

import { AlphaButton } from '@/components/alpha/AlphaButton';
import { AlphaCard } from '@/components/alpha/AlphaCard';
import FeedbackPill from '@/components/alpha/AlphaFeedbackPill';
import { AlphaPuzzleHeader } from '@/components/alpha/AlphaGameHeader';
import { AlphaModal } from '@/components/alpha/AlphaModal';
import { DialogueBox } from '@/components/dialogueBox';
import { PuzzlePhases, PuzzleProps } from '@/components/puzzles/PuzzleRegistry';
import { SCENARIO } from '@/data/alphaScenario';
import { useGameScenario, useScenarioTransition } from '@/hooks/useGameScenario';
import { useOrientation } from '@/hooks/useOrientation';

// --- TYPES ---

export type MazePuzzlePhases = PuzzlePhases | 'gameover';

interface WallConfig {
    x: number;
    y: number;
    w: number;
    h: number;
    maxH: number;
    speed: number;
    direction: string;
    initialY: number;
}

const GAME_DIMENSIONS = { width: 300, height: 400 };

// Configuration du niveau (Restaurée depuis le code de référence)
const LEVEL_CONFIG = {
    time: 60,
    start: { x: 20, y: 10 },
    target: { x: 260, y: 350, w: 40, h: 50 },
    walls: [
        { x: 60, y: 0, w: 20, h: 0, maxH: 370, speed: 5, direction: 'down', initialY: 0 },
        { x: 180, y: 0, w: 20, h: 0, maxH: 370, speed: 5, direction: 'down', initialY: 0 },
        { x: 120, y: 400, w: 20, h: 0, maxH: 370, speed: 5, direction: 'up', initialY: 400 },
        { x: 240, y: 400, w: 20, h: 0, maxH: 370, speed: 5, direction: 'up', initialY: 400 },
    ],
};

interface GameState {
    player: { x: number; y: number; w: number; h: number };
    walls: WallConfig[];
    vx: number;
    vy: number;
    lastTime: number;
    isLocked: boolean;
    hitFlash: number;
}

export default function MazePuzzle({ onSolve, isSolved, scripts = {}, modalConfig }: PuzzleProps) {
    const {
        gameState: phase,
        triggerPhase,
        isDialogueOpen,
        currentScript,
        onDialogueComplete,
    } = useGameScenario<MazePuzzlePhases>(scripts);

    const { data: orientation, requestPermission, permissionGranted } = useOrientation();
    const calibrationOffset = useRef({ beta: 0, gamma: 0 });

    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [timeLeft, setTimeLeft] = useState(LEVEL_CONFIG.time);
    const [isStabilizing, setIsStabilizing] = useState(false);

    // Ref pour éviter les re-renders inutiles lors de la mise à jour de isStabilizing
    const isStabilizingRef = useRef(false);

    const gameState = useRef<GameState>({
        player: { x: -100, y: -100, w: 20, h: 20 },
        walls: [],
        vx: 0,
        vy: 0,
        lastTime: 0,
        isLocked: true,
        hitFlash: 0,
    });

    const phaseRef = useRef(phase);
    useEffect(() => {
        phaseRef.current = phase;
    }, [phase]);

    // --- LOGIQUE ---

    const initLevel = useCallback(() => {
        const state = gameState.current;
        state.player.x = LEVEL_CONFIG.start.x;
        state.player.y = LEVEL_CONFIG.start.y;
        state.vx = 0;
        state.vy = 0;
        state.isLocked = true;

        state.walls = JSON.parse(JSON.stringify(LEVEL_CONFIG.walls));
        // Typage explicite ici pour éviter l'erreur linter
        state.walls.forEach((w: WallConfig) => {
            w.h = 0;
            w.y = w.initialY;
        });

        if (
            phaseRef.current === 'idle' ||
            phaseRef.current === 'gameover' ||
            phaseRef.current === 'intro'
        ) {
            setTimeLeft(LEVEL_CONFIG.time);
        }

        setIsStabilizing(true);
        isStabilizingRef.current = true;
    }, []);

    const handleStart = async () => {
        await requestPermission();
        initLevel();
        triggerPhase('intro');
    };

    const resetPlayerPosition = () => {
        const state = gameState.current;
        state.player.x = LEVEL_CONFIG.start.x;
        state.player.y = LEVEL_CONFIG.start.y;
        state.vx = 0;
        state.vy = 0;
        state.hitFlash = 10;
    };

    useScenarioTransition(phase, isDialogueOpen, {
        idle: () => {
            if (!isSolved) triggerPhase('idle');
        },
        intro: () => {
            triggerPhase('playing');
        },
        gameover: () => {
            initLevel();
            triggerPhase('playing');
        },
        win: () => {
            setTimeout(() => onSolve(), SCENARIO.defaultTimeBeforeNextStep);
        },
    });

    const handleCalibrate = () => {
        if (orientation) {
            calibrationOffset.current = {
                beta: orientation.beta || 0,
                gamma: orientation.gamma || 0,
            };
            if (navigator.vibrate) navigator.vibrate(50);
        }
    };

    // --- GAME LOOP ---

    const update = useCallback(
        (timestamp: number) => {
            const state = gameState.current;
            const currentPhase = phaseRef.current;
            const { width, height } = GAME_DIMENSIONS;

            if (currentPhase !== 'playing') return;

            if (state.hitFlash > 0) state.hitFlash--;

            // 1. Animation Murs
            let wallsMoving = false;
            state.walls.forEach((w) => {
                if (w.h < w.maxH) {
                    wallsMoving = true;
                    w.h += w.speed;
                    if (w.direction === 'up') w.y -= w.speed;
                }
            });

            // Gestion de l'état "Stabilisation" sans useEffect
            if (wallsMoving !== isStabilizingRef.current) {
                isStabilizingRef.current = wallsMoving;
                setIsStabilizing(wallsMoving);
            }

            if (wallsMoving) {
                state.isLocked = true;
                state.lastTime = timestamp;
                return;
            } else {
                state.isLocked = false;
            }

            // 2. Timer
            if (timestamp - state.lastTime >= 1000) {
                setTimeLeft((prev) => {
                    if (prev <= 1) {
                        setTimeout(() => triggerPhase('gameover'), 0);
                        return 0;
                    }
                    return prev - 1;
                });
                state.lastTime = timestamp;
            } else if (state.lastTime === 0) {
                state.lastTime = timestamp;
            }

            // 3. Physique
            const beta = (orientation?.beta || 0) - calibrationOffset.current.beta;
            const gamma = (orientation?.gamma || 0) - calibrationOffset.current.gamma;

            state.vx = gamma / 5;
            state.vy = beta / 5;

            state.player.x += state.vx;
            state.player.y += state.vy;

            state.player.x = Math.max(0, Math.min(width - state.player.w, state.player.x));
            state.player.y = Math.max(0, Math.min(height - state.player.h, state.player.y));

            // 4. Collisions
            for (const w of state.walls) {
                if (
                    state.player.x < w.x + w.w &&
                    state.player.x + state.player.w > w.x &&
                    state.player.y < w.y + w.h &&
                    state.player.y + state.player.h > w.y
                ) {
                    if (navigator.vibrate) navigator.vibrate(200);
                    resetPlayerPosition();
                    return;
                }
            }

            // 5. Victoire
            const target = LEVEL_CONFIG.target;
            if (
                state.player.x < target.x + target.w &&
                state.player.x + state.player.w > target.x &&
                state.player.y < target.y + target.h &&
                state.player.y + state.player.h > target.y
            ) {
                if (navigator.vibrate) navigator.vibrate([100, 50, 100]);
                setTimeout(() => triggerPhase('win'), 0);
            }
        },
        [orientation, triggerPhase]
    );

    // --- DRAW LOOP ---

    const draw = useCallback((ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => {
        const { walls, player, isLocked, hitFlash } = gameState.current;
        const target = LEVEL_CONFIG.target;
        const currentPhase = phaseRef.current;

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        if (currentPhase === 'idle') return;

        if (currentPhase === 'intro') {
            ctx.globalAlpha = 0.5;
        } else {
            ctx.globalAlpha = 1;
        }

        if (hitFlash > 0) {
            ctx.fillStyle = `rgba(239, 68, 68, ${hitFlash / 10})`;
            ctx.fillRect(0, 0, GAME_DIMENSIONS.width, GAME_DIMENSIONS.height);
        }

        ctx.strokeStyle = '#10b981';
        ctx.lineWidth = 4;
        ctx.strokeRect(0, 0, GAME_DIMENSIONS.width, GAME_DIMENSIONS.height);

        ctx.fillStyle = '#FFF';
        ctx.shadowColor = '#FFF';
        ctx.shadowBlur = 15;
        ctx.fillRect(target.x, target.y, target.w, target.h);
        ctx.shadowBlur = 0;
        ctx.fillStyle = '#000';
        ctx.font = 'bold 12px monospace';
        ctx.fillText('EXIT', target.x + 10, target.y + 20);

        walls.forEach((w) => {
            const grad = ctx.createLinearGradient(w.x, w.y, w.x + w.w, w.y + w.h);
            grad.addColorStop(0, '#ff0000');
            grad.addColorStop(1, '#ff5555');
            ctx.fillStyle = grad;
            ctx.shadowColor = '#f00';
            ctx.shadowBlur = 8;
            ctx.fillRect(w.x, w.y, w.w, w.h);
        });
        ctx.shadowBlur = 0;

        if (isLocked) {
            ctx.fillStyle = '#555';
        } else {
            ctx.fillStyle = '#FFF';
            ctx.shadowColor = '#FFF';
            ctx.shadowBlur = 20;
        }
        ctx.fillRect(player.x, player.y, player.w, player.h);
        ctx.shadowBlur = 0;
        ctx.globalAlpha = 1;
    }, []);

    useEffect(() => {
        let animationFrameId: number;
        const loop = (time: number) => {
            const canvas = canvasRef.current;
            if (canvas) {
                const ctx = canvas.getContext('2d');
                if (ctx) {
                    update(time);
                    draw(ctx, canvas);
                }
            }
            animationFrameId = requestAnimationFrame(loop);
        };
        animationFrameId = requestAnimationFrame(loop);
        return () => cancelAnimationFrame(animationFrameId);
    }, [update, draw]);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (canvas) {
            const dpr = window.devicePixelRatio || 1;
            canvas.width = GAME_DIMENSIONS.width * dpr;
            canvas.height = GAME_DIMENSIONS.height * dpr;
            const ctx = canvas.getContext('2d');
            if (ctx) ctx.scale(dpr, dpr);
        }
    }, []);

    if (isSolved)
        return (
            <AlphaModal
                isOpen={true}
                variant="success"
                title={modalConfig?.title || 'Terminé'}
                message={modalConfig?.message || 'Module désactivé.'}
            />
        );

    return (
        <div className="mx-auto w-full max-w-md">
            <DialogueBox
                isOpen={isDialogueOpen}
                script={currentScript}
                onComplete={onDialogueComplete}
            />

            <AlphaModal
                isOpen={phase === 'win' && !isDialogueOpen}
                variant={'success'}
                title={modalConfig?.title || 'Puzzle validé'}
                message={modalConfig?.message || ''}
                autoCloseDuration={SCENARIO.defaultTimeBeforeNextStep}
                durationUnit={'ms'}
            />

            <AlphaPuzzleHeader
                className="mb-4"
                left={
                    <div className="flex items-center gap-2">
                        {phase === 'win' ? (
                            <ShieldCheckIcon className="text-brand-emerald h-5 w-5" />
                        ) : (
                            <ExclamationTriangleIcon className="text-brand-error h-5 w-5 animate-pulse" />
                        )}
                        <span
                            className={clsx(
                                'text-sm font-bold tracking-wider',
                                phase === 'win' ? 'text-brand-emerald' : 'text-brand-error'
                            )}
                        >
                            {phase === 'playing' ? 'ACTIVE' : 'STANDBY'}
                        </span>
                    </div>
                }
                right={
                    <div className="flex items-center gap-2 text-white/80">
                        <ClockIcon className="h-4 w-4" />
                        <span
                            className={clsx(
                                'font-mono text-lg font-bold',
                                timeLeft < 15 && 'text-brand-error animate-pulse'
                            )}
                        >
                            {timeLeft}s
                        </span>
                    </div>
                }
            />

            <AlphaCard className="border-brand-emerald/30 relative flex aspect-[3/4] items-center justify-center overflow-hidden bg-black/50 p-0">
                <AnimatePresence>
                    {(phase === 'win' || phase === 'gameover' || phase === 'idle') &&
                        !isDialogueOpen && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/80 p-6 backdrop-blur-sm"
                            >
                                {phase === 'idle' && (
                                    <div className="text-center">
                                        <h2 className="mb-2 text-2xl font-bold text-white">
                                            GYRO-LABYRINTHE
                                        </h2>
                                        <p className="text-muted-foreground mb-6 text-sm">
                                            Guidez le fusible blanc vers la zone "EXIT".
                                            <br />
                                            <span className="text-xs opacity-70">
                                                (Inclinez l'appareil pour jouer)
                                            </span>
                                        </p>
                                        {!permissionGranted ? (
                                            <AlphaButton
                                                onClick={handleStart}
                                                variant="primary"
                                                className="animate-pulse"
                                            >
                                                <DevicePhoneMobileIcon className="mr-2 h-5 w-5" />
                                                ACTIVER & JOUER
                                            </AlphaButton>
                                        ) : (
                                            <AlphaButton onClick={() => triggerPhase('intro')}>
                                                LANCER SÉQUENCE
                                            </AlphaButton>
                                        )}
                                    </div>
                                )}

                                {phase === 'win' && (
                                    <div className="text-center">
                                        <h2 className="text-brand-emerald mb-4 text-2xl font-black">
                                            SUCCÈS
                                        </h2>
                                    </div>
                                )}

                                {phase === 'gameover' && (
                                    <div className="text-center">
                                        <h2 className="text-brand-error mb-4 text-2xl font-black">
                                            TEMPS ÉCOULÉ
                                        </h2>
                                    </div>
                                )}
                            </motion.div>
                        )}
                </AnimatePresence>

                <canvas ref={canvasRef} className="h-full w-full object-contain" />
            </AlphaCard>

            <div className="mt-4 space-y-3">
                {permissionGranted && phase === 'playing' && (
                    <>
                        <div className="flex gap-2">
                            <AlphaButton
                                fullWidth
                                variant="secondary"
                                onClick={handleCalibrate}
                                className="opacity-60 transition-opacity hover:opacity-100"
                            >
                                <DevicePhoneMobileIcon className="mr-2 h-5 w-5" />
                                Recalibrer position
                            </AlphaButton>
                        </div>
                        <div className="flex justify-center">
                            <FeedbackPill
                                message={
                                    isStabilizing
                                        ? 'INITIALISATION SYSTÈME...'
                                        : 'INCLINEZ POUR GUIDER'
                                }
                                type={isStabilizing ? 'error' : 'info'}
                                pulse
                            />
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
