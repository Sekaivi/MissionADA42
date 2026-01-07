'use client';
/* eslint-disable @next/next/no-img-element */
import { useEffect, useState } from 'react';

import { useRouter } from 'next/navigation';

import { AnimatePresence, motion } from 'framer-motion';

import Button from '@/components/ui/Button';

// --- CONFIGURATION ---
type Piece = {
    id: string;
    src: string;
};

// Ordre correct attendu (ID des images)
const CORRECT_ORDER = ['p1', 'p2', 'p3', 'p4', 'p5'];

// Liste de toutes les pièces (Vraies + Fausses)
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

    // --- ÉTATS ---
    const [pool, setPool] = useState<Piece[]>([]);
    const [slots, setSlots] = useState<(Piece | null)[]>([null, null, null, null, null]);
    const [selectedPiece, setSelectedPiece] = useState<Piece | null>(null);
    const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
    const [isMounted, setIsMounted] = useState(false);

    // --- INITIALISATION (Mélange Côté Client) ---
    useEffect(() => {
        // On force le linter à ignorer ces lignes car c'est nécessaire pour Next.js
        // eslint-disable-next-line
        setIsMounted(true);

        const shuffled = [...ALL_PIECES].sort(() => Math.random() - 0.5);

        setPool(shuffled);
    }, []);

    // --- LOGIQUE DU JEU ---

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

        // CAS A : Une pièce est sélectionnée dans la main -> On la pose
        if (selectedPiece) {
            setPool((prev) => prev.filter((p) => p.id !== selectedPiece.id));

            if (currentSlotPiece) {
                setPool((prev) => [...prev, currentSlotPiece]);
            }

            const newSlots = [...slots];
            newSlots[index] = selectedPiece;
            setSlots(newSlots);

            setSelectedPiece(null);
            setStatus('idle');
        }
        // CAS B : Pas de pièce en main, mais slot occupé -> On retire la pièce
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

    return (
        <main className="flex min-h-screen w-full flex-col items-center bg-gray-50 px-4 py-6 md:py-10">
            <div className="mb-8 max-w-xl text-center">
                <h1 className="mb-2 text-2xl font-bold text-gray-800 md:text-3xl">
                    Reconstitution Biométrique
                </h1>
                <p className="text-sm text-gray-600 md:text-base">
                    Sélectionnez un fragment, puis cliquez sur une zone pour reconstruire
                    l&apos;empreinte.
                </p>
            </div>

            <div className="flex w-full max-w-5xl flex-col items-start justify-center gap-8 lg:flex-row lg:gap-16">
                {/* ZONE D'ASSEMBLAGE (SLOTS) */}
                <div className="flex w-full flex-col items-center lg:w-auto">
                    <div
                        className={`relative w-48 overflow-hidden rounded-xl border-4 border-dashed bg-white shadow-xl transition-colors duration-300 sm:w-64 md:w-72 ${
                            status === 'success'
                                ? 'border-green-500 shadow-green-200'
                                : status === 'error'
                                  ? 'border-red-500 shadow-red-200'
                                  : 'border-gray-300'
                        } `}
                    >
                        {slots.map((piece, index) => (
                            <div
                                key={index}
                                onClick={() => handleSlotClick(index)}
                                className={`relative flex h-12 w-full cursor-pointer items-center justify-center overflow-hidden border-b border-gray-200 transition-colors last:border-b-0 sm:h-16 md:h-20 ${!piece && selectedPiece ? 'bg-blue-50 hover:bg-blue-100' : 'bg-gray-50'} ${!piece && !selectedPiece ? 'hover:bg-gray-100' : ''} `}
                            >
                                {!piece && (
                                    <span className="pointer-events-none text-xs font-bold text-gray-300 select-none md:text-sm">
                                        ZONE {index + 1}
                                    </span>
                                )}

                                {piece && (
                                    <motion.img
                                        layoutId={piece.id}
                                        src={piece.src}
                                        alt="Empreinte"
                                        className="pointer-events-none block h-full w-full object-cover select-none"
                                    />
                                )}
                            </div>
                        ))}
                    </div>

                    <div className="mt-6 w-48 sm:w-64 md:w-72">
                        <Button
                            onClick={checkCombination}
                            className={`w-full text-sm md:text-base ${status === 'success' ? '!bg-green-600' : status === 'error' ? '!bg-red-600' : ''}`}
                            disabled={slots.some((s) => s === null) || status === 'success'}
                        >
                            {status === 'success'
                                ? 'ACCÈS AUTORISÉ'
                                : status === 'error'
                                  ? 'ERREUR'
                                  : 'ANALYSER'}
                        </Button>
                    </div>
                </div>

                {/* RÉSERVE DE PIÈCES (POOL) */}
                <div className="w-full flex-1 rounded-2xl border border-gray-100 bg-white p-4 shadow-lg md:p-6">
                    <h3 className="mb-4 text-center text-xs font-bold tracking-wider text-gray-400 uppercase md:text-sm">
                        Fragments disponibles
                    </h3>

                    <div className="grid grid-cols-3 place-items-center gap-3 sm:grid-cols-4 lg:grid-cols-3 xl:grid-cols-4">
                        <AnimatePresence>
                            {pool.map((piece) => (
                                <motion.div
                                    key={piece.id}
                                    layoutId={piece.id}
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.5 }}
                                    onClick={() => handlePoolPieceClick(piece)}
                                    className={`relative aspect-[3/1] w-full cursor-pointer overflow-hidden rounded-lg border-2 shadow-sm transition-all duration-200 ${
                                        selectedPiece?.id === piece.id
                                            ? 'scale-105 border-blue-500 shadow-md ring-2 ring-blue-200'
                                            : 'border-gray-200 hover:border-gray-400'
                                    } `}
                                >
                                    <img
                                        src={piece.src}
                                        alt="Fragment"
                                        className="pointer-events-none h-full w-full object-cover select-none"
                                    />
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>

                    {pool.length === 0 && (
                        <p className="mt-10 text-center text-sm text-gray-400 italic">
                            Tous les fragments sont placés.
                        </p>
                    )}
                </div>
            </div>
        </main>
    );
}
