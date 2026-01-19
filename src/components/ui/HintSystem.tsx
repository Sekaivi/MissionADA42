'use client';

import React from 'react';

import { LockClosedIcon } from '@heroicons/react/24/solid';

import { AlphaButton } from '@/components/alpha/AlphaButton';
import { useHintSystem } from '@/hooks/useHint';
import { DialogueLine } from '@/types/dialogue';
import { ScenarioStep } from '@/types/scenario';

interface GameHintButtonProps {
    step: ScenarioStep;
    startTime: number;
    onShowScript: (script: DialogueLine[]) => void;
    className?: string;
}

// helper pour afficher mm:ss
const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
};

export const HintSystem: React.FC<GameHintButtonProps> = ({
    step,
    startTime,
    onShowScript,
    className,
}) => {
    const { triggerHint, totalHints, unlockedCount, isNextHintLocked, secondsRemaining } =
        useHintSystem({
            currentStep: step,
            stepStartTime: startTime,
            onOpenDialogue: onShowScript,
        });

    if (totalHints === 0) return null;

    const isFinished = unlockedCount >= totalHints;

    // Gestion du Label et de l'état
    let label = '';
    let isDisabled = false;

    if (isFinished) {
        label = 'Indices (Revoir)';
    } else if (isNextHintLocked) {
        label = `Décryptage... ${formatTime(secondsRemaining)}`;
        isDisabled = true;
    } else {
        label = `Indice (${unlockedCount + 1}/${totalHints})`;
    }

    return (
        <div className={className}>
            <AlphaButton
                variant={isDisabled ? 'secondary' : 'primary'} // Visuel différent si bloqué
                onClick={triggerHint}
                disabled={isDisabled}
                className={isDisabled ? 'cursor-not-allowed opacity-70' : ''}
            >
                <div className="flex items-center gap-2">
                    {isDisabled && <LockClosedIcon className="h-4 w-4 animate-pulse" />}
                    <span>{label}</span>
                </div>
            </AlphaButton>
        </div>
    );
};
