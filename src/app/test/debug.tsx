'use client';

import React from 'react';

import { CommandLineIcon, GlobeAltIcon, PuzzlePieceIcon } from '@heroicons/react/24/outline';
import clsx from 'clsx';

export type DebugElementId = 'nav_console' | 'nav_sources' | 'nav_network' | null;

interface DebugPageProps {
    highlightedElement?: DebugElementId;
}

export default function DebugPage({ highlightedElement = null }: DebugPageProps) {
    // helper pour savoir si un élément est highlighted
    const getHighlightClass = (id: DebugElementId) => {
        const isHighlighted = highlightedElement === id;
        return clsx(
            'flex flex-col items-center justify-center p-2 rounded transition-all duration-300',
            'border border-transparent',
            isHighlighted &&
                'bg-brand-purple/20 text-brand-purple border-brand-purple ring-2 ring-brand-purple ring-offset-2 ring-offset-black scale-110 z-50 animate-pulse'
        );
    };

    return (
        <div className="animate-in fade-in flex h-full min-h-[100vh] flex-col pb-24">

            <div className="fixed right-0 bottom-0 left-0 z-40 border-t border-border p-2 pb-6">
                <div className="mx-auto flex max-w-md items-center justify-around">
                    <button className={getHighlightClass('nav_console')}>
                        <CommandLineIcon className="mb-1 h-6 w-6" />
                        <span className="text-[10px] font-bold uppercase">Console</span>
                    </button>

                    <button className={getHighlightClass('nav_sources')}>
                        <PuzzlePieceIcon className="mb-1 h-6 w-6" />
                        <span className="text-[10px] font-bold uppercase">Sources</span>
                    </button>

                    <button className={getHighlightClass('nav_network')}>
                        <GlobeAltIcon className="mb-1 h-6 w-6" />
                        <span className="text-[10px] font-bold uppercase">Réseau</span>
                    </button>
                </div>
            </div>
        </div>
    );
}
