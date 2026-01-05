import React from 'react';

export const AlphaError = ({ message }: { message: string | null }) => {
    if (!message) return null;
    return (
        <div className="animate-in fade-in slide-in-from-top-2 flex items-center gap-3 rounded-lg border border-red-500/50 bg-red-950/30 p-4 text-red-200">
            <span className="text-xl">🚨</span>
            <p className="text-sm font-bold">{message}</p>
        </div>
    );
};
