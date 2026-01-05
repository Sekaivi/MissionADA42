import React from 'react';

export const AlphaInfoRow = ({
    label,
    value,
    active = false,
}: {
    label: string;
    value: string | number | undefined;
    active?: boolean;
}) => (
    <div className="flex items-center justify-between border-b border-neutral-800 py-2 last:border-0">
        <span className="text-sm text-neutral-500">{label}</span>
        <span className={`font-medium ${active ? 'text-emerald-400' : 'text-neutral-300'}`}>
            {value ?? 'N/A'}
        </span>
    </div>
);
