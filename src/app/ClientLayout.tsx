// src/components/ClientLayout.tsx
'use client';

import React from 'react';
import { LocalThemeProvider } from '@/components/LocalThemeContext';
import clsx from "clsx";

export default function ClientLayout({
                                         children,
                                         variant = 'light',
                                     }: {
    children: React.ReactNode;
    variant?: 'light' | 'dark';
}) {
    return (
        <LocalThemeProvider value={variant}>
            <div
                className={clsx(
                    "min-h-screen w-full transition-colors duration-300",
                    "bg-background text-foreground",
                    variant
                )}
                style={{ colorScheme: variant }}
            >
                <div className="mx-auto w-full max-w-6xl p-8">
                    {children}
                </div>
            </div>
        </LocalThemeProvider>
    );
}