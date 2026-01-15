import React from 'react';

import type { Metadata } from 'next';

import { Providers } from '@/app/providers';
import { ServiceWorkerRegister } from '@/app/sw-register';

import './globals.css';

export const metadata: Metadata = {
    title: 'SAE501 - Escape Game - Groupe 1',
    description: "Description de l'escape game",
    manifest: '/manifest.json',
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="fr" suppressHydrationWarning>
            <body>
                <ServiceWorkerRegister />
                <Providers>{children}</Providers>
            </body>
        </html>
    );
}
