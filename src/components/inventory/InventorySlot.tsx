'use client';

import React from 'react';

import Image from 'next/image';

import { CubeIcon } from '@heroicons/react/24/outline';

import { ModalVariant } from '@/app/interfaces/debug/GameModal';

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

export interface InventoryItemUI {
    id: string;
    name: string;
    icon?: React.ReactNode;
    sprite?: string;
    description?: string;
}

interface InventorySlotProps {
    index: number;
    item?: InventoryItemUI | null;
    onClick?: () => void;
    variant?: ModalVariant;
}

export const InventorySlot = ({ index, item, onClick, variant = 'danger' }: InventorySlotProps) => {
    const slotLabel = `SLOT_${(index + 1).toString().padStart(2, '0')}`;
    const style = THEMES[variant] || THEMES.danger;

    return (
        <div
            onClick={onClick}
            className={`relative flex aspect-square cursor-pointer flex-col items-center justify-center border border-dashed transition-all hover:brightness-125 ${style.bgBox} ${style.border}`}
        >
            <span className={`absolute top-2 left-2 font-mono text-[10px] opacity-50`}>
                {slotLabel}
            </span>

            {item ? (
                <div className="animate-in fade-in zoom-in flex flex-col items-center gap-2 duration-300">
                    <div className={`relative h-12 w-12`}>
                        {item.sprite ? (
                            <Image
                                src={item.sprite}
                                alt={item.name}
                                fill
                                className="object-contain"
                            />
                        ) : (
                            item.icon || <CubeIcon />
                        )}
                    </div>
                    <span className="px-1 text-center text-[10px] font-bold tracking-wider uppercase">
                        {item.name}
                    </span>
                </div>
            ) : (
                <span className={`font-mono text-xs opacity-30`}>&lt;VIDE&gt;</span>
            )}
        </div>
    );
};
