'use client';

import React, { useEffect, useMemo, useState } from 'react';

import { SecurityHud } from '@/components/PasswordHUD';
import { PasswordInput } from '@/components/PasswordInput';
import { RuleItem } from '@/components/RuleItem';
import { GameContext, RuleStatus } from '@/types/passwordGame';
import { PASSWORD_RULES } from '@/utils/passwordRules';

export default function PasswordGame() {
    // --- STATE ---
    const [password, setPassword] = useState('');

    // Valeurs aléatoires générées une seule fois au montage (Hydration safe)
    const [context, setContext] = useState<GameContext | null>(null);

    useEffect(() => {
        setContext({
            sessionId: generateRandomId(),
            requiredSum: Math.floor(Math.random() * 10) + 30,
        });
    }, []);

    // --- LOGIC ---

    // Calculer l'état de chaque règle
    const ruleStates = useMemo(() => {
        if (!context) return [];

        return PASSWORD_RULES.map((rule, index) => {
            const isValid = rule.validator(password, context);
            let status: RuleStatus = 'pending';

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
    }, [password, context]);

    // DERIVED STATE (État dérivé)
    // Au lieu d'un useEffect qui setGameState, on calcule la victoire directement.
    // Si toutes les règles sont "valid", c'est gagné.
    const isWin = useMemo(() => {
        if (!context || ruleStates.length === 0) return false;
        return ruleStates.every((r) => r.status === 'valid');
    }, [ruleStates, context]);

    // Déterminer combien de règles afficher
    const visibleRules = useMemo(() => {
        const lastValidIndex = ruleStates.map((r) => r.status).lastIndexOf('valid');
        return ruleStates.slice(0, lastValidIndex + 2);
    }, [ruleStates]);

    // SUPPRIMÉ : useEffect de vérification de victoire.

    if (!context) return null;

    return (
        <div className="bg-background text-foreground selection:bg-brand-emerald flex min-h-screen w-full flex-col items-center justify-center p-4 font-mono selection:text-black">
            {/* Header */}
            <div className="mb-8 text-center">
                <h1 className="text-brand-emerald mb-2 text-4xl font-bold drop-shadow-[0_0_10px_rgba(0,212,146,0.6)] md:text-6xl">
                    {'/// SECURITY_GATE ///'}
                </h1>
                <p className="text-muted text-sm tracking-widest uppercase">Auth Protocol v9.0</p>
            </div>

            {/* HUD */}
            <SecurityHud sessionId={context.sessionId} targetSum={context.requiredSum} />

            {/* Input */}
            <PasswordInput value={password} onChange={setPassword} isLocked={false} />

            {/* Rules List */}
            <div className="flex w-full max-w-md flex-col-reverse gap-2">
                <div className="flex w-full flex-col transition-all">
                    {visibleRules.map((item) => (
                        <RuleItem key={item.id} rule={item} status={item.status} />
                    ))}
                </div>
            </div>

            {/* Win State Overlay */}
            {isWin && (
                <div className="animate-in fade-in fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/90 duration-500">
                    <h2 className="text-brand-emerald mb-4 animate-bounce text-6xl font-bold">
                        ACCESS GRANTED
                    </h2>
                    <p className="mb-8 text-xl text-white">System Unlocked.</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="border-brand-emerald text-brand-emerald hover:bg-brand-emerald border px-8 py-3 tracking-widest uppercase transition-all hover:text-black"
                    >
                        Reboot System
                    </button>
                </div>
            )}
        </div>
    );
}

// --- HELPERS ---
function generateRandomId() {
    const chars = 'ABCDFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 3; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}
