'use client';
import React, { useState } from 'react';

import { ComputerDesktopIcon, RocketLaunchIcon } from '@heroicons/react/24/solid';

import { AlphaButton } from '@/components/alpha/AlphaButton';
import { AlphaCard } from '@/components/alpha/AlphaCard';
import { AlphaInput } from '@/components/alpha/AlphaInput';
import { useEscapeGame } from '@/context/EscapeGameContext';

export const GameLobby = () => {
    const { joinSession, createSessionAsHost } = useEscapeGame();
    const [view, setView] = useState<'menu' | 'host' | 'join'>('menu');
    const [pseudo, setPseudo] = useState('');
    const [code, setCode] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!pseudo) return;
        setIsLoading(true);
        await createSessionAsHost(pseudo);
        // le contexte va mettre à jour isConnected, ce composant sera démonté par le parent
    };

    const handleJoin = (e: React.FormEvent) => {
        e.preventDefault();
        if (!pseudo || code.length !== 4) return;
        joinSession(code, pseudo);
    };

    if (view === 'menu') {
        return (
            <AlphaCard title="Connexion Réseau Alpha">
                <div className="grid grid-cols-2 gap-4 py-4">
                    <button
                        onClick={() => setView('host')}
                        className="bg-surface border-border hover:bg-surface flex flex-col items-center gap-2 rounded-xl border p-4 transition-all"
                    >
                        <ComputerDesktopIcon className="text-brand-purple h-12 w-12" />
                        <span className="font-bold">LANCER LA MISSION</span>
                        <span className="text-muted text-xs">(Hôte)</span>
                    </button>
                    <button
                        onClick={() => setView('join')}
                        className="bg-surface border-border hover:bg-surface flex flex-col items-center gap-2 rounded-xl border p-4 transition-all"
                    >
                        <RocketLaunchIcon className="text-brand-blue h-12 w-12" />
                        <span className="font-bold">REJOINDRE L'ESCOUADE</span>
                        <span className="text-muted text-xs">(Agent)</span>
                    </button>
                </div>
            </AlphaCard>
        );
    }

    return (
        <AlphaCard
            title={view === 'host' ? 'Configuration Hôte' : 'Connexion Agent'}
            action={
                <button
                    onClick={() => setView('menu')}
                    className="text-muted hover:text-foreground text-xs"
                >
                    Retour
                </button>
            }
            contentClassName={'space-y-4'}
        >
                <form onSubmit={view === 'host' ? handleCreate : handleJoin} className="space-y-4">
                    <AlphaInput
                        required
                        label={'Identifiant'}
                        value={pseudo}
                        onChange={(e) => setPseudo(e.target.value)}
                        placeholder="Votre Pseudo"
                    />

                    {view === 'join' && (
                        <AlphaInput
                            required
                            label={"Code d'accès"}
                            value={code}
                            maxLength={4}
                            onChange={(e) => setCode(e.target.value.toUpperCase())}
                            placeholder="ABCD"
                        />
                    )}

                    <AlphaButton
                        disabled={isLoading}
                        className={'mx-auto'}
                        variant={'secondary'}
                        type={'submit'}
                    >
                        {isLoading
                            ? 'Initialisation...'
                            : view === 'host'
                              ? 'LANCER LE PROTOCOLE'
                              : 'CONNEXION'}
                    </AlphaButton>
                </form>
        </AlphaCard>
    );
};
