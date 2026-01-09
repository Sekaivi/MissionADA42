// src/components/ThemedPortalWrapper.tsx
'use client';

import { useLocalTheme } from '@/components/LocalThemeContext';
import clsx from "clsx";
import React from "react";

export const ThemedPortalWrapper = ({ children, className }: { children: React.ReactNode, className?: string }) => {
    const theme = useLocalTheme();

    return (
        <div className={clsx(theme, "text-foreground", className)}>
            {children}
        </div>
    );
};