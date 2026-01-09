'use client';

import React, { useEffect, useMemo, useState } from 'react';

import { SecurityHud } from '@/components/PasswordHUD';
import { RuleItem } from '@/components/RuleItem';
import { AlphaInput } from '@/components/alpha/AlphaInput';
import { AlphaSuccess } from '@/components/alpha/AlphaSuccess';
import { AlphaTitle } from '@/components/alpha/AlphaTitle';
import { GameContext, RuleStatus } from '@/types/passwordGame';
import { PASSWORD_RULES } from '@/utils/passwordRules';

export default function PasswordGame() {
    // --- STATE ---
    const [password, setPassword] = useState('');

    const [context] = useState<GameContext>(() => ({
        sessionId: generateRandomId(),
        requiredSum: Math.floor(Math.random() * 10) + 15,
    }));

    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsMounted(true);
        }, 0);

        return () => clearTimeout(timer);
    }, []);

    // --- LOGIC ---

    const ruleStates = useMemo(() => {
        if (!isMounted) return [];

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
    }, [password, context, isMounted]);

    const isWin = useMemo(() => {
        if (!isMounted || ruleStates.length === 0) return false;
        return ruleStates.every((r) => r.status === 'valid');
    }, [ruleStates, isMounted]);

    const visibleRules = useMemo(() => {
        const lastValidIndex = ruleStates.map((r) => r.status).lastIndexOf('valid');
        return ruleStates.slice(0, lastValidIndex + 2);
    }, [ruleStates]);

    if (!isMounted) return null;

    return (
        <div className="bg-background text-foreground selection:bg-brand-emerald flex min-h-screen w-full flex-col items-center justify-center p-4 font-mono selection:text-black">
            <div className="mb-8 text-center">
                <AlphaTitle>{'/// SECURITY_GATE ///'}</AlphaTitle>
                <p className="text-muted text-sm tracking-widest uppercase">Auth Protocol v9.0</p>
            </div>

            <SecurityHud sessionId={context.sessionId} targetSum={context.requiredSum} />

            <div className="relative mb-8 w-full max-w-md">
                <AlphaInput
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isWin}
                    variant={isWin ? 'success' : 'default'}
                    placeholder="ENTER_PASSWORD..."
                    autoComplete="off"
                    spellCheck={false}
                    className="pr-20"
                />

                <div className="text-muted pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-xs">
                    CHARS: {password.length}
                </div>
            </div>

            <div className="flex w-full max-w-md flex-col-reverse gap-2">
                <div className="flex w-full flex-col transition-all">
                    {visibleRules.map((item) => (
                        <RuleItem key={item.id} rule={item} status={item.status} />
                    ))}
                </div>
            </div>
            {isWin && <AlphaSuccess message={'/// ACCESS GRANTED ///'} />}
        </div>
    );
}

// --- HELPERS ---
function generateRandomId() {
    const chars = 'ABCDFGHIJKLMNOPQRSTUVWXYZ';
    let result = '';
    for (let i = 0; i < 3; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}
