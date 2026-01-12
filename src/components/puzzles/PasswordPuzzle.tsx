'use client';

import React, { useEffect, useMemo, useState } from 'react';

import { SecurityHud } from '@/components/PasswordHUD';
import { RuleItem } from '@/components/RuleItem';
import { AlphaCard } from '@/components/alpha/AlphaCard';
import { AlphaInput } from '@/components/alpha/AlphaInput';
import { AlphaModal } from '@/components/alpha/AlphaModal';
import { AlphaSuccess } from '@/components/alpha/AlphaSuccess';
import { PuzzleProps } from '@/components/puzzles/PuzzleRegistry';
import { SCENARIO } from '@/data/alphaScenario';
import { GameContext, RuleStatus } from '@/types/passwordGame';
import { PASSWORD_RULES } from '@/utils/passwordRules';

export const PasswordPuzzle = ({ onSolve, isSolved }: PuzzleProps) => {
    const [password, setPassword] = useState('');
    const [isMounted, setIsMounted] = useState(false);

    const [context] = useState<GameContext>(() => ({
        sessionId: generateRandomId(),
        requiredSum: Math.floor(Math.random() * 10) + 15,
    }));

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsMounted(true);
        }, 0);
        return () => clearTimeout(timer);
    }, []);

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

    // déclencher le onSolve du parent quand c'est gagné
    useEffect(() => {
        if (isWin && !isSolved) {
            const timer = setTimeout(() => {
                onSolve();
            }, SCENARIO.defaultTimeBeforeNextStep);
            return () => clearTimeout(timer);
        }
    }, [isWin, isSolved, onSolve]);

    // affichage progressif des règles (validées + courante + suivante)
    const visibleRules = useMemo(() => {
        const lastValidIndex = ruleStates.map((r) => r.status).lastIndexOf('valid');
        // on affiche jusqu'à 1 règle après la dernière valide pour inciter à continuer
        return ruleStates.slice(0, lastValidIndex + 2);
    }, [ruleStates]);

    if (!isMounted) return null;

    if (isSolved) {
        return <AlphaSuccess message={'/// ACCESS GRANTED ///'} />;
    }

    return (
        <AlphaCard title="/// SECURITY_GATE ///">
            <AlphaModal
                isOpen={isWin}
                variant="success"
                title="Mot de passe"
                message="Mot de passe valide !"
                subMessage="Le mot de passe a été validé ! On peut passer à la suite !"
                autoCloseDuration={SCENARIO.defaultTimeBeforeNextStep}
                durationUnit={'ms'}
            />
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
                        disabled={isWin}
                        variant={isWin ? 'success' : 'default'}
                        placeholder="ENTER_PASSWORD..."
                        autoComplete="off"
                        spellCheck={false}
                        className="pr-20 font-mono tracking-wider"
                    />

                    <div className="text-muted pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-[10px]">
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
