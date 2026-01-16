'use client';

import React, { useEffect, useState } from 'react';

import { AlphaButton } from '@/components/alpha/AlphaButton';

import { GameModal, ModalVariant } from './GameModal';
import { InventoryGrid } from './InventoryGrid';
import { InventoryItemDetails } from './InventoryItemDetails';
import type { InventoryItem } from './InventorySlot';

interface ItemsModalProps {
    isOpen: boolean;
    onClose: () => void;
    items: InventoryItem[];

    title: string;
    icon?: React.ReactNode;
    variant?: ModalVariant;

    capacity?: number;
    closeLabel?: string;
}

export const ItemsModal = ({
    isOpen,
    onClose,
    items,
    title,
    icon,
    variant = 'danger',
    capacity = 4,
    closeLabel = 'FERMER',
}: ItemsModalProps) => {
    const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);

    useEffect(() => {
        if (!isOpen) {
            const timer = setTimeout(() => setSelectedItem(null), 200);
            return () => clearTimeout(timer);
        }
    }, [isOpen]);

    const handleMainAction = () => {
        if (selectedItem) {
            setSelectedItem(null);
        } else {
            onClose();
        }
    };

    return (
        <GameModal
            isOpen={isOpen}
            onClose={onClose}
            title={selectedItem ? `DATA : ${selectedItem.name}` : title}
            icon={icon}
            variant={variant}
            footer={
                <AlphaButton size="lg" fullWidth variant={variant} onClick={handleMainAction}>
                    {selectedItem ? 'RETOUR LISTE' : closeLabel}
                </AlphaButton>
            }
        >
            {selectedItem ? (
                <InventoryItemDetails item={selectedItem} variant={variant} />
            ) : (
                <InventoryGrid
                    items={items}
                    capacity={capacity}
                    onSlotClick={setSelectedItem}
                    variant={variant}
                />
            )}
        </GameModal>
    );
};
