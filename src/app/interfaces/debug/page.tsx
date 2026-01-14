'use client';

import React from 'react';

import { Cog8ToothIcon } from '@heroicons/react/16/solid';
import { VideoCameraIcon } from '@heroicons/react/24/outline';
import { ExclamationTriangleIcon } from '@heroicons/react/24/solid';

import QuizPuzzleSimple from '@/components/SCENARIO/1-1-QuizPuzzle-simple/QuizPuzzle-simple';
import { AlphaButton } from '@/components/alpha/AlphaButton';
import { AlphaError } from '@/components/alpha/AlphaError';
import { AlphaPuzzleHeader } from '@/components/alpha/AlphaGameHeader';
import { ModuleLink } from '@/components/alpha/ModuleLink';

export default function DebugPage() {
    return (
        <div className={'space-y-6'}>
            <AlphaPuzzleHeader
                left={
                    <div className={'text-brand-error flex gap-4 font-bold'}>
                        <ExclamationTriangleIcon className="h-4 w-4 animate-pulse" />
                        Interface debogage
                    </div>
                }
                right={
                    <div className={'text-brand-error active:bg-opacity-80 active:scale-95'}>
                        <Cog8ToothIcon className="h-6 w-6" />
                    </div>
                }
            />

            <AlphaError message={'Système défaillant'} />

            <QuizPuzzleSimple
                onSolve={function (): void {
                    throw new Error('Function not implemented.');
                }}
            />

            <div className={'flex gap-4'}>
                <AlphaButton size={'lg'} fullWidth={true} variant={'danger'}>
                    Inventaire
                </AlphaButton>
                <AlphaButton size={'lg'} fullWidth={true} variant={'danger'}>
                    Indices
                </AlphaButton>
            </div>

            <div className={'space-y-4'}>
                <ModuleLink
                    href={'/alpha/camera/camera-only'}
                    title={'Camera'}
                    subtitle={''}
                    icon={VideoCameraIcon}
                />
                <ModuleLink
                    href={'/alpha/camera/camera-only'}
                    title={'Scanner'}
                    subtitle={''}
                    icon={VideoCameraIcon}
                />
            </div>
        </div>
    );
}
