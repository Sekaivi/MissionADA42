'use client';

import React from 'react';

import { ModalVariant } from '@/app/interfaces/debug/GameModal';

import { InventoryItemUI, InventorySlot } from './InventorySlot';

interface InventoryGridProps {
    items: InventoryItemUI[];
    capacity?: number;
    onSlotClick?: (item: InventoryItemUI) => void;
    variant?: ModalVariant;
}

export const InventoryGrid = ({
    items,
    capacity = 4,
    onSlotClick,
    variant = 'primary',
}: InventoryGridProps) => {
    const slots = Array.from({ length: capacity }).map((_, i) => {
        return items[i] || null;
    });

    return (
        <div className={`grid gap-4 ${capacity > 4 ? 'grid-cols-3' : 'grid-cols-2'}`}>
            {slots.map((item, index) => (
                <InventorySlot
                    key={index}
                    index={index}
                    item={item}
                    onClick={() => item && onSlotClick?.(item)}
                    variant={variant}
                />
            ))}
        </div>
    );
};
