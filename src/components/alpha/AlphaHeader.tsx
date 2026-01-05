import React from 'react';

export const AlphaHeader = ({ title, subtitle }: { title: string; subtitle?: string }) => (
    <header className="border-b border-neutral-800 pb-4">
        <div className="flex items-center gap-3">
            <div>
                <h1 className="text-xl font-bold tracking-widest text-emerald-400 uppercase">
                    {title}
                </h1>
                {subtitle && <p className="mt-1 text-xs text-neutral-500">{subtitle}</p>}
            </div>
        </div>
    </header>
);
