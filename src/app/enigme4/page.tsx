'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';

import { AlphaButton, AlphaButtonVariants } from '@/components/alpha/AlphaButton';
import { AlphaCard } from '@/components/alpha/AlphaCard';
import { AlphaHeader } from '@/components/alpha/AlphaHeader';
import { AlphaSuccess } from "@/components/alpha/AlphaSuccess";
import { AlphaError } from "@/components/alpha/AlphaError";
import { CheckIcon } from '@heroicons/react/24/solid';
import clsx from "clsx";

type Piece = {
    id: string;
    src: string;
};

const CORRECT_ORDER = ['p1', 'p2', 'p3', 'p4', 'p5'];

const ALL_PIECES: Piece[] = [
    { id: 'p1', src: '/images/fingerprint-150159_1920-2.png' },
    { id: 'p2', src: '/images/fingerprint-150159_1920-3.png' },
    { id: 'p3', src: '/images/fingerprint-150159_1920-4.png' },
    { id: 'p4', src: '/images/fingerprint-150159_1920-5.png' },
    { id: 'p5', src: '/images/fingerprint-150159_1920-6.png' },
    { id: 'f1', src: '/images/crime-2027374_1280 1.png' },
    { id: 'f2', src: '/images/crime-2027374_1280 2.png' },
    { id: 'f3', src: '/images/crime-2027374_1280 3.png' },
];

export default function Enigme4() {
    const router = useRouter();

    const [pool, setPool] = useState<Piece[]>([]);
    const [slots, setSlots] = useState<(Piece | null)[]>([null, null, null, null, null]);
    const [selectedPiece, setSelectedPiece] = useState<Piece | null>(null);
    const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
        const shuffled = [...ALL_PIECES].sort(() => Math.random() - 0.5);
        setPool(shuffled);
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
        }
        else if (currentSlotPiece) {
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

        const isCorrect = slots.every((piece, index) => piece?.id === CORRECT_ORDER[index]);

        if (isCorrect) {
            setStatus('success');
            setTimeout(() => {
                router.push('/home');
            }, 1500);
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

    return (
        <div className="mx-auto w-full max-w-5xl space-y-6">
            <AlphaHeader
                title="Reconstitution Biométrique"
                subtitle="Sélectionnez un fragment à droite, puis cliquez sur une zone à gauche pour reconstruire l'empreinte."
            />

            <div className="flex flex-col gap-8 lg:flex-row lg:items-start">

                {/* COLONNE GAUCHE : Zone d'assemblage */}
                <div className="lg:w-1/3 w-full">
                    <AlphaCard contentClassName="flex flex-col items-center space-y-6" title={'Zone d\'assemblage'}>
                        <div
                            className={`relative w-56 overflow-hidden rounded border-2 transition-all duration-300 ${
                                status === 'success'
                                    ? 'border-brand-emerald shadow-[0_0_15px_rgba(0,212,146,0.3)]'
                                    : status === 'error'
                                        ? 'border-brand-error shadow-[0_0_15px_rgba(239,68,68,0.3)]'
                                        : 'border-white/20 bg-black/40'
                            }`}
                        >
                            {slots.map((piece, index) => (
                                <div
                                    key={index}
                                    onClick={() => handleSlotClick(index)}
                                    className={`relative flex h-16 w-full cursor-pointer items-center justify-center border-b border-white/10 transition-colors last:border-b-0
                                        ${!piece && selectedPiece ? 'bg-brand-emerald/10 hover:bg-brand-emerald/20' : ''} 
                                        ${!piece && !selectedPiece ? 'hover:bg-white/5' : ''}
                                    `}
                                >
                                    {!piece ? (
                                        <span className="pointer-events-none text-[10px] font-bold tracking-widest text-muted uppercase select-none">
                                            ZONE {index + 1}
                                        </span>
                                    ) : (
                                        <motion.img
                                            key={piece.id}
                                            initial={{ opacity: 0, scale: 0.9 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            transition={{ duration: 0.2 }}
                                            src={piece.src}
                                            alt="Empreinte"
                                            className="pointer-events-none block h-full w-full object-cover select-none"
                                        />
                                    )}
                                </div>
                            ))}
                        </div>

                        {status === 'success' && <AlphaSuccess message={'Séquence validée !'} />}
                        {status === 'error' && <AlphaError message={'Séquence incorrecte !'} />}

                        {status !== 'error' && status !== 'success' && (
                            <AlphaButton
                                onClick={checkCombination}
                                // disabled={slots.some((s) => s === null) || status === 'success'}
                                variant={buttonVariant}
                                fullWidth
                            >
                                {buttonText}
                            </AlphaButton>
                        )}
                    </AlphaCard>
                </div>

                {/* COLONNE DROITE : Réserve (Pool) */}
                <AlphaCard title="Fragments Disponibles" className="flex-1">
                    <motion.div
                        className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-2 p-1"
                        layout
                    >
                        {/* CORRECTION ANIMATION :
                            mode='popLayout' est essentiel ici. Il permet aux éléments restants
                            de glisser instantanément à leur nouvelle place pendant que
                            l'élément supprimé joue son animation de sortie par-dessus.
                        */}
                        <AnimatePresence mode="popLayout">
                            {pool.map((piece) => {
                                const isSelected = selectedPiece?.id === piece.id;
                                return (
                                    <motion.div
                                        key={piece.id}
                                        layout // Active l'animation de position
                                        initial={{ opacity: 0, scale: 0.8 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.2 } }}
                                        transition={{ type: "spring", damping: 25, stiffness: 300 }} // Mouvement fluide
                                        onClick={() => handlePoolPieceClick(piece)}
                                        className={clsx(
                                            "relative w-full cursor-pointer overflow-hidden rounded-lg border-2 transition-colors duration-200",
                                            isSelected
                                                ? "border-brand-emerald ring-2 ring-brand-emerald/50 shadow-[0_0_15px_rgba(0,212,146,0.3)] bg-brand-emerald/5"
                                                : "border-white/10 hover:border-white/30 bg-black/20"
                                        )}
                                    >
                                        <img
                                            src={piece.src}
                                            alt="Fragment"
                                            className="block w-full h-auto object-contain p-2 pointer-events-none select-none"
                                        />
                                    </motion.div>
                                );
                            })}
                        </AnimatePresence>
                    </motion.div>

                    {pool.length === 0 && (
                        <div className="mt-8 flex flex-col items-center justify-center text-muted text-sm italic">
                            <CheckIcon className="mb-2 h-5 w-5 opacity-50" />
                            <p>Tous les fragments sont placés.</p>
                        </div>
                    )}
                </AlphaCard>
            </div>
        </div>
    );
}