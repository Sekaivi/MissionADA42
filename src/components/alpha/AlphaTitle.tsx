import React, { ReactNode } from 'react';

import clsx from 'clsx';

export const AlphaTitle = ({
    children,
    className = '',
}: {
    children: ReactNode;
    className?: string;
}) => (
    <h1
        className={clsx(
            'text-brand-emerald mb-4 text-4xl font-black drop-shadow-[0_0_8px_var(--color-brand-emerald)]',
            className
        )}
    >
        {children}
    </h1>
);
