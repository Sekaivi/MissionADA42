'use client';

import React, { useState } from 'react';

import { ColorScannerModule } from '@/components/Tutorial/ColorScannerModule';
import { AlphaHeader } from '@/components/alpha/AlphaHeader';

export default function ColorScannerModulePage() {
    const SEQUENCE = ['red', 'blue', 'green'];

    const [sequenceIndex, setSequenceIndex] = useState(0);
    const [history, setHistory] = useState<string[]>([]); // historique visuel
    const [isGameWon, setIsGameWon] = useState(false);

    const handleScanSuccess = () => {
        // ajoute la couleur validée à l'historique
        const validatedColor = SEQUENCE[sequenceIndex];
        setHistory((prev) => [...prev, validatedColor]);

        //check la progression
        if (sequenceIndex < SEQUENCE.length - 1) {
            // s'il reste des couleurs, on passe à la suivante
            setSequenceIndex((prev) => prev + 1);
        } else {
            // terminé
            setIsGameWon(true);
            // window.alert('Séquence terminée avec succès !');
        }
    };

    const handleScanFail = () => {
        // reset l'index à 0
        setSequenceIndex(0);
        // vide l'historique visuel
        setHistory([]);

        window.alert('Mauvaise couleur ! Reset de la séquence.');
    };

    return (
        <>
            <AlphaHeader
                title={'Module de reconnaissance de couleur'}
                subtitle={
                    isGameWon ? 'Séquence validée' : `Trouvez la couleur n°${sequenceIndex + 1}`
                }
            />

            <ColorScannerModule
                onSolve={handleScanSuccess}
                onFail={handleScanFail}
                // couleur qu'on attend ACTUELLEMENT
                // targetColorId={SEQUENCE[sequenceIndex]}
                // historique pour afficher la barre de progression
                sequenceHistory={history}
            />
        </>
    );
}
