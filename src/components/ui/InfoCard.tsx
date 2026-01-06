'use client';
import React from 'react';

import Card from './Card';

interface InfoCardProps {
    title: string;
    description: string;
    icon: React.ReactNode;
}

export default function InfoCard({ title, description, icon }: InfoCardProps) {
    return (
        <Card
            // STYLE SPÉCIFIQUE INFO : Fond transparent, bordure noire fine
            className="flex h-full flex-col border border-black/20 bg-transparent hover:border-black/40 hover:bg-white/10"
        >
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                {icon}
            </div>
            <h3 className="mb-2 text-lg font-bold text-gray-900">{title}</h3>
            <p className="text-sm leading-relaxed text-gray-600">{description}</p>
        </Card>
    );
}
