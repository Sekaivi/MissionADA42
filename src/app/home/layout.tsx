import React from 'react';

import type { Metadata } from 'next';

import ClientLayout from '@/app/ClientLayout';

export const metadata: Metadata = {
    title: 'Homepage',
};

export default function HomeLayout({ children }: { children: React.ReactNode }) {
    return (
        <ClientLayout variant="light">
            {children}
        </ClientLayout>
    );
}