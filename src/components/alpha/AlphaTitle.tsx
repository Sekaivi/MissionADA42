import React, { ReactNode } from 'react';

export const AlphaTitle = ({ children }: { children: ReactNode }) => (
    <h1 className="text-brand-emerald mb-4 text-4xl font-black tracking-tighter drop-shadow-[0_0_10px_var(--color-brand-emerald)]">
        {children}
    </h1>
);
