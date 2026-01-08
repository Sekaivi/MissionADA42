'use client';

import React, { useCallback, useState, useRef } from 'react'; // Ajout de useRef
import { SpinPuzzle } from '@/components/puzzles/SpinPuzzle';
import { AlphaMessageScreen } from "@/components/alpha/AlphaMessageScreen";

interface EmergencyOverlayProps {
    type: string | null;
    onResolve: () => void;
}

export const EmergencyOverlay: React.FC<EmergencyOverlayProps> = ({ type, onResolve }) => {
    // État pour l'affichage (UI)
    const [isResolving, setIsResolving] = useState(false);

    // REF pour la logique (Verrouillage immédiat)
    const isResolvingRef = useRef(false);

    const handlePuzzleSolve = useCallback(() => {
        if (isResolvingRef.current) return;

        isResolvingRef.current = true;
        setIsResolving(true);

        onResolve();
    }, [onResolve]);

    if (!type) return null;

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90 backdrop-blur-md animate-in fade-in duration-300">
            <div className="absolute inset-0 border-[10px] border-red-500/20 pointer-events-none animate-pulse" />

            <div className="relative w-full max-w-lg p-4 z-10">
                <AlphaMessageScreen
                    variant={'error'}
                    title={'INTERRUPTION SYSTÈME'}
                    description={'PROTOCOLE DE STABILISATION REQUIS IMMÉDIATEMENT'}
                />

                {type === 'GYRO' && (
                    <div className="bg-gray-900 rounded-xl overflow-hidden border border-red-500 shadow-[0_0_50px_rgba(239,68,68,0.3)]">
                        <SpinPuzzle
                            isSolved={isResolving}
                            // CORRECTION IMPORTANTE :
                            // Passe la fonction directement, ne crée pas de fonction fléchée () => handle...
                            // sinon SpinPuzzle croit que la fonction change à chaque render.
                            onSolve={handlePuzzleSolve}
                        />
                    </div>
                )}
            </div>
        </div>
    );
};