import React from 'react';

interface SecurityHudProps {
    sessionId: string;
    targetSum: number;
}

export const SecurityHud = ({ sessionId, targetSum }: SecurityHudProps) => (
    <div className="border-brand-emerald mb-6 flex w-full max-w-md justify-between border bg-black/50 p-4 font-mono text-sm shadow-[0_0_10px_rgba(0,212,146,0.1)]">
        <div className="flex flex-col">
            <span className="text-muted text-xs uppercase">Session ID</span>
            <span className="text-brand-emerald text-xl font-bold tracking-widest">
                {sessionId}
            </span>
        </div>
        <div className="flex flex-col text-right">
            <span className="text-muted text-xs uppercase">Target Sum</span>
            <span className="text-brand-purple text-xl font-bold">{targetSum}</span>
        </div>
    </div>
);
