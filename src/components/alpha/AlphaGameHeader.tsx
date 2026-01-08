import React from 'react';

import clsx from 'clsx';

interface AlphaPuzzleHeaderProps {
    /** Contenu affiché à gauche (ex: Titre, Niveau) */
    left: React.ReactNode;
    /** Contenu affiché à droite (ex: Statut, Timer, Score) */
    right?: React.ReactNode;
    /** Classes additionnelles pour le conteneur */
    className?: string;
}

export const AlphaPuzzleHeader = ({ left, right, className }: AlphaPuzzleHeaderProps) => (
    <div
        className={clsx(
            'mx-auto mb-2 flex w-full max-w-[90%] justify-between border-b border-white/20 pb-1 font-mono text-sm',
            className
        )}
    >
        <div className="text-foreground font-medium">{left}</div>

        <div className="text-muted text-right">{right}</div>
    </div>
);
