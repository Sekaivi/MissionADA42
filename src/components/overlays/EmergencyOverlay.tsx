'use client';

import React, { useCallback, useState, useRef } from 'react';
import { motion } from 'framer-motion'; // <--- IMPORT
import { SpinPuzzle } from '@/components/puzzles/SpinPuzzle';
import { AlphaMessageScreen } from "@/components/alpha/AlphaMessageScreen";

interface EmergencyOverlayProps {
    type: string | null;
    onResolve: () => void;
    // Plus besoin de isExiting !
}

export const EmergencyOverlay: React.FC<EmergencyOverlayProps> = ({ type, onResolve }) => {
    const [isResolving, setIsResolving] = useState(false);
    const isResolvingRef = useRef(false);

    const handlePuzzleSolve = useCallback(() => {
        if (isResolvingRef.current) return;
        isResolvingRef.current = true;
        setIsResolving(true);
        onResolve();
    }, [onResolve]);

    if (!type) return null;

    return (
        <motion.div
            // 1. Définition des états d'animation
            initial={{ opacity: 0, backdropFilter: "blur(0px)" }}
            animate={{ opacity: 1, backdropFilter: "blur(12px)" }}
            exit={{ opacity: 0, backdropFilter: "blur(0px)", pointerEvents: "none" }}
            transition={{ duration: 0.5, ease: "easeInOut" }}

            className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90"
        >
            <div className="absolute inset-0 border-[10px] border-red-500/20 pointer-events-none animate-pulse" />

            <motion.div
                // Petite animation supplémentaire pour le contenu (zoom in/out)
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                transition={{ duration: 0.4 }}

                className="relative w-full max-w-lg p-4 z-10"
            >
                <AlphaMessageScreen
                    variant={'error'}
                    title={'INTERRUPTION SYSTÈME'}
                    description={'PROTOCOLE DE STABILISATION REQUIS IMMÉDIATEMENT'}
                />

                {type === 'GYRO' && (
                    <div className="bg-gray-900 rounded-xl overflow-hidden border border-red-500 shadow-[0_0_50px_rgba(239,68,68,0.3)]">
                        <SpinPuzzle
                            isSolved={isResolving}
                            onSolve={handlePuzzleSolve}
                        />
                    </div>
                )}
            </motion.div>
        </motion.div>
    );
};