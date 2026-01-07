'use client';

import React, { useEffect } from 'react';

import { useTheme } from 'next-themes';

export default function ClientLayout({
    children,
    variant = 'light',
}: {
    children: React.ReactNode;
    variant?: 'light' | 'dark';
}) {
    const { setTheme } = useTheme();

    useEffect(() => {
        setTheme(variant);
    }, [variant, setTheme]);

    return (
        <div className="bg-background text-foreground min-h-screen w-full transition-colors duration-300">
            <div className="mx-auto w-full max-w-6xl p-8">{children}</div>
        </div>
    );
}
