'use client';

import React from 'react';

import { AlphaHeader } from '@/components/alpha/AlphaHeader';
import RebuildPuzzle, { Piece } from '@/components/puzzles/RebuildPuzzle';

const FINGERPRINT_ORDER = ['p1', 'p2', 'p3', 'p4', 'p5'];

const FINGERPRINT_PIECES: Piece[] = [
    { id: 'p1', src: '/images/fingerprint-150159_1920-2.png' },
    { id: 'p2', src: '/images/fingerprint-150159_1920-3.png' },
    { id: 'p3', src: '/images/fingerprint-150159_1920-4.png' },
    { id: 'p4', src: '/images/fingerprint-150159_1920-5.png' },
    { id: 'p5', src: '/images/fingerprint-150159_1920-6.png' },
    { id: 'f1', src: '/images/crime-2027374_1280 1.png' },
    { id: 'f2', src: '/images/crime-2027374_1280 2.png' },
    { id: 'f3', src: '/images/crime-2027374_1280 3.png' },
];

export default function RebuildPuzzlePage() {
    return (
        <>
            <AlphaHeader
                title={"Reconsitution d'image"}
                subtitle={
                    "Clique sur un fragment et place-le correctement afin de reconsituer l'image"
                }
            />
            <RebuildPuzzle
                allPieces={FINGERPRINT_PIECES}
                correctOrder={FINGERPRINT_ORDER}
                onSolve={() =>
                    window.alert(
                        "Bravo, vous avez réussi le module de jeu ! Lors de l'escape game, on passerait à l'étape suivante."
                    )
                }
            />
        </>
    );
}
