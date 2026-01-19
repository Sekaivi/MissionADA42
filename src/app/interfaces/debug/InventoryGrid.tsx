'use client';

import React from 'react';

import { ModalVariant } from './GameModal';
import { InventoryItem, InventorySlot } from './InventorySlot';

interface InventoryGridProps {
    items: InventoryItem[];
    capacity?: number;
    onSlotClick?: (item: InventoryItem) => void;
    variant?: ModalVariant;
}

export const InventoryGrid = ({
    items,
    capacity = 4,
    onSlotClick,
    variant = 'danger',
}: InventoryGridProps) => {
    const slots = Array.from({ length: capacity }).map((_, i) => {
        const slotNumber = i + 1;
        return items.find((item) => item.id.toString() === slotNumber.toString()) || null;
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
