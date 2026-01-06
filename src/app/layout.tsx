import type { Metadata } from 'next';

import './globals.css';

export const metadata: Metadata = {
    title: 'SAE501 - Escape Game - Groupe 1',
    description: "Description de l'escape game",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="fr">
            <body>{children}</body>
        </html>
    );
}
