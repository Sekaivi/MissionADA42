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
    <div className="border-border flex items-center justify-between border-b py-2 last:border-0">
        <span className="text-muted text-sm">{label}</span>
        <span className={`font-medium ${active ? 'text-brand-emerald' : 'text-foreground'}`}>
            {value ?? 'N/A'}
        </span>
    </div>
);
