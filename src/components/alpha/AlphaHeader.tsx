import React from 'react';

export const AlphaHeader = ({ title, subtitle }: { title: string; subtitle?: string }) => (
    <header className="border-border border-b pb-4">
        <div className="flex items-center gap-3">
            <div>
                <h1 className="text-brand-emerald text-xl font-bold tracking-widest uppercase">
                    {title}
                </h1>
                {subtitle && <p className="text-muted mt-1 text-xs">{subtitle}</p>}
            </div>
        </div>
    </header>
);
