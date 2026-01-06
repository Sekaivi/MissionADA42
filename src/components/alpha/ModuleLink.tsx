import React from 'react';

import Link from 'next/link';

import { PlayCircleIcon } from '@heroicons/react/24/solid';

import { ModuleItem } from '@/types/alpha/module';

export function ModuleLink({ href, title, subtitle, icon: Icon, isGame = false }: ModuleItem) {
    return (
        <Link
            href={href}
            className={`group relative flex items-center gap-4 rounded-xl border p-4 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg ${
                isGame
                    ? 'border-brand-emerald/30 bg-brand-emerald/10 hover:border-brand-emerald hover:bg-brand-emerald/20'
                    : 'border-border bg-surface hover:border-muted hover:bg-surface-highlight'
            }`}
        >
            <div
                className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border transition-colors ${
                    isGame
                        ? 'border-brand-emerald/30 bg-brand-emerald/20 text-brand-emerald group-hover:bg-brand-emerald group-hover:text-background'
                        : 'border-border bg-surface text-muted group-hover:border-muted group-hover:text-foreground'
                }`}
            >
                <Icon className="h-6 w-6" />
            </div>

            <div className="flex-1">
                <div className="flex items-center gap-2">
                    <h3
                        className={`font-bold ${isGame ? 'text-brand-emerald' : 'text-foreground'}`}
                    >
                        {title}
                    </h3>
                    {isGame && (
                        <span className="bg-brand-emerald text-background rounded px-1.5 py-0.5 text-xs font-bold">
                            JEU
                        </span>
                    )}
                </div>
                <p className="text-muted group-hover:text-foreground text-sm transition-colors">
                    {subtitle}
                </p>
            </div>

            {isGame && (
                <PlayCircleIcon className="text-brand-emerald h-8 w-8 opacity-0 transition-all duration-300 group-hover:translate-x-1 group-hover:opacity-100" />
            )}
        </Link>
    );
}
