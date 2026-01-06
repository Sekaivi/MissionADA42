'use client';
import React from 'react';
import Card from './Card'; // On importe le parent

interface InfoCardProps {
    title: string;
    description: string;
    icon: React.ReactNode;
    className?: string;
}

export default function InfoCard({ title, description, icon, className }: InfoCardProps) {
    return (
        <Card

            className={`bg-transparent border border-black hover:shadow-2xl hover:-translate-y-1 flex flex-col h-full ${className}`}
        >
            <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mb-4">
                {icon}
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">
                {title}
            </h3>
            <p className="text-gray-600 text-sm leading-relaxed">
                {description}
            </p>
        </Card>
    );
}