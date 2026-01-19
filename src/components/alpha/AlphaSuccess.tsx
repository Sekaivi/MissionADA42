import React from 'react';

import { CheckCircleIcon } from '@heroicons/react/24/solid';

export const AlphaSuccess = ({ message }: { message: string | null }) => {
    if (!message) return null;
    return (
        <div className="animate-in fade-in slide-in-from-top-2 border-brand-emerald/50 bg-brand-emerald/20 text-brand-emerald flex items-center gap-3 rounded-lg border p-4">
            <CheckCircleIcon className="h-10 w-10 animate-bounce" />
            <p className="text-sm font-bold">{message}</p>
        </div>
    );
};
