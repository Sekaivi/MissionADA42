'use client';

import React, { useEffect, useRef, useState } from 'react';

import { clsx } from 'clsx';

import { AlphaButton } from '@/components/alpha/AlphaButton';
import { AlphaPuzzleHeader } from '@/components/alpha/AlphaGameHeader';
import { AlphaModal } from '@/components/alpha/AlphaModal';
import { AlphaTitle } from '@/components/alpha/AlphaTitle';
import { PuzzleProps } from '@/components/puzzles/PuzzleRegistry';
import { SCENARIO } from '@/data/alphaScenario';

interface DeviceOrientationEventiOS extends DeviceOrientationEvent {
    requestPermission?: () => Promise<'granted' | 'denied'>;
}

export default function MazePuzzle({ onSolve }: PuzzleProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const requestRef = useRef<number | null>(null);
    const timerRef = useRef<number | null>(null);

    // --- ÉTATS UI (CORRIGÉS) ---
    const [timeLeft, setTimeLeft] = useState(70);
    const [gameStatus, setGameStatus] = useState<'idle' | 'playing' | 'won' | 'lost'>('idle');

    // 1. Initialisation Lazy : On vérifie l'environnement une seule fois au démarrage
    const [needsPermission, setNeedsPermission] = useState(() => {
        if (typeof window === 'undefined') return false;
        const deviceEvent = DeviceOrientationEvent as unknown as DeviceOrientationEventiOS;
        return typeof deviceEvent.requestPermission === 'function';
    });

    // 2. Initialisation Lazy
    const [permissionGranted, setPermissionGranted] = useState(() => {
        if (typeof window === 'undefined') return false;
        const deviceEvent = DeviceOrientationEvent as unknown as DeviceOrientationEventiOS;
        // Si pas de fonction requestPermission (Android/PC), c'est accordé par défaut
        return typeof deviceEvent.requestPermission !== 'function';
    });

    // État du jeu
    const gameState = useRef({
        player: { x: 20, y: 10, w: 20, h: 20 },
        target: { x: 250, y: 320, w: 40, h: 40 },
        walls: [
            { x: 60, y: 0, w: 20, h: 10, maxH: 370, speed: 2, direction: 'down', initialY: 0 },
            { x: 180, y: 0, w: 20, h: 10, maxH: 370, speed: 4, direction: 'down', initialY: 0 },
            { x: 120, y: 400, w: 20, h: 10, maxH: 380, speed: 2.5, direction: 'up', initialY: 400 },
            { x: 240, y: 400, w: 20, h: 10, maxH: 380, speed: 4.5, direction: 'up', initialY: 400 },
        ],
        vx: 0,
        vy: 0,
        keys: { ArrowUp: false, ArrowDown: false, ArrowLeft: false, ArrowRight: false },
    });

    // --- DEFINITION DES FONCTIONS ---

    const stopGame = () => {
        if (requestRef.current !== null) cancelAnimationFrame(requestRef.current);
        if (timerRef.current !== null) window.clearInterval(timerRef.current);
    };

    const handleGameOver = (win: boolean) => {
        stopGame();
        setGameStatus(win ? 'won' : 'lost');
        if (typeof navigator !== 'undefined' && navigator.vibrate) {
            navigator.vibrate(win ? [100, 50, 100] : [400]);
        }

        if (win) {
            window.setTimeout(() => {
                onSolve();
            }, SCENARIO.defaultDuration);
        }
    };

    const gameLoop = () => {
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d');
        if (!canvas || !ctx) return;

        const state = gameState.current;
        const width = canvas.width;
        const height = canvas.height;

        // 1. Physique (Murs)
        state.walls.forEach((w) => {
            if (w.h < w.maxH) {
                w.h += w.speed;
                if (w.direction === 'up') w.y -= w.speed;
            }
        });

        // 2. Physique (Joueur)
        let dx = state.vx;
        let dy = state.vy;

        if (state.keys.ArrowUp) dy = -3;
        if (state.keys.ArrowDown) dy = 3;
        if (state.keys.ArrowLeft) dx = -3;
        if (state.keys.ArrowRight) dx = 3;

        state.player.x += dx;
        state.player.y += dy;

        // Bornes
        if (state.player.x < 0) state.player.x = 0;
        if (state.player.y < 0) state.player.y = 0;
        if (state.player.x + state.player.w > width) state.player.x = width - state.player.w;
        if (state.player.y + state.player.h > height) state.player.y = height - state.player.h;

        // 3. Collisions Murs
        let hitWall = false;
        for (const w of state.walls) {
            if (
                state.player.x < w.x + w.w &&
                state.player.x + state.player.w > w.x &&
                state.player.y < w.y + w.h &&
                state.player.y + state.player.h > w.y
            ) {
                hitWall = true;
            }
        }

        if (hitWall) {
            handleGameOver(false);
            return;
        }

        // 4. Victoire
        if (
            state.player.x < state.target.x + state.target.w &&
            state.player.x + state.player.w > state.target.x &&
            state.player.y < state.target.y + state.target.h &&
            state.player.y + state.player.h > state.target.y
        ) {
            handleGameOver(true);
            return;
        }

        // 5. Rendu
        ctx.clearRect(0, 0, width, height);

        // Zone cible
        ctx.fillStyle = 'rgba(16, 185, 129, 0.3)';
        ctx.strokeStyle = '#10b981';
        ctx.lineWidth = 2;
        ctx.fillRect(state.target.x, state.target.y, state.target.w, state.target.h);
        ctx.strokeRect(state.target.x, state.target.y, state.target.w, state.target.h);

        // Murs
        state.walls.forEach((w) => {
            const grad = ctx.createLinearGradient(w.x, w.y, w.x + w.w, w.y + w.h);
            grad.addColorStop(0, '#ef4444');
            grad.addColorStop(1, '#7f1d1d');
            ctx.fillStyle = grad;
            ctx.fillRect(w.x, w.y, w.w, w.h);
        });

        // Joueur
        ctx.fillStyle = '#fff';
        ctx.shadowColor = '#fff';
        ctx.shadowBlur = 10;
        ctx.fillRect(state.player.x, state.player.y, state.player.w, state.player.h);
        ctx.shadowBlur = 0;

        requestRef.current = requestAnimationFrame(gameLoop);
    };

    const startGame = () => {
        setGameStatus('playing');
        setTimeLeft(70);

        gameState.current.player = { x: 20, y: 10, w: 20, h: 20 };
        gameState.current.vx = 0;
        gameState.current.vy = 0;
        gameState.current.walls.forEach((w) => {
            w.h = 10;
            w.y = w.initialY;
        });

        if (requestRef.current !== null) cancelAnimationFrame(requestRef.current);
        requestRef.current = requestAnimationFrame(gameLoop);

        if (timerRef.current !== null) window.clearInterval(timerRef.current);

        timerRef.current = window.setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    handleGameOver(false);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
    };

    const requestAccess = async () => {
        const deviceEvent = DeviceOrientationEvent as unknown as DeviceOrientationEventiOS;
        if (typeof deviceEvent.requestPermission === 'function') {
            try {
                const response = await deviceEvent.requestPermission();
                if (response === 'granted') {
                    setPermissionGranted(true);
                    setNeedsPermission(false);
                } else {
                    alert('Permission requise pour jouer.');
                }
            } catch (e) {
                console.error(e);
            }
        }
    };

    // --- EFFECTS ---

    // Setup initial : On ne garde QUE le nettoyage.
    // La détection d'iOS est déjà faite dans les useState() plus haut.
    useEffect(() => {
        return () => stopGame();
    }, []);

    useEffect(() => {
        const handleOrientation = (e: DeviceOrientationEvent) => {
            if (gameStatus !== 'playing') return;
            gameState.current.vx = (e.gamma || 0) / 5;
            gameState.current.vy = (e.beta || 0) / 5;
        };

        const handleKeyDown = (e: KeyboardEvent) => {
            if (gameState.current.keys.hasOwnProperty(e.key)) {
                gameState.current.keys[e.key as keyof typeof gameState.current.keys] = true;
            }
        };

        const handleKeyUp = (e: KeyboardEvent) => {
            if (gameState.current.keys.hasOwnProperty(e.key)) {
                gameState.current.keys[e.key as keyof typeof gameState.current.keys] = false;
            }
        };

        window.addEventListener('deviceorientation', handleOrientation);
        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);

        return () => {
            window.removeEventListener('deviceorientation', handleOrientation);
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
        };
    }, [gameStatus, permissionGranted]);

    const handleStartClick = () => {
        if (needsPermission && !permissionGranted) {
            requestAccess();
        } else {
            startGame();
        }
    };

    return (
        <div className="flex h-full w-full flex-col items-center gap-4 text-center">
            <AlphaPuzzleHeader
                left={
                    <span className={clsx(timeLeft < 10 && 'text-brand-error animate-pulse')}>
                        TIME: {timeLeft}s
                    </span>
                }
                right={`GYRO_SENSOR: ${permissionGranted ? 'ON' : 'OFF'}`}
            />

            <div className="group relative">
                {gameStatus == 'playing' && (
                    <canvas
                        ref={canvasRef}
                        width={300}
                        height={400}
                        className={clsx(
                            'rounded-lg border-2 shadow-[0_0_20px_var(--color-muted)]',
                            gameStatus === 'playing'
                                ? 'border-brand-emerald shadow-[0_0_15px_var(--color-brand-emerald)]'
                                : 'border-border'
                        )}
                    />
                )}

                {/* OVERLAY ÉCRANS */}
                {gameStatus !== 'playing' && (
                    <>
                        {gameStatus === 'idle' && (
                            <>
                                <AlphaTitle>DÉSARMORÇAGE</AlphaTitle>
                                <p className="text-muted-foreground mb-6">
                                    Incline ton appareil pour guider le fusible (carré blanc) vers
                                    la zone sécurisée.
                                </p>

                                {needsPermission && !permissionGranted ? (
                                    <AlphaButton className={'mx-auto'} onClick={requestAccess}>
                                        ACTIVER CAPTEURS
                                    </AlphaButton>
                                ) : (
                                    <AlphaButton className={'mx-auto'} onClick={handleStartClick}>
                                        LANCER SÉQUENCE
                                    </AlphaButton>
                                )}
                            </>
                        )}

                        {gameStatus === 'won' && (
                            <div className="text-brand-emerald flex animate-pulse flex-col items-center">
                                <span className="mb-2 text-4xl">✓</span>
                                <span className="text-lg font-bold tracking-widest">SUCCÈS</span>
                                <span className="mt-2 text-xs">Redirection...</span>
                            </div>
                        )}

                        <AlphaModal
                            isOpen={gameStatus === 'won'}
                            variant="success"
                            title="Labyrinthe"
                            message="Epreuve passée avec succès"
                            autoCloseDuration={SCENARIO.defaultTimeBeforeNextStep}
                            durationUnit={'ms'}
                        />

                        {gameStatus === 'lost' && (
                            <div className="text-brand-error flex flex-col items-center">
                                <span className="mb-2 text-4xl">✕</span>
                                <span className="text-lg font-bold tracking-widest">ÉCHEC</span>
                                <button
                                    onClick={handleStartClick}
                                    className="border-brand-error text-brand-error hover:bg-brand-error mt-6 rounded border px-6 py-2 text-sm transition-colors hover:text-white"
                                >
                                    RÉINITIALISER
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
