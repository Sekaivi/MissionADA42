'use client';

import React, { useEffect, useMemo, useState } from 'react';

import { SecurityHud } from '@/components/PasswordHUD';
import { RuleItem } from '@/components/RuleItem';
import { AlphaCard } from '@/components/alpha/AlphaCard';
import { AlphaInput } from '@/components/alpha/AlphaInput';
import { AlphaModal } from '@/components/alpha/AlphaModal';
import { AlphaSuccess } from '@/components/alpha/AlphaSuccess';
import { DialogueBox } from '@/components/dialogueBox';
import { PuzzleProps } from '@/components/puzzles/PuzzleRegistry';
import { SCENARIO } from '@/data/alphaScenario';
import { useGameScenario, useScenarioTransition } from '@/hooks/useGameScenario';
import { GameContext, RuleStatus } from '@/types/passwordGame';
import { PASSWORD_RULES } from '@/utils/passwordRules';

export type PasswordPuzzleScenarioStep = 'idle' | 'intro' | 'playing' | 'win';

export const PasswordPuzzle = ({ onSolve, isSolved, scripts = {} }: PuzzleProps) => {
    const { gameState, triggerPhase, isDialogueOpen, currentScript, onDialogueComplete } =
        useGameScenario<PasswordPuzzleScenarioStep>(scripts);

    const [password, setPassword] = useState('');
    const [isMounted, setIsMounted] = useState(false);

    // init lazy du contexte de jeu
    const [context] = useState<GameContext>(() => ({
        sessionId: generateRandomId(),
        requiredSum: Math.floor(Math.random() * 10) + 15,
    }));

    useEffect(() => {
        // montage initial
        const timer = setTimeout(() => {
            setIsMounted(true);
            if (!isSolved) {
                triggerPhase('intro');
            }
        }, 0);
        return () => clearTimeout(timer);
    }, [isSolved, triggerPhase]);

    useScenarioTransition(gameState, isDialogueOpen, {
        intro: () => {
            triggerPhase('playing');
        },
        win: () => {
            setTimeout(() => onSolve(), SCENARIO.defaultTimeBeforeNextStep);
        },
    });

    const ruleStates = useMemo(() => {
        if (!isMounted) return [];

        return PASSWORD_RULES.map((rule, index) => {
            const isValid = rule.validator(password, context);
            let status: RuleStatus;

            // une règle n'est vérifiée que si les précédentes sont valides
            const isPreviousValid =
                index === 0 ||
                PASSWORD_RULES.slice(0, index).every((r) => r.validator(password, context));

            if (isPreviousValid) {
                status = isValid ? 'valid' : 'invalid';
            } else {
                status = 'pending';
            }

            return { ...rule, status };
        });
    }, [password, context, isMounted]);

    // vérification globale de la victoire
    const isWin = useMemo(() => {
        if (!isMounted || ruleStates.length === 0) return false;
        return ruleStates.every((r) => r.status === 'valid');
    }, [ruleStates, isMounted]);

    useEffect(() => {
        if (isWin && gameState === 'playing' && !isSolved) {
            const timer = setTimeout(() => {
                triggerPhase('win');
            }, 500);
            return () => clearTimeout(timer);
        }
    }, [isWin, gameState, isSolved, triggerPhase]);

    // affichage progressif des règles
    const visibleRules = useMemo(() => {
        const lastValidIndex = ruleStates.map((r) => r.status).lastIndexOf('valid');
        return ruleStates.slice(0, lastValidIndex + 2);
    }, [ruleStates]);

    if (!isMounted) return null;

    if (isSolved) {
        return <AlphaSuccess message={'/// ACCESS GRANTED ///'} />;
    }

    return (
        <>
            <DialogueBox
                isOpen={isDialogueOpen}
                script={currentScript}
                onComplete={onDialogueComplete}
            />

            <AlphaModal
                isOpen={gameState === 'win' && !isDialogueOpen}
                title={'Succès'}
                message="Epreuve passée avec succès"
                autoCloseDuration={SCENARIO.defaultTimeBeforeNextStep}
                durationUnit={'ms'}
            />

            <AlphaCard title="/// SECURITY_GATE ///">
                <div className="flex w-full flex-col items-center justify-center font-mono">
                    <div className="mb-6 text-center">
                        <p className="text-muted text-xs tracking-widest uppercase">
                            Auth Protocol v9.0
                        </p>
                    </div>

                    <SecurityHud sessionId={context.sessionId} targetSum={context.requiredSum} />

                    <div className="relative mb-8 w-full">
                        <AlphaInput
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            disabled={isWin || isDialogueOpen}
                            variant={isWin ? 'success' : 'default'}
                            placeholder="ENTER_PASSWORD..."
                            autoComplete="off"
                            spellCheck={false}
                            className="pr-20 font-mono tracking-wider"
                        />

                        <div className="text-muted pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-xs">
                            LEN: {password.length}
                        </div>
                    </div>

                    <div className="flex w-full flex-col-reverse gap-2">
                        <div className="flex w-full flex-col transition-all">
                            {visibleRules.map((item) => (
                                <RuleItem key={item.id} rule={item} status={item.status} />
                            ))}
                        </div>
                    </div>
                </div>
            </AlphaCard>
        </>
    );
};

function generateRandomId() {
    const chars = 'ABCDFGHIJKLMNOPQRSTUVWXYZ';
    let result = '';
    for (let i = 0; i < 3; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}
