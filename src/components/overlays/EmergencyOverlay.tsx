'use client';

import React, { useCallback, useRef, useState } from 'react';

import { motion } from 'framer-motion';

import { AlphaMessageScreen } from '@/components/alpha/AlphaMessageScreen';
import { SpinPuzzle } from '@/components/puzzles/SpinPuzzle';

interface EmergencyOverlayProps {
    type: string | null;
    onResolve: () => void;
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
            initial={{ opacity: 0, backdropFilter: 'blur(0px)' }}
            animate={{ opacity: 1, backdropFilter: 'blur(12px)' }}
            exit={{ opacity: 0, backdropFilter: 'blur(0px)', pointerEvents: 'none' }}
            transition={{ duration: 0.5, ease: 'easeInOut' }}
            className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90"
        >
            <div className="border-brand-error/20 pointer-events-none absolute inset-0 animate-pulse border-[10px]" />

            <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                transition={{ duration: 0.4 }}
                className="relative z-10 w-full max-w-lg p-4"
            >
                <AlphaMessageScreen
                    variant={'error'}
                    title={'INTERRUPTION SYSTÈME'}
                    description={'PROTOCOLE DE STABILISATION REQUIS IMMÉDIATEMENT'}
                />

                {type === 'GYRO' && (
                    <div className="border-brand-error overflow-hidden rounded-xl border bg-gray-900 shadow-[0_0_50px_var(--color-brand-error)]">
                        <SpinPuzzle isSolved={isResolving} onSolve={handlePuzzleSolve} />
                    </div>
                )}
            </motion.div>
        </motion.div>
    );
};
