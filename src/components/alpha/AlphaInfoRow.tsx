import React from 'react';

export const AlphaInfoRow = ({
    label,
    value,
    active = false,
}: {
    label: React.ReactNode;
    value: React.ReactNode;
    active?: boolean;
}) => (
    <div className="border-border flex items-center justify-between border-b py-2 last:border-0">
        <span className="text-muted text-sm">{label}</span>
        <span className={`font-medium ${active ? 'text-brand-emerald' : 'text-foreground'}`}>
            {value ?? 'N/A'}
        </span>
    </div>
);
