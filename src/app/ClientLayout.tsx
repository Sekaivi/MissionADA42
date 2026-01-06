import React from 'react';

export default function ClientLayout({
    children,
    variant = 'light', // Par défaut light
}: Readonly<{
    children: React.ReactNode;
    variant?: 'light' | 'dark';
}>) {
    return (
        <div className={`theme-${variant} bg-background text-foreground min-h-screen w-full`}>
            <div className="mx-auto w-full max-w-6xl p-8">{children}</div>
        </div>
    );
}
