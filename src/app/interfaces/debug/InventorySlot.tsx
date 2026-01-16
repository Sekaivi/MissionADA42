'use client';

import React from 'react';

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

export interface InventoryItem {
    id: string;
    name: string;
    icon?: React.ReactNode;
    description?: string;
}

interface InventorySlotProps {
    index: number;
    item?: InventoryItem | null;
    onClick?: () => void;
    variant?: ModalVariant;
}

export const InventorySlot = ({ index, item, onClick, variant = 'danger' }: InventorySlotProps) => {
    const slotLabel = `SLOT_${(index + 1).toString().padStart(2, '0')}`;
    const style = THEMES[variant] || THEMES.danger;

    return (
        <div
            onClick={onClick}
            className={`relative flex aspect-square flex-col items-center justify-center border border-dashed ${style.bgBox} ${style.border}`}
        >
            <span className={`absolute top-2 left-2 font-mono text-[10px]`}>{slotLabel}</span>

            {item ? (
                <div className="animate-in fade-in zoom-in flex flex-col items-center gap-2 duration-300">
                    <div className={`h-8 w-8`}>{item.icon || <CubeIcon />}</div>
                    <span className="px-1 text-center text-xs font-bold uppercase">
                        {item.name}
                    </span>
                </div>
            ) : (
                <span className="text-border/50 font-mono text-xs">&lt;VIDE&gt;</span>
            )}
        </div>
    );
};
