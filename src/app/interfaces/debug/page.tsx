'use client';

import React, { useState } from 'react';

import Link from 'next/link';

import { Cog8ToothIcon, DocumentTextIcon } from '@heroicons/react/16/solid';
import { CubeIcon, ExclamationTriangleIcon, VideoCameraIcon } from '@heroicons/react/24/outline';

import { ItemsModal } from '@/app/interfaces/debug/ItemsModal';
import QuizPuzzleSimple from '@/components/SCENARIO/1-1-QuizPuzzle-simple/QuizPuzzle-simple';
import { AlphaButton } from '@/components/alpha/AlphaButton';
import { AlphaError } from '@/components/alpha/AlphaError';
import { AlphaPuzzleHeader } from '@/components/alpha/AlphaGameHeader';
import { ModuleLink } from '@/components/alpha/ModuleLink';

import TerminalSection from '../debug/TerminalSection';

export default function DebugPage() {
    const [isInventoryOpen, setIsInventoryOpen] = useState(false);
    const [isModuleOpen, setIsModuleOpen] = useState(false);

    const InventoryItems = [
        {
            id: '1',
            name: 'Certificat',
            icon: <DocumentTextIcon />,
            isFound: true,
            description: 'bla bla bla',
        },
        { id: '2', name: 'Lettre', isFound: true },
        { id: '3', name: 'Lettre2', isFound: false },
        { id: '4', name: 'Truc', isFound: true },
    ];

    const ModuleItems = [
        {
            id: '1',
            name: 'Certificat3',
            icon: <DocumentTextIcon />,
            isFound: true,
            description: 'bla bla bla',
        },
        { id: '2', name: 'Lettre', isFound: true },
        { id: '3', name: 'Lettre2', isFound: false },
        { id: '4', name: 'Truc', isFound: true },
    ];

    return (
        <div className="min-h-screen p-4 font-mono">
            <ItemsModal
                isOpen={isInventoryOpen}
                onClose={() => setIsInventoryOpen(false)}
                items={InventoryItems}
                title="Inventaire"
                icon={<CubeIcon />}
                variant="danger"
                closeLabel="FERMER"
                capacity={4}
            />

            <ItemsModal
                isOpen={isModuleOpen}
                onClose={() => setIsModuleOpen(false)}
                items={ModuleItems}
                title="Modules"
                icon={<DocumentTextIcon />}
                variant="primary"
                closeLabel="DÉCONNEXION"
                capacity={6}
            />

            <div className="mx-auto space-y-8">
                <div>
                    <div className="mb-6">
                        <AlphaPuzzleHeader
                            left={
                                <div className="text-brand-error flex items-center gap-3 font-bold tracking-tight uppercase">
                                    <ExclamationTriangleIcon className="h-5 w-5 animate-pulse" />
                                    <span>Debug_Mode</span>
                                </div>
                            }
                            right={
                                <div className="text-border hover:text-brand-error transition-colors active:scale-95">
                                    <Link href={'host-pannel'}>
                                        <Cog8ToothIcon className="h-6 w-6" />
                                    </Link>
                                </div>
                            }
                        />
                    </div>
                    <AlphaError message={'ECHEC CRITIQUE DU SYSTÈME'} />
                </div>

                <div className="relative">
                    <div className="bg-brand-error/20 absolute top-0 bottom-0 -left-3 w-1" />
                    <div className="pl-2">
                        <p className="text-brand-error mb-2 animate-pulse text-xs">
                            &gt; ATTENTION REQUISE
                        </p>
                        <QuizPuzzleSimple
                            onSolve={function (): void {
                                throw new Error('Function not implemented.');
                            }}
                        />
                    </div>
                </div>

                <TerminalSection label="TOOLS">
                    <div className="flex gap-4">
                        <AlphaButton
                            size={'lg'}
                            fullWidth={true}
                            variant={'danger'}
                            className="uppercase"
                            onClick={() => setIsInventoryOpen(true)}
                        >
                            Inventaire
                        </AlphaButton>
                        <AlphaButton
                            size={'lg'}
                            fullWidth={true}
                            variant={'danger'}
                            className="uppercase"
                            onClick={() => setIsModuleOpen(true)}
                        >
                            Indices
                        </AlphaButton>
                    </div>
                </TerminalSection>

                <TerminalSection label="MODULES">
                    <div className="space-y-4">
                        <div className="group border-border relative border-l-2 pl-4">
                            <ModuleLink
                                href={'/alpha/camera/camera-only'}
                                title={'Camera'}
                                subtitle={''}
                                icon={VideoCameraIcon}
                            />
                        </div>

                        <div className="group border-border relative border-l-2 pl-4">
                            <ModuleLink
                                href={'/alpha/camera/camera-only'}
                                title={'Scanner'}
                                subtitle={''}
                                icon={VideoCameraIcon}
                            />
                        </div>
                    </div>
                </TerminalSection>
            </div>
        </div>
    );
}
