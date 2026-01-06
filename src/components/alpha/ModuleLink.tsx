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
                    ? 'border-emerald-500/30 bg-emerald-950/10 hover:border-emerald-500 hover:bg-emerald-900/20'
                    : 'border-neutral-800 bg-neutral-900/50 hover:border-neutral-600 hover:bg-neutral-800'
            }`}
        >
            <div
                className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border transition-colors ${
                    isGame
                        ? 'border-emerald-500/30 bg-emerald-900/30 text-emerald-400 group-hover:bg-emerald-500 group-hover:text-black'
                        : 'border-neutral-700 bg-neutral-800 text-neutral-400 group-hover:border-neutral-500 group-hover:text-white'
                }`}
            >
                <Icon className="h-6 w-6" />
            </div>

            <div className="flex-1">
                <div className="flex items-center gap-2">
                    <h3 className={`font-bold ${isGame ? 'text-emerald-100' : 'text-neutral-200'}`}>
                        {title}
                    </h3>
                    {isGame && (
                        <span className="rounded bg-emerald-500 px-1.5 py-0.5 text-[10px] font-bold text-black">
                            JEU
                        </span>
                    )}
                </div>
                <p className="text-sm text-neutral-500 group-hover:text-neutral-400">{subtitle}</p>
            </div>

            {isGame && (
                <PlayCircleIcon className="h-8 w-8 text-emerald-500 opacity-0 transition-all duration-300 group-hover:translate-x-1 group-hover:opacity-100" />
            )}
        </Link>
    );
}
