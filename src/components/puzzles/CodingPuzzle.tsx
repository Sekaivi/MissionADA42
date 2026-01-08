'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';

import { AlphaButton } from '@/components/alpha/AlphaButton';
import { AlphaPuzzleHeader } from '@/components/alpha/AlphaGameHeader';
import { AlphaMessageScreen, MessageVariant } from '@/components/alpha/AlphaMessageScreen';
import { AlphaScanlines } from '@/components/alpha/AlphaScanlines';
import { AlphaSuccess } from '@/components/alpha/AlphaSuccess';
import { AlphaTitle } from '@/components/alpha/AlphaTitle';
import { CodeBlock, TargetSlot } from '@/components/alpha/HUD';
import { PuzzleProps } from '@/components/puzzles/PuzzleRegistry';
import { useOrientation } from '@/hooks/useOrientation';
import { Difficulty } from '@/types/game';

type GameState = 'intro' | 'playing' | 'win' | 'breach' | 'lockdown';

const PUZZLE_CONSTANTS = {
    STARTING_LINES: 3,
    SENSITIVITY: 1,
    DEAD_ZONE: 1,
    SLOT_HEIGHT: 50,
    START_Y: 20,
    SNAP_DISTANCE: 50,
    LOCK_TIME_MS: 1500,
};

const PUZZLE_DATA: Record<Difficulty, string[]> = {
    easy: ['\x3Chtml>', '\x3Cbody>', '\x3Ch1>HACKED', '\x3C/h1>', '\x3C/body>', '\x3C/html>'],
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

const MESSAGE_CONFIG: Record<
    'win' | 'breach' | 'lockdown',
    {
        title: string;
        description: string;
        actionLabel: string;
        variant: MessageVariant;
        titleClass?: string;
    }
> = {
    win: {
        title: 'ACCESS GRANTED',
        description: 'Root privileges acquired.\nSystem unlocked.',
        actionLabel: 'EXIT_SYSTEM()',
        variant: 'success',
    },
    breach: {
        title: '/// SECURITY BREACH ///',
        description: 'Firewall counter-measures detected.\nCode complexity increased.',
        actionLabel: 'RETRY_CONNECT()',
        variant: 'error',
        titleClass: 'animate-pulse glitch-effect',
    },
    lockdown: {
        title: 'SYSTEM LOCKDOWN',
        description: 'Too many failed attempts.\nSystem requires manual reboot.',
        actionLabel: 'REBOOT_SYSTEM()',
        variant: 'error',
    },
};

interface Block {
    id: number;
    text: string;
    x: number;
    y: number;
    isLocked: boolean;
    targetSlotId: number;
    placedSlotId?: number; // Correction 1 : Ajout de la propriété
}

interface IntroScreenProps {
    difficulty: Difficulty;
    setDifficulty: (d: Difficulty) => void;
    onStart: () => void;
}

const IntroScreen = ({ difficulty, setDifficulty, onStart }: IntroScreenProps) => (
    <div className="space-y-12">
        <div className={'text-center'}>
            <AlphaTitle>SYSTEM_ACCESS</AlphaTitle>
            <p className="text-muted">Gyroscope Module Required</p>
        </div>

        <div className={'mx-auto w-full max-w-xs space-y-8'}>
            <div className="space-y-3">
                <p className="text-muted text-center uppercase">Security Layer</p>
                <div className="flex gap-2">
                    {(['easy', 'medium', 'hard'] as const).map((lvl) => (
                        <AlphaButton
                            key={lvl}
                            variant={'secondary'}
                            isActive={difficulty === lvl}
                            onClick={() => setDifficulty(lvl)}
                            className="flex-1"
                        >
                            {lvl}
                        </AlphaButton>
                    ))}
                </div>
            </div>

            <AlphaButton onClick={onStart} fullWidth className="mx-auto">
                INITIATE_HACK()
            </AlphaButton>
        </div>
    </div>
);

export const CodingPuzzle: React.FC<PuzzleProps> = ({ onSolve, isSolved }) => {
    const { data: orientationData, requestPermission, permissionGranted } = useOrientation();

    // States
    const [gameState, setGameState] = useState<GameState>('intro');
    const [difficulty, setDifficulty] = useState<Difficulty>('easy');
    const [activeLinesCount, setActiveLinesCount] = useState(PUZZLE_CONSTANTS.STARTING_LINES);

    // Game Data
    const [puzzleLines, setPuzzleLines] = useState<string[]>([]);
    const [blocks, setBlocks] = useState<Block[]>([]);
    const [activeBlockId, setActiveBlockId] = useState<number | null>(null);
    const [snapReadySlotId, setSnapReadySlotId] = useState<number | null>(null);

    // Refs
    const containerRef = useRef<HTMLDivElement>(null);
    const reqRef = useRef<number>(null);
    const loopRef = useRef<(time: number) => void>(null);
    const activeBlockPosRef = useRef({ x: 0, y: 0 });
    const snapTimerRef = useRef<NodeJS.Timeout | null>(null);
    const lastTimeRef = useRef<number>(0);

    // Sync Refs
    const orientationRef = useRef(orientationData);
    const puzzleLinesRef = useRef<string[]>([]);
    const activeBlockIdRef = useRef<number | null>(null);
    const snapReadySlotIdRef = useRef<number | null>(null);

    useEffect(() => {
        orientationRef.current = orientationData;
    }, [orientationData]);
    useEffect(() => {
        puzzleLinesRef.current = puzzleLines;
    }, [puzzleLines]);
    useEffect(() => {
        activeBlockIdRef.current = activeBlockId;
    }, [activeBlockId]);
    useEffect(() => {
        snapReadySlotIdRef.current = snapReadySlotId;
    }, [snapReadySlotId]);

    // --- LOGIQUE MÉTIER ---

    const setupLevel = useCallback((diff: Difficulty, count: number) => {
        const fullData = PUZZLE_DATA[diff];
        const currentLines = fullData.slice(0, Math.min(count, fullData.length));
        setPuzzleLines(currentLines);

        const newBlocks: Block[] = currentLines.map((line, index) => ({
            id: index,
            text: line,
            x: 50 + Math.random() * 150,
            y: 100 + Math.random() * 200,
            isLocked: false,
            targetSlotId: index,
            placedSlotId: undefined, // Reset
        }));

        setBlocks(newBlocks);
        setActiveBlockId(null);
        setSnapReadySlotId(null);
    }, []);

    const lockBlock = useCallback((blockId: number, slotId: number) => {
        const containerW = containerRef.current?.clientWidth || 0;
        const targetX = containerW / 2 - 140;
        const targetY = PUZZLE_CONSTANTS.START_Y + slotId * PUZZLE_CONSTANTS.SLOT_HEIGHT;

        setActiveBlockId(null);
        setSnapReadySlotId(null);

        setBlocks((prev) =>
            prev.map((b) =>
                b.id === blockId
                    ? {
                          ...b,
                          isLocked: true,
                          x: targetX,
                          y: targetY,
                          placedSlotId: slotId, // Correction 2 : On sauvegarde l'emplacement réel
                      }
                    : b
            )
        );
    }, []);

    const handleStartGame = async () => {
        if (requestPermission) await requestPermission();
        setActiveLinesCount(PUZZLE_CONSTANTS.STARTING_LINES);
        setupLevel(difficulty, PUZZLE_CONSTANTS.STARTING_LINES);
        lastTimeRef.current = 0;
        setGameState('playing');
    };

    const handleRetry = () => {
        const nextCount = activeLinesCount + 1;
        setActiveLinesCount(nextCount);
        setupLevel(difficulty, nextCount);
        setGameState('playing');
    };

    const verifyCode = () => {
        // Correction 3 : On compare le targetSlotId (attendu) avec placedSlotId (réel)
        const allCorrect = blocks.every((b) => b.isLocked && b.targetSlotId === b.placedSlotId);

        if (allCorrect) {
            setGameState('win');
        } else {
            const maxAvailable = PUZZLE_DATA[difficulty].length;
            setGameState(activeLinesCount < maxAvailable ? 'breach' : 'lockdown');
        }
    };

    const selectBlock = (id: number, x: number, y: number) => {
        const blk = blocks.find((b) => b.id === id);
        if (blk?.isLocked) return;
        setActiveBlockId(id);
        activeBlockPosRef.current = { x, y };
        setSnapReadySlotId(null);
        if (snapTimerRef.current) clearTimeout(snapTimerRef.current);
    };

    // --- GAME LOOP ---

    const gameLoop = (time: number) => {
        if (gameState !== 'playing' || activeBlockIdRef.current === null || !containerRef.current) {
            if (gameState === 'playing') {
                reqRef.current = requestAnimationFrame((t) => loopRef.current?.(t));
            }
            return;
        }

        if (!lastTimeRef.current) lastTimeRef.current = time;
        const deltaTime = time - lastTimeRef.current;
        lastTimeRef.current = time;
        const timeFactor = Math.min(deltaTime, 100) / 16.66;

        const { beta = 0, gamma = 0 } = orientationRef.current;
        const { DEAD_ZONE, SENSITIVITY } = PUZZLE_CONSTANTS;

        const vy =
            Math.abs(beta || 0) <= DEAD_ZONE
                ? 0
                : ((beta || 0) - Math.sign(beta || 0) * DEAD_ZONE) * SENSITIVITY;
        const vx =
            Math.abs(gamma || 0) <= DEAD_ZONE
                ? 0
                : ((gamma || 0) - Math.sign(gamma || 0) * DEAD_ZONE) * SENSITIVITY;

        const { width, height } = containerRef.current.getBoundingClientRect();
        let newX = activeBlockPosRef.current.x + vx * timeFactor;
        let newY = activeBlockPosRef.current.y + vy * timeFactor;

        newX = Math.max(0, Math.min(newX, width - 280));
        newY = Math.max(0, Math.min(newY, height - 40));

        activeBlockPosRef.current = { x: newX, y: newY };

        const blockEl = document.getElementById(`block-${activeBlockIdRef.current}`);
        if (blockEl) blockEl.style.transform = `translate(${newX}px, ${newY}px)`;

        const slotCenterX = width / 2 - 140;
        let closestSlotId = -1;
        let minDist = Infinity;

        puzzleLinesRef.current.forEach((_, index) => {
            const slotY = PUZZLE_CONSTANTS.START_Y + index * PUZZLE_CONSTANTS.SLOT_HEIGHT;
            const dist = Math.hypot(newX - slotCenterX, newY - slotY);
            if (dist < minDist) {
                minDist = dist;
                closestSlotId = index;
            }
        });

        if (minDist < PUZZLE_CONSTANTS.SNAP_DISTANCE) {
            if (snapReadySlotIdRef.current !== closestSlotId) {
                setSnapReadySlotId(closestSlotId);
                if (snapTimerRef.current) clearTimeout(snapTimerRef.current);

                const currentBlockId = activeBlockIdRef.current;
                snapTimerRef.current = setTimeout(() => {
                    if (activeBlockIdRef.current === currentBlockId)
                        lockBlock(currentBlockId, closestSlotId);
                }, PUZZLE_CONSTANTS.LOCK_TIME_MS);
            }
        } else {
            if (snapReadySlotIdRef.current !== null) {
                setSnapReadySlotId(null);
                if (snapTimerRef.current) clearTimeout(snapTimerRef.current);
            }
        }

        reqRef.current = requestAnimationFrame((t) => loopRef.current?.(t));
    };

    useEffect(() => {
        loopRef.current = gameLoop;
    });

    useEffect(() => {
        if (gameState === 'playing') {
            reqRef.current = requestAnimationFrame((t) => loopRef.current?.(t));
        }
        return () => {
            if (reqRef.current) cancelAnimationFrame(reqRef.current);
        };
    }, [gameState]);

    // --- RENDU ---

    if (isSolved) return <AlphaSuccess message={'SÉQUENCE VALIDÉE'} />;

    return (
        <div className="h-[90dvh]">
            <AlphaScanlines />

            <AlphaPuzzleHeader
                left={`LEVEL: ${activeLinesCount}`}
                right={
                    <span
                        className={
                            permissionGranted ? 'text-brand-emerald font-bold' : 'text-muted'
                        }
                    >
                        GYRO {permissionGranted ? 'ON' : 'OFF'}
                    </span>
                }
            />

            {gameState === 'intro' && (
                <div className={'flex h-full items-center justify-center'}>
                    <IntroScreen
                        difficulty={difficulty}
                        setDifficulty={setDifficulty}
                        onStart={handleStartGame}
                    />
                </div>
            )}

            {(gameState === 'win' || gameState === 'breach' || gameState === 'lockdown') && (
                <AlphaMessageScreen
                    variant={MESSAGE_CONFIG[gameState].variant}
                    title={MESSAGE_CONFIG[gameState].title}
                    description={MESSAGE_CONFIG[gameState].description}
                    actionLabel={MESSAGE_CONFIG[gameState].actionLabel}
                    titleClassName={MESSAGE_CONFIG[gameState].titleClass}
                    onAction={() => {
                        if (gameState === 'win') {
                            onSolve();
                        } else if (gameState === 'breach') {
                            handleRetry();
                        } else if (gameState === 'lockdown') {
                            window.location.reload();
                        }
                    }}
                />
            )}

            {gameState === 'playing' && (
                <div className="flex h-full flex-1 flex-col gap-6">
                    <div
                        ref={containerRef}
                        className="mx-auto border-brand-emerald relative h-full w-full max-w-4xl flex-1 overflow-hidden rounded-lg border-2 bg-black/80 shadow-[0_0_20px_rgba(0,212,146,0.2)]"
                    >
                        {puzzleLines.map((_, index) => (
                            <TargetSlot
                                key={`slot-${index}`}
                                index={index}
                                isSnapReady={snapReadySlotId === index}
                                top={
                                    PUZZLE_CONSTANTS.START_Y + index * PUZZLE_CONSTANTS.SLOT_HEIGHT
                                }
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

                    <AlphaButton onClick={verifyCode} className="mx-auto">
                        EXECUTE_CODE()
                    </AlphaButton>
                    <p className="text-muted text-center">
                        Tap a block to select • Tilt device to move
                    </p>
                </div>
            )}
        </div>
    );
};
