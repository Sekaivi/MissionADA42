'use client';

import React from 'react';

import Link from 'next/link';

import { RectangleStackIcon } from '@heroicons/react/16/solid';
import { XMarkIcon } from '@heroicons/react/24/solid';

import { AlphaPuzzleHeader } from '@/components/alpha/AlphaGameHeader';

export default function DebugPage() {
    return (
        <div className={'space-y-6'}>
            <div>
                <AlphaPuzzleHeader
                    left={
                        <div className={'text-brand-error flex gap-4 font-bold'}>
                            <RectangleStackIcon className="h-4 w-4" />
                            Gestion de la partie
                        </div>
                    }
                    right={
                        <div className={'text-brand-error active:bg-opacity-80 active:scale-95'}>
                            <Link href={'../.'}>
                                <XMarkIcon className="h-6 w-6" />
                            </Link>
                        </div>
                    }
                />
            </div>
        </div>
    );
}
