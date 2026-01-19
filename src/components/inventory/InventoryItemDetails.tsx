'use client';

import React from 'react';

import Image from 'next/image';

import { CubeIcon } from '@heroicons/react/24/outline';

import { ModalVariant } from '@/app/interfaces/debug/GameModal';

import { InventoryItemUI } from './InventorySlot';

// ... (Garder la constante THEMES identique au fichier précédent ou l'importer)
const THEMES = {
    danger: {
        text: 'text-brand-error',
        subText: 'text-brand-error/90',
        glow: 'bg-brand-error/20',
        divider: 'bg-brand-error/30',
        border: 'border-brand-error/30',
        bgBox: 'bg-brand-error/5',
    },
    primary: {
        text: 'text-brand-emerald',
        subText: 'text-brand-emerald/90',
        glow: 'bg-brand-emerald/20',
        divider: 'bg-brand-emerald/30',
        border: 'border-brand-emerald/30',
        bgBox: 'bg-brand-emerald/5',
    },
};

interface InventoryItemDetailsProps {
    item: InventoryItemUI;
    variant?: ModalVariant;
}

export const InventoryItemDetails = ({ item, variant = 'primary' }: InventoryItemDetailsProps) => {
    const style = THEMES[variant] || THEMES.primary;

    return (
        <div className="animate-in slide-in-from-right flex h-full min-h-[250px] flex-col items-center justify-start space-y-6 pt-4 duration-300">
            <div className="relative flex items-center justify-center">
                <div className={`absolute inset-0 rounded-full blur-xl ${style.glow}`} />
                <div className={`relative h-32 w-32 ${style.text}`}>
                    {item.sprite ? (
                        <Image
                            src={item.sprite}
                            alt={item.name}
                            fill
                            className="object-contain drop-shadow-[0_0_10px_rgba(0,0,0,0.5)]"
                        />
                    ) : (
                        item.icon || <CubeIcon />
                    )}
                </div>
            </div>

            <div className="w-full space-y-4 text-center">
                <div className="space-y-1">
                    <h3 className={`text-xl font-bold tracking-widest uppercase ${style.text}`}>
                        {item.name}
                    </h3>
                    <div className={`mx-auto h-px w-1/2 ${style.divider}`} />
                </div>

                <div
                    className={`border border-dashed p-4 text-justify font-mono text-sm leading-relaxed ${style.border} ${style.bgBox} ${style.subText}`}
                >
                    {item.description ||
                        'Aucune donnée disponible pour cet objet. Analyse impossible.'}
                </div>
            </div>
        </div>
    );
};
