'use client';

import React from 'react';

import {
    CheckCircleIcon,
    CommandLineIcon,
    CpuChipIcon,
    FolderOpenIcon,
    LockClosedIcon,
} from '@heroicons/react/24/outline';
import clsx from 'clsx';

import { AlphaCard } from '@/components/alpha/AlphaCard';
import { AlphaTerminalWrapper } from '@/components/alpha/AlphaTerminalWrapper';
import { MODULES, ModuleId } from '@/data/modules';

export type DebugTab = 'home' | 'modules' | 'evidence';

interface DebugPageProps {
    currentTab: DebugTab;
    onTabChange: (tab: DebugTab) => void;
    highlightedElement?: string | null;
    validatedModules: ModuleId[];
    onModuleClick: (id: ModuleId) => void;
}

export default function DebugPage({
    currentTab,
    onTabChange,
    highlightedElement,
    validatedModules,
    onModuleClick,
}: DebugPageProps) {
    const isModuleLocked = (id: ModuleId) => {
        // ordre strict : Face -> Color -> QR -> Gyro -> Mic
        if (id === 'facial_recognition') return false; // Toujours ouvert
        if (id === 'color_scanner') return !validatedModules.includes('facial_recognition');
        if (id === 'qr_scanner') return !validatedModules.includes('color_scanner');
        if (id === 'gyroscope') return !validatedModules.includes('qr_scanner');
        if (id === 'microphone') return !validatedModules.includes('gyroscope');
        return true;
    };

    const getHighlightClass = (id: string, baseClass: string) => {
        const isHighlighted = highlightedElement === id;
        return clsx(
            baseClass,
            isHighlighted &&
                'ring-2 ring-brand-purple ring-offset-2 ring-offset-black scale-105 z-50 animate-pulse bg-brand-purple/20 border-brand-purple shadow-[0_0_15px_rgba(168,85,247,0.5)]'
        );
    };

    return (
        <div className="animate-in fade-in flex h-full min-h-[70vh] flex-col pb-24">
            <div className="flex-1 space-y-4 p-4">
                {currentTab === 'home' && (
                    <AlphaCard title="Terminal Système">
                        <AlphaTerminalWrapper>on est là</AlphaTerminalWrapper>
                    </AlphaCard>
                )}

                {/* VUE MODULES */}
                {currentTab === 'modules' && (
                    <div className="grid grid-cols-1 gap-3">
                        {MODULES.map((mod) => {
                            const isValidated = validatedModules.includes(mod.id);
                            const isLocked = isModuleLocked(mod.id);
                            return (
                                <button
                                    key={mod.id}
                                    onClick={() => onModuleClick(mod.id)}
                                    disabled={isValidated || isLocked}
                                    className={getHighlightClass(
                                        mod.id,
                                        `flex items-center gap-4 rounded-lg border p-4 text-left transition-all ${
                                            isValidated
                                                ? 'bg-brand-emerald/10 border-brand-emerald text-brand-emerald opacity-70'
                                                : 'border-white/10 bg-neutral-900 text-neutral-300 hover:bg-white/5'
                                        }`
                                    )}
                                >
                                    <mod.icon className="h-8 w-8 flex-shrink-0" />
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 text-sm font-bold">
                                            {mod.label}
                                            {isValidated && (
                                                <CheckCircleIcon className="text-brand-emerald h-4 w-4" />
                                            )}
                                        </div>
                                        <p className="line-clamp-1 text-xs opacity-60">
                                            {mod.description}
                                        </p>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                )}

                {/* VUE PREUVES */}
                {currentTab === 'evidence' && (
                    <AlphaCard title="Pièces à conviction">
                        <div className="py-10 text-center text-sm text-neutral-500 italic">
                            <LockClosedIcon className="mx-auto mb-2 h-12 w-12 opacity-50" />
                            Aucune donnée récupérée pour le moment.
                        </div>
                    </AlphaCard>
                )}
            </div>

            {/* --- BARRE DE NAVIGATION (FIXED BOTTOM) --- */}
            <div className="fixed right-0 bottom-0 left-0 z-40 border-t border-white/10 bg-black/95 px-2 py-3 pb-8 backdrop-blur">
                <div className="mx-auto flex max-w-md items-center justify-around gap-2">
                    {/* BOUTON HOME */}
                    <button
                        onClick={() => onTabChange('home')}
                        className={getHighlightClass(
                            'nav_home',
                            `flex flex-1 flex-col items-center justify-center rounded p-2 transition-colors ${currentTab === 'home' ? 'bg-white/10 text-white' : 'text-neutral-500'}`
                        )}
                    >
                        <CommandLineIcon className="mb-1 h-6 w-6" />
                        <span className="text-[10px] font-bold uppercase">Terminal</span>
                    </button>

                    {/* BOUTON MODULES */}
                    <button
                        onClick={() => onTabChange('modules')}
                        className={getHighlightClass(
                            'nav_modules',
                            `flex flex-1 flex-col items-center justify-center rounded p-2 transition-colors ${currentTab === 'modules' ? 'bg-white/10 text-white' : 'text-neutral-500'}`
                        )}
                    >
                        <CpuChipIcon className="mb-1 h-6 w-6" />
                        <span className="text-[10px] font-bold uppercase">Modules</span>
                    </button>

                    {/* BOUTON PREUVES */}
                    <button
                        onClick={() => onTabChange('evidence')}
                        className={getHighlightClass(
                            'nav_evidence',
                            `flex flex-1 flex-col items-center justify-center rounded p-2 transition-colors ${currentTab === 'evidence' ? 'bg-white/10 text-white' : 'text-neutral-500'}`
                        )}
                    >
                        <FolderOpenIcon className="mb-1 h-6 w-6" />
                        <span className="text-[10px] font-bold uppercase">Preuves</span>
                    </button>
                </div>
            </div>
        </div>
    );
}
