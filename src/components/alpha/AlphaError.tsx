import React from 'react';

import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';

export const AlphaError = ({ message }: { message: string | null }) => {
    if (!message) return null;
    return (
        <div className="animate-in fade-in slide-in-from-top-2 border-brand-error/50 bg-brand-error/20 text-brand-error flex items-center gap-3 rounded-lg border p-4">
            <ExclamationTriangleIcon className="h-6 w-6 shrink-0" />
            <p className="text-sm font-bold">{message}</p>
        </div>
    );
};
