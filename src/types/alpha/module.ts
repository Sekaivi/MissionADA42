import React from 'react';

export type ModuleItem = {
    href?: string;
    onClick?: () => void;
    title: string;
    subtitle: string;
    icon: React.ElementType;
    isGame?: boolean;
};

export type ModuleGroup = {
    title: string;
    icon: React.ElementType;
    headerColor: string; // classe Tailwind
    items: ModuleItem[];
};
