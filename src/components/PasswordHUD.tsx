import React from 'react';

interface SecurityHudProps {
    sessionId: string;
    targetSum: number;
}

export const SecurityHud = ({ sessionId, targetSum }: SecurityHudProps) => (
    <div className="border-border bg-surface mb-6 flex w-full max-w-md justify-between border p-4 font-mono text-sm">
        <div className="flex flex-col">
            <span className="text-muted text-xs uppercase">ID Session</span>
            <span className="text-brand-emerald text-xl font-bold tracking-widest">
                {sessionId}
            </span>
        </div>
        <div className="flex flex-col text-right">
            <span className="text-muted text-xs uppercase">Somme cible</span>
            <span className="text-brand-purple text-xl font-bold">{targetSum}</span>
        </div>
    </div>
);
