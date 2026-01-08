'use client';

import React, { useEffect, useRef, useState } from 'react';

import Image from 'next/image';

import { clsx } from 'clsx';
import { AnimatePresence, motion } from 'framer-motion';

import { AlphaButton, AlphaButtonVariants } from '@/components/alpha/AlphaButton';
import { AlphaCard } from '@/components/alpha/AlphaCard';
import { AlphaError } from '@/components/alpha/AlphaError';
import AlphaFeedbackPill from '@/components/alpha/AlphaFeedbackPill';
import { AlphaSuccess } from '@/components/alpha/AlphaSuccess';
import { PuzzleProps } from '@/components/puzzles/PuzzleRegistry';
import { SCENARIO } from '@/data/alphaScenario';

export type Piece = {
    id: string;
    src: string;
};

interface RebuildPuzzleProps extends PuzzleProps {
    allPieces: Piece[]; // listes de toutes les pièces (correctes + fausses)
    correctOrder: string[]; // liste des id dans le bon ordre
}

export default function RebuildPuzzle({
    allPieces,
    correctOrder,
    onSolve,
    isSolved,
}: RebuildPuzzleProps) {
    const [pool, setPool] = useState<Piece[]>([]);
    const [slots, setSlots] = useState<(Piece | null)[]>([]);
    const [selectedPiece, setSelectedPiece] = useState<Piece | null>(null);
    const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
    const [isMounted, setIsMounted] = useState(false);

    // ref pour éviter les re-mélanges inutiles si le parent re-render
    const initializedRef = useRef(false);

    // pour tout initialiser au montage
    useEffect(() => {
        setIsMounted(true);

        if (!initializedRef.current) {
            const shuffled = [...allPieces].sort(() => Math.random() - 0.5);
            setPool(shuffled);
            setSlots(Array(correctOrder.length).fill(null));
            initializedRef.current = true;
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handlePoolPieceClick = (piece: Piece) => {
        if (status === 'success') return;
        if (selectedPiece?.id === piece.id) {
            setSelectedPiece(null);
        } else {
            setSelectedPiece(piece);
        }
    };

    const handleSlotClick = (index: number) => {
        if (status === 'success') return;

        const currentSlotPiece = slots[index];

        if (selectedPiece) {
            const newSlots = [...slots];
            newSlots[index] = selectedPiece;
            setSlots(newSlots);

            setPool((prevPool) => {
                const filteredPool = prevPool.filter((p) => p.id !== selectedPiece.id);
                if (currentSlotPiece) {
                    return [...filteredPool, currentSlotPiece];
                }
                return filteredPool;
            });

            setSelectedPiece(null);
            setStatus('idle');
        } else if (currentSlotPiece) {
            const newSlots = [...slots];
            newSlots[index] = null;
            setSlots(newSlots);

            setPool((prev) => [...prev, currentSlotPiece]);
            setStatus('idle');
        }
    };

    const checkCombination = () => {
        if (slots.some((s) => s === null)) {
            setStatus('error');
            setTimeout(() => setStatus('idle'), 1000);
            return;
        }

        const isCorrect = slots.every((piece, index) => piece?.id === correctOrder[index]);

        if (isCorrect) {
            setStatus('success');
            setTimeout(() => {
                onSolve();
            }, SCENARIO.defaultTimeBeforeNextStep);
        } else {
            setStatus('error');
            setTimeout(() => setStatus('idle'), 1500);
        }
    };

    if (!isMounted) return null;

    let buttonVariant: AlphaButtonVariants = 'primary';
    let buttonText = 'ANALYSER';

    if (status === 'success') {
        buttonVariant = 'primary';
        buttonText = 'ACCÈS AUTORISÉ';
    } else if (status === 'error') {
        buttonVariant = 'danger';
        buttonText = 'ERREUR DE RECONSTITUTION';
    }

    if (isSolved) return <AlphaSuccess message={'SÉQUENCE VALIDÉE'} />;

    return (
        <div className="flex flex-col gap-8 lg:flex-row lg:items-start">
            {/* LEFT COLUMN: Assembly Zone */}
            <AlphaCard
                contentClassName="flex flex-col items-center space-y-6"
                title={'Assembly Zone'}
            >
                <div
                    className={clsx(
                        'relative w-56 overflow-hidden rounded border-2 transition-all duration-300',
                        status === 'success'
                            ? 'border-brand-emerald shadow-[0_0_15px_var(--color-brand-emerald)]'
                            : status === 'error'
                              ? 'border-brand-error shadow-[0_0_15px_var(--color-brand-error)]'
                              : 'border-surface bg-surface-highlight'
                    )}
                >
                    {slots.map((piece, index) => (
                        <div
                            key={index}
                            onClick={() => handleSlotClick(index)}
                            className={clsx(
                                'border-surface relative flex h-auto w-full cursor-pointer items-center justify-center border-b-2 transition-colors last:border-b-0',
                                !piece && selectedPiece
                                    ? 'bg-brand-emerald/10 hover:bg-brand-emerald/20'
                                    : '',
                                !piece && !selectedPiece ? 'hover:bg-border' : ''
                            )}
                        >
                            {!piece ? (
                                <span className="text-muted pointer-events-none py-6 font-bold tracking-widest uppercase select-none">
                                    ZONE {index + 1}
                                </span>
                            ) : (
                                <motion.div
                                    key={piece.id}
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ duration: 0.2 }}
                                    className="pointer-events-none block h-auto w-full select-none"
                                >
                                    <Image
                                        src={piece.src}
                                        alt="Fragment"
                                        width={500}
                                        height={300}
                                        style={{ width: '100%', height: 'auto' }}
                                    />
                                </motion.div>
                            )}
                        </div>
                    ))}
                </div>

                {status === 'success' && <AlphaSuccess message={'Séquence validée !'} />}
                {status === 'error' && <AlphaError message={'Séquence incorrecte !'} />}

                {status !== 'error' && status !== 'success' && (
                    <AlphaButton onClick={checkCombination} variant={buttonVariant}>
                        {buttonText}
                    </AlphaButton>
                )}
            </AlphaCard>

            {/* RIGHT COLUMN: Pool */}
            <AlphaCard title="Available Fragments" className="flex-1">
                <motion.div
                    className="grid grid-cols-2 gap-4 p-1 sm:grid-cols-3 xl:grid-cols-2"
                    layout
                >
                    <AnimatePresence mode="popLayout">
                        {pool.map((piece) => {
                            const isSelected = selectedPiece?.id === piece.id;
                            return (
                                <motion.div
                                    key={piece.id}
                                    layout
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.2 } }}
                                    transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                                    onClick={() => handlePoolPieceClick(piece)}
                                    className={clsx(
                                        'bg-surface-highlight relative w-full cursor-pointer overflow-hidden rounded-lg border-2 transition-colors duration-200',
                                        isSelected
                                            ? 'border-brand-emerald ring-brand-emerald/50 shadow-[0_0_15px_var(--color-brand-emerald)] ring-2'
                                            : 'border-border hover:border-foreground-highlight'
                                    )}
                                >
                                    <div className="p-2">
                                        <Image
                                            src={piece.src}
                                            alt="Fragment"
                                            width={500}
                                            height={300}
                                            style={{ width: '100%', height: 'auto' }}
                                            className="pointer-events-none select-none"
                                        />
                                    </div>
                                </motion.div>
                            );
                        })}
                    </AnimatePresence>
                </motion.div>

                {pool.length === 0 && <AlphaFeedbackPill message={'All fragments placed.'} />}
            </AlphaCard>
        </div>
    );
}
