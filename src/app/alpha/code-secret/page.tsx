'use client';

import { useState } from 'react';
import { CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/solid';

import { AlphaButton } from '@/components/alpha/AlphaButton';
import { AlphaCard } from '@/components/alpha/AlphaCard';
import { AlphaError } from '@/components/alpha/AlphaError';
import { AlphaGrid } from '@/components/alpha/AlphaGrid';
import { AlphaHeader } from '@/components/alpha/AlphaHeader';

export default function CodeSecret() {
    const CODE_SECRET = '1234';

    const [code, setCode] = useState('');
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    const [history, setHistory] = useState([]);

    const handleChange = (e) => {
        const value = e.target.value.replace(/\D/g, '');
        if (value.length <= 4) {
            setCode(value);
            setError(null);
        }
    };

    const handleSubmit = () => {
        const isValid = code === CODE_SECRET;

        setHistory((prev) => [
            ...prev,
            {
                value: code || '—',
                valid: isValid,
                timestamp: new Date().toLocaleTimeString(),
            },
        ]);

        if (isValid) {
            setSuccess(true);
            setError(null);
        } else {
            setError('Mot de passe erroné, accès interdit');
            setSuccess(false);
        }
    };

    return (
        <>
            <AlphaHeader
                title="Code secret"
                subtitle="Veuillez entrer le mot de passe administrateur"
            />

            <AlphaGrid>
                <AlphaCard title="Accès administrateur">
                    <div className="flex flex-col gap-4">
                        <input
                            type="text"
                            value={code}
                            onChange={handleChange}
                            maxLength={4}
                            placeholder="x x x x"
                            className="border border-white bg-transparent text-white text-center text-2xl tracking-widest py-2"
                        />

                        <AlphaButton onClick={handleSubmit}>
                            Valider
                        </AlphaButton>

                        <AlphaError message={error} />

                        {success && (
                            <div className="flex items-center gap-2 text-green-400">
                                <CheckCircleIcon className="h-6 w-6" />
                                <span className="font-bold">
                                    Accès autorisé — suite des énigmes débloquée
                                </span>
                            </div>
                        )}
                    </div>
                </AlphaCard>

                <AlphaCard title="Debug — Historique des tentatives">
                    <div className="flex flex-col gap-2 text-xs">
                        {history.length === 0 && (
                            <p className="opacity-50">Aucune tentative</p>
                        )}

                        {history.map((item, index) => (
                            <div
                                key={index}
                                className="flex items-center justify-between border-b border-white/10 pb-1"
                            >
                                <span>
                                    [{item.timestamp}] {item.value}
                                </span>

                                {item.valid ? (
                                    <CheckCircleIcon className="h-4 w-4 text-green-400" />
                                ) : (
                                    <XCircleIcon className="h-4 w-4 text-red-400" />
                                )}
                            </div>
                        ))}
                    </div>
                </AlphaCard>
            </AlphaGrid>
        </>
    );
}

