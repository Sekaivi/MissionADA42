import React from 'react';

import type { Metadata } from 'next';

import ClientLayout from '@/app/ClientLayout';

export const metadata: Metadata = {
    title: 'Alpha tests',
};

export default function AlphaLayout({ children }: { children: React.ReactNode }) {
    return (
        <ClientLayout variant="dark">
            <div className="space-y-8 font-mono">{children}</div>
        </ClientLayout>
    );
}
