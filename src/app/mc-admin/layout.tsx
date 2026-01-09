'use client';

import React, { useEffect, useState } from 'react';

import { ArrowRightStartOnRectangleIcon, LockClosedIcon } from '@heroicons/react/24/solid';

import ClientLayout from '@/app/ClientLayout';
import { AlphaButton } from '@/components/alpha/AlphaButton';
import { AlphaCard } from '@/components/alpha/AlphaCard';
import { AlphaError } from '@/components/alpha/AlphaError';
import { AlphaPuzzleHeader } from '@/components/alpha/AlphaGameHeader';
import { AlphaInput } from '@/components/alpha/AlphaInput';

const STORAGE_KEY = 'alpha_admin_session_token';
const SESSION_TOKEN = 'access_granted_alpha_protocol';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    const [pwd, setPwd] = useState('');
    const [error, setError] = useState(false);

    useEffect(() => {
        const storedToken = localStorage.getItem(STORAGE_KEY);
        if (storedToken === SESSION_TOKEN) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setIsAuthenticated(true);
        }
        setIsLoading(false);
    }, []);

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        if (pwd === process.env.NEXT_PUBLIC_ADMIN_PASSWORD) {
            localStorage.setItem(STORAGE_KEY, SESSION_TOKEN);
            setIsAuthenticated(true);
            setError(false);
        } else {
            setError(true);
        }
    };

    const handleLogout = () => {
        if (confirm('Déconnexion du système ?')) {
            localStorage.removeItem(STORAGE_KEY);
            setIsAuthenticated(false);
            setPwd('');
        }
    };

    if (isLoading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <div className="animate-pulse">Initialisation du protocole de sécurité...</div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return (
            <ClientLayout variant={'dark'}>
                <AlphaCard
                    title="Accès Sécurisé"
                    className="border-brand-error/50 shadow-brand-error/10 shadow-xl"
                    contentClassName={'space-y-6'}
                >
                    <div className="bg-brand-error/20 ring-brand-error/30 mx-auto w-max rounded-full p-6 ring-1">
                        <LockClosedIcon className="text-brand-error h-12 w-12" />
                    </div>
                    <form onSubmit={handleLogin}>
                        <label className="text-muted mb-2 block text-xs font-bold tracking-widest uppercase">
                            Clé de chiffrement
                        </label>
                        <AlphaInput
                            type="password"
                            value={pwd}
                            onChange={(e) => {
                                setPwd(e.target.value);
                                setError(false);
                            }}
                            variant={'error'}
                            autoFocus
                            placeholder="••••••••"
                        />
                    </form>

                    {error && <AlphaError message="Accès refusé. Identifiants invalides." />}

                    <AlphaButton onClick={handleLogin} variant="danger" fullWidth>
                        DÉVERROUILLER LE SYSTÈME
                    </AlphaButton>

                    <p className="text-muted text-center text-xs uppercase">
                        Système restreint • Accès autorisé uniquement
                    </p>
                </AlphaCard>
            </ClientLayout>
        );
    }

    return (
        <ClientLayout variant={'dark'}>
            <AlphaPuzzleHeader
                right={
                    <AlphaButton onClick={handleLogout} title="Se déconnecter" variant={'danger'}>
                        <ArrowRightStartOnRectangleIcon className="mr-2 h-4 w-4" />
                        LOGOUT
                    </AlphaButton>
                }
            />

            {children}
        </ClientLayout>
    );
}
