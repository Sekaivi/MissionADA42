import React from 'react';

import type { Metadata } from 'next';

import { AlphaPage } from '@/components/alpha/AlphaPage';

export const metadata: Metadata = {
    title: 'Alpha tests',
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return <AlphaPage>{children}</AlphaPage>;
}
