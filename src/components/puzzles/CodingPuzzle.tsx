'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';

import { AlphaButton } from '@/components/alpha/AlphaButton';
import { AlphaPuzzleHeader } from '@/components/alpha/AlphaGameHeader';
import { AlphaMessageScreen, MessageVariant } from '@/components/alpha/AlphaMessageScreen';
import { AlphaModal } from '@/components/alpha/AlphaModal';
import { AlphaScanlines } from '@/components/alpha/AlphaScanlines';
import { AlphaSuccess } from '@/components/alpha/AlphaSuccess';
import { AlphaTitle } from '@/components/alpha/AlphaTitle';
import { CodeBlock, TargetSlot } from '@/components/alpha/HUD';
import { DialogueBox } from '@/components/dialogueBox';
import { PuzzlePhases, PuzzleProps } from '@/components/puzzles/PuzzleRegistry';
import { SCENARIO } from '@/data/alphaScenario';
import { useGameScenario, useScenarioTransition } from '@/hooks/useGameScenario';
import { useOrientation } from '@/hooks/useOrientation';
import { Difficulty } from '@/types/game';

export type CodingPuzzlePhases = PuzzlePhases | 'breach' | 'lockdown';

const PUZZLE_CONSTANTS = {
    STARTING_LINES: 3,
    SENSITIVITY: 1,
    DEAD_ZONE: 1,
    SLOT_HEIGHT: 50,
    START_Y: 20,
    SNAP_DISTANCE: 50,
    LOCK_TIME_MS: 1500,
    BLOCK_WIDTH: 280,
    BLOCK_HEIGHT: 40,
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
        title: 'ACCÈS AUTORISÉ',
        description: 'Autorisations root accordées.\nSystème dévérouillé.',
        actionLabel: 'SORTIE_SYSTÈME()',
        variant: 'success',
    },
    breach: {
        title: '/// FAILLE DE SÉCURITÉ ///',
        description: 'Menaces contre le pare-feu détectées.\nComplexité du code augmentée.',
        actionLabel: 'REDEMARRAGE()',
        variant: 'error',
        titleClass: 'animate-pulse glitch-effect',
    },
    lockdown: {
        title: 'VEROUILLAGE DU SYSTÈME',
        description: "Trop d'essais ratés.\nRedémarrage manuel du système requis",
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
    placedSlotId?: number;
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

export const CodingPuzzle: React.FC<PuzzleProps> = ({ onSolve, isSolved, scripts = {} }) => {
    const { gameState, triggerPhase, isDialogueOpen, currentScript, onDialogueComplete } =
        useGameScenario<CodingPuzzlePhases>(scripts);

    const { data: orientationData, requestPermission, permissionGranted } = useOrientation();

    // States
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
    const blocksRef = useRef<Block[]>([]);

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
    useEffect(() => {
        blocksRef.current = blocks;
    }, [blocks]);

    // --- LOGIQUE MÉTIER ---

    const setupLevel = useCallback((diff: Difficulty, count: number) => {
        const fullData = PUZZLE_DATA[diff];
        const currentLines = fullData.slice(0, Math.min(count, fullData.length));
        setPuzzleLines(currentLines);

        const newBlocks: Block[] = currentLines.map((line, index) => ({
            id: index,
            text: line,
            x: 50 + Math.random() * 100, // Position initiale aléatoire
            y: 300 + Math.random() * 100, // Plus bas pour ne pas chevaucher les slots
            isLocked: false,
            targetSlotId: index,
            placedSlotId: undefined,
        }));

        setBlocks(newBlocks);
        setActiveBlockId(null);
        setSnapReadySlotId(null);
    }, []);

    const lockBlock = useCallback((blockId: number, slotId: number) => {
        const containerW = containerRef.current?.clientWidth || 0;
        const targetX = containerW / 2 - 140; // Centré par rapport à la largeur supposée du bloc (280px)
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
                          placedSlotId: slotId,
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
        triggerPhase('playing');
    };

    const handleRetry = () => {
        const nextCount = activeLinesCount + 1;
        setActiveLinesCount(nextCount);
        setupLevel(difficulty, nextCount);
        triggerPhase('playing');
    };

    const verifyCode = () => {
        const allCorrect = blocks.every((b) => b.isLocked && b.targetSlotId === b.placedSlotId);

        if (allCorrect) {
            triggerPhase('win');
        } else {
            const maxAvailable = PUZZLE_DATA[difficulty].length;
            triggerPhase(activeLinesCount < maxAvailable ? 'breach' : 'lockdown');
        }
    };

    const selectBlock = (id: number) => {
        // 1. Récupérer le bloc ciblé
        const targetBlock = blocks.find((b) => b.id === id);
        if (!targetBlock) return;

        // 2. Sauvegarder l'état du bloc précédent s'il y en a un
        if (activeBlockId !== null && activeBlockId !== id) {
            const finalX = activeBlockPosRef.current.x;
            const finalY = activeBlockPosRef.current.y;

            setBlocks((prev) =>
                prev.map((b) => (b.id === activeBlockId ? { ...b, x: finalX, y: finalY } : b))
            );
        }

        if (targetBlock.isLocked) {
            setBlocks((prev) =>
                prev.map((b) =>
                    b.id === id ? { ...b, isLocked: false, placedSlotId: undefined } : b
                )
            );
        }

        setActiveBlockId(id);
        activeBlockPosRef.current = { x: targetBlock.x, y: targetBlock.y };

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

        // Physique simple
        const vy =
            Math.abs(beta || 0) <= DEAD_ZONE
                ? 0
                : ((beta || 0) - Math.sign(beta || 0) * DEAD_ZONE) * SENSITIVITY;
        const vx =
            Math.abs(gamma || 0) <= DEAD_ZONE
                ? 0
                : ((gamma || 0) - Math.sign(gamma || 0) * DEAD_ZONE) * SENSITIVITY;

        const { width, height } = containerRef.current.getBoundingClientRect();

        // Calcul de la position absolue
        let newX = activeBlockPosRef.current.x + vx * timeFactor;
        let newY = activeBlockPosRef.current.y + vy * timeFactor;

        newX = Math.max(0, Math.min(newX, width - PUZZLE_CONSTANTS.BLOCK_WIDTH));
        newY = Math.max(0, Math.min(newY, height - PUZZLE_CONSTANTS.BLOCK_HEIGHT));

        activeBlockPosRef.current = { x: newX, y: newY };

        const blockEl = document.getElementById(`block-${activeBlockIdRef.current}`);
        if (blockEl) {
            blockEl.style.transform = `translate(${newX}px, ${newY}px)`;
        }

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

        // Vérification occupation
        const isSlotOccupied = blocksRef.current.some(
            (b) => b.isLocked && b.placedSlotId === closestSlotId
        );

        if (minDist < PUZZLE_CONSTANTS.SNAP_DISTANCE && !isSlotOccupied) {
            if (snapReadySlotIdRef.current !== closestSlotId) {
                setSnapReadySlotId(closestSlotId);
                if (snapTimerRef.current) clearTimeout(snapTimerRef.current);

                const currentBlockId = activeBlockIdRef.current;
                snapTimerRef.current = setTimeout(() => {
                    // Vérification finale avant lock
                    const currentlyOccupied = blocksRef.current.some(
                        (b) => b.isLocked && b.placedSlotId === closestSlotId
                    );
                    if (activeBlockIdRef.current === currentBlockId && !currentlyOccupied)
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

    // init
    useEffect(() => {
        triggerPhase('intro');
    }, [triggerPhase]);

    // transitions automatiques après dialogues
    useScenarioTransition(gameState, isDialogueOpen, {
        win: () => {
            setTimeout(() => onSolve(), SCENARIO.defaultTimeBeforeNextStep);
        },
    });

    if (isSolved) return <AlphaSuccess message={'SÉQUENCE VALIDÉE'} />;

    return (
        <div className="h-[100dvh]">
            <DialogueBox
                isOpen={isDialogueOpen}
                script={currentScript}
                onComplete={onDialogueComplete}
            />

            <AlphaModal
                isOpen={gameState === 'win' && !isDialogueOpen}
                title={'Succès'}
                message="Epreuve passée avec succès"
                autoCloseDuration={SCENARIO.defaultTimeBeforeNextStep}
                durationUnit={'ms'}
            />

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
                        if (gameState === 'breach') {
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
                        className="border-brand-emerald relative mx-auto h-full w-full max-w-4xl flex-1 overflow-hidden rounded-lg border-2 bg-black/80 shadow-[0_0_20px_rgba(0,212,146,0.2)]"
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

                        {blocks.map((block) => {
                            const isActive = activeBlockId === block.id;
                            return (
                                <CodeBlock
                                    key={block.id}
                                    {...block}
                                    x={isActive ? 0 : block.x}
                                    y={isActive ? 0 : block.y}
                                    isActive={isActive}
                                    onSelect={() => selectBlock(block.id)}
                                />
                            );
                        })}
                    </div>

                    <AlphaButton onClick={verifyCode} className="mx-auto">
                        EXECUTE_CODE()
                    </AlphaButton>
                    <div className="text-muted space-y-3 text-center">
                        <p>Touchez un bloc pour le sélectionner.</p>
                        <p>Inclinez le téléphone pour le déplacer.</p>
                    </div>
                </div>
            )}
        </div>
    );
};
