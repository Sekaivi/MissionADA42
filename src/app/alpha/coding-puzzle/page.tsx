'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';

import { CodeBlock, GameHud, TargetSlot } from '@/components/alpha/HUD';
import { IntroScreen } from '@/components/alpha/IntroScreen';
import { MessageScreen } from '@/components/alpha/MessageScreen';
import { useOrientation } from '@/hooks/useOrientation';

// --- TYPES ---
type Difficulty = 'easy' | 'medium' | 'hard';
type GameState = 'intro' | 'playing' | 'win' | 'breach' | 'lockdown';

interface Block {
    id: number;
    text: string;
    x: number;
    y: number;
    isLocked: boolean;
    targetSlotId: number;
}

// --- DATA ---
const PUZZLE_DATA: Record<Difficulty, string[]> = {
    easy: ['<html>', '<body>', '<h1>HACKED</h1>', '</body>', '</html>', ''],
    medium: [
        'function bypass() {',
        '  let firewall = false;',
        '  if (!firewall) {',
        '    grantAccess();',
        '  }',
        '}',
    ],
    hard: [
        'M ← ?5 5⍴10',
        'E ← ⌽⍉((M+.×M)∘.-⌹M)',
        'R ← +/⍤1⊢((M∘.*E)∘.○(⍳5))',
        'Verified ← {',
        '  (+/⍵) ÷ ≢⍵',
        '}',
    ],
};

// Constantes de jeu
const STARTING_LINES = 3;
const SENSITIVITY = 1;
const DEAD_ZONE = 1;
const SLOT_HEIGHT = 50;
const START_Y = 20;
const SNAP_DISTANCE = 50;
const LOCK_TIME_MS = 1500;

export default function CodingPuzzle() {
    // Hooks
    const { data: orientationData, requestPermission, permissionGranted } = useOrientation();

    // --- STATE GLOBAL ---
    const [gameState, setGameState] = useState<GameState>('intro');
    const [difficulty, setDifficulty] = useState<Difficulty>('easy');

    // --- STATE DU NIVEAU ---
    const [activeLinesCount, setActiveLinesCount] = useState(STARTING_LINES);
    const [puzzleLines, setPuzzleLines] = useState<string[]>([]);
    // Remplacement du 'any' par le type Block
    const [blocks, setBlocks] = useState<Block[]>([]);

    // État interaction
    const [activeBlockId, setActiveBlockId] = useState<number | null>(null);
    const [snapReadySlotId, setSnapReadySlotId] = useState<number | null>(null);

    // --- REFS (Physique & Logique) ---
    const containerRef = useRef<HTMLDivElement>(null);
    const reqRef = useRef<number>(null);
    const activeBlockPosRef = useRef({ x: 0, y: 0 });
    const snapTimerRef = useRef<NodeJS.Timeout | null>(null);
    const orientationRef = useRef(orientationData);

    // Refs pour accéder au state dans la boucle sans la recréer
    const blocksRef = useRef<Block[]>([]);
    const puzzleLinesRef = useRef<string[]>([]);
    const activeBlockIdRef = useRef<number | null>(null);
    const snapReadySlotIdRef = useRef<number | null>(null);

    // Synchronisation Refs <-> State
    useEffect(() => {
        orientationRef.current = orientationData;
    }, [orientationData]);
    useEffect(() => {
        blocksRef.current = blocks;
    }, [blocks]);
    useEffect(() => {
        puzzleLinesRef.current = puzzleLines;
    }, [puzzleLines]);
    useEffect(() => {
        activeBlockIdRef.current = activeBlockId;
    }, [activeBlockId]);
    useEffect(() => {
        snapReadySlotIdRef.current = snapReadySlotId;
    }, [snapReadySlotId]);

    // --- LOGIQUE

    // 1. Verrouillage d'un bloc
    const lockBlock = useCallback((blockId: number, slotId: number) => {
        const containerW = containerRef.current?.clientWidth || 0;
        const targetX = containerW / 2 - 140;
        const targetY = START_Y + slotId * SLOT_HEIGHT;

        setActiveBlockId(null);
        setSnapReadySlotId(null);

        setBlocks((prev) =>
            prev.map((b) => {
                if (b.id === blockId) {
                    return { ...b, isLocked: true, x: targetX, y: targetY };
                }
                return b;
            })
        );
    }, []);

    // --- SETUP NIVEAU ---
    const setupLevel = useCallback((diff: Difficulty, count: number) => {
        const fullData = PUZZLE_DATA[diff];
        const realCount = Math.min(count, fullData.length);
        const currentLines = fullData.slice(0, realCount);

        setPuzzleLines(currentLines);

        // Fallback safe si window n'est pas dispo (SSR)
        const winW = typeof window !== 'undefined' ? window.innerWidth : 1000;
        const winH = typeof window !== 'undefined' ? window.innerHeight : 800;

        const containerW = winW * 0.9;
        const containerH = winH * 0.6;

        const newBlocks: Block[] = currentLines.map((line, index) => ({
            id: index,
            text: line,
            x: Math.random() * (containerW - 280),
            y: Math.random() * (containerH - 50),
            isLocked: false,
            targetSlotId: index,
        }));

        setBlocks(newBlocks);
        setActiveBlockId(null);
        setSnapReadySlotId(null);
    }, []);

    const handleStartGame = async () => {
        if (requestPermission) await requestPermission();
        setActiveLinesCount(STARTING_LINES);
        setupLevel(difficulty, STARTING_LINES);
        setGameState('playing');
    };

    const handleRetry = () => {
        const nextCount = activeLinesCount + 1;
        setActiveLinesCount(nextCount);
        setupLevel(difficulty, nextCount);
        setGameState('playing');
    };

    // --- GAME LOOP (Physique) ---
    const loopFunctionRef = useRef<(time: number) => void>(null);

    const gameLoop = useCallback(
        (time: number) => {
            if (
                gameState !== 'playing' ||
                activeBlockIdRef.current === null ||
                !containerRef.current
            ) {
                if (gameState === 'playing') {
                    reqRef.current = requestAnimationFrame((t) => loopFunctionRef.current?.(t));
                }
                return;
            }

            // Physique
            const { beta, gamma } = orientationRef.current;
            const safeBeta = beta || 0;
            const safeGamma = gamma || 0;

            let vy = 0;
            let vx = 0;

            if (Math.abs(safeBeta) > DEAD_ZONE) {
                vy = (safeBeta - Math.sign(safeBeta) * DEAD_ZONE) * SENSITIVITY;
            }
            if (Math.abs(safeGamma) > DEAD_ZONE) {
                vx = (safeGamma - Math.sign(safeGamma) * DEAD_ZONE) * SENSITIVITY;
            }

            let newX = activeBlockPosRef.current.x + vx;
            let newY = activeBlockPosRef.current.y + vy;

            const containerRect = containerRef.current.getBoundingClientRect();
            const maxW = containerRect.width - 280;
            const maxH = containerRect.height - 40;

            newX = Math.max(0, Math.min(newX, maxW));
            newY = Math.max(0, Math.min(newY, maxH));

            activeBlockPosRef.current = { x: newX, y: newY };

            const blockEl = document.getElementById(`block-${activeBlockIdRef.current}`);
            if (blockEl) {
                blockEl.style.transform = `translate(${newX}px, ${newY}px)`;
            }

            // Logique de Snap (checkSnap inline pour éviter les deps)
            const containerW = containerRef.current?.clientWidth || 0;
            const slotCenterX = containerW / 2 - 140;
            let closestSlotId = -1;
            let minDist = Infinity;

            // On utilise la Ref des lignes pour ne pas dépendre du state qui change
            const currentLines = puzzleLinesRef.current;

            currentLines.forEach((_, index) => {
                const slotY = START_Y + index * SLOT_HEIGHT;
                const dist = Math.hypot(newX - slotCenterX, newY - slotY);
                if (dist < minDist) {
                    minDist = dist;
                    closestSlotId = index;
                }
            });

            if (minDist < SNAP_DISTANCE) {
                // Si on est proche d'un slot
                if (snapReadySlotIdRef.current !== closestSlotId) {
                    // On met à jour le state via le setter normal (ce qui déclenchera un re-render, c'est ok)
                    setSnapReadySlotId(closestSlotId);

                    if (snapTimerRef.current) clearTimeout(snapTimerRef.current);

                    // On capture l'ID actuel pour la closure du timeout
                    const currentBlockId = activeBlockIdRef.current;

                    snapTimerRef.current = setTimeout(() => {
                        // On vérifie qu'on est toujours sur le même bloc et au même endroit
                        if (activeBlockIdRef.current === currentBlockId) {
                            lockBlock(currentBlockId, closestSlotId);
                        }
                    }, LOCK_TIME_MS);
                }
            } else {
                // On est loin
                if (snapReadySlotIdRef.current !== null) {
                    setSnapReadySlotId(null);
                    if (snapTimerRef.current) clearTimeout(snapTimerRef.current);
                }
            }

            reqRef.current = requestAnimationFrame((t) => loopFunctionRef.current?.(t));
        },
        [gameState, lockBlock]
    ); // Dépendances stables

    // Assignation de la ref pour la récursion
    useEffect(() => {
        loopFunctionRef.current = gameLoop;
    }, [gameLoop]);

    // Lancement de la boucle
    useEffect(() => {
        if (gameState === 'playing') {
            reqRef.current = requestAnimationFrame((t) => loopFunctionRef.current?.(t));
        }
        return () => {
            if (reqRef.current) cancelAnimationFrame(reqRef.current);
        };
    }, [gameState]);

    // --- ACTIONS UTILISATEUR ---

    const selectBlock = (id: number, x: number, y: number) => {
        const blk = blocks.find((b) => b.id === id);
        if (blk?.isLocked) return;

        setActiveBlockId(id);
        activeBlockPosRef.current = { x, y };

        setSnapReadySlotId(null);
        if (snapTimerRef.current) clearTimeout(snapTimerRef.current);
    };

    const verifyCode = () => {
        const allCorrect = blocks.every(
            (b) => b.isLocked && b.targetSlotId === puzzleLines.indexOf(b.text)
        );

        if (allCorrect) {
            setGameState('win');
        } else {
            const maxAvailable = PUZZLE_DATA[difficulty].length;
            if (activeLinesCount < maxAvailable) {
                setGameState('breach');
            } else {
                setGameState('lockdown');
            }
        }
    };

    return (
        <div className="theme-dark bg-background text-brand-emerald relative flex h-screen w-full flex-col items-center justify-center overflow-hidden font-mono select-none">
            {/* Scanlines */}
            <div className="pointer-events-none absolute inset-0 z-50 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%]"></div>

            {/* INTRO */}
            {gameState === 'intro' && (
                <IntroScreen
                    difficulty={difficulty}
                    setDifficulty={setDifficulty}
                    onStart={handleStartGame}
                />
            )}

            {/* MESSAGES */}
            {(gameState === 'win' || gameState === 'breach' || gameState === 'lockdown') && (
                <MessageScreen
                    type={gameState}
                    onAction={() => {
                        if (gameState === 'win' || gameState === 'lockdown') {
                            window.location.reload();
                        } else if (gameState === 'breach') {
                            handleRetry();
                        }
                    }}
                />
            )}

            {/* JEU */}
            {gameState === 'playing' && (
                <div className="relative z-10 flex w-full max-w-3xl flex-col items-center">
                    <GameHud levelCount={activeLinesCount} gyroActive={permissionGranted} />

                    <div
                        ref={containerRef}
                        className="border-brand-emerald relative h-[60vh] w-[90vw] overflow-hidden border-2 bg-black/80 shadow-[0_0_20px_rgba(0,212,146,0.2)]"
                    >
                        {puzzleLines.map((_, index) => (
                            <TargetSlot
                                key={`slot-${index}`}
                                index={index}
                                isSnapReady={snapReadySlotId === index}
                                top={START_Y + index * SLOT_HEIGHT}
                            />
                        ))}

                        {blocks.map((block) => (
                            <CodeBlock
                                key={block.id}
                                {...block}
                                isActive={activeBlockId === block.id}
                                onSelect={() => selectBlock(block.id, block.x, block.y)}
                            />
                        ))}
                    </div>

                    <button
                        onClick={verifyCode}
                        className="border-brand-emerald text-brand-emerald hover:bg-brand-emerald mt-6 border px-10 py-3 tracking-widest uppercase transition-all hover:text-black active:scale-95"
                    >
                        EXECUTE_CODE()
                    </button>

                    <p className="text-muted mt-2 text-xs">
                        Tap a block to select • Tilt device to move
                    </p>
                </div>
            )}
        </div>
    );
}
