// src/components/ThemedPortalWrapper.tsx
'use client';

import React from 'react';

import clsx from 'clsx';

import { useLocalTheme } from '@/components/LocalThemeContext';

export const ThemedPortalWrapper = ({
    children,
    className,
}: {
    children: React.ReactNode;
    className?: string;
}) => {
    const theme = useLocalTheme();

    return <div className={clsx(theme, 'text-foreground', className)}>{children}</div>;
};
