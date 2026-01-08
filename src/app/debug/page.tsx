'use client';

import React, { useEffect, useState } from 'react';

import { ExclamationTriangleIcon, ShieldCheckIcon } from '@heroicons/react/24/solid';
import { AnimatePresence, motion } from 'framer-motion';

// --- Imports Composants Alpha ---
import AntivirusView from '@/components/Debug/AntivirusView';
import VirusView from '@/components/Debug/VirusView';
import { AlphaCard } from '@/components/alpha/AlphaCard';
import { AlphaCircularGauge } from '@/components/alpha/AlphaCircularGauge';
import { AlphaError } from '@/components/alpha/AlphaError';
import { AlphaPuzzleHeader } from '@/components/alpha/AlphaGameHeader';
import { AlphaInfoRow } from '@/components/alpha/AlphaInfoRow';
import { AlphaScanlines } from '@/components/alpha/AlphaScanlines';
// --- NOUVEAUX IMPORTS ---
import { AlphaSuccess } from '@/components/alpha/AlphaSuccess';
import { useDebogageGame } from '@/hooks/useDebogageGame';

export default function Debogage() {
    const { isSuccess, input, setInput, messages, hintLevel, handleVerify, handleHelp } =
        useDebogageGame();

    const [systemIntegrity, setSystemIntegrity] = useState(85);
    const [startLogTime, setStartLogTime] = useState<string | null>(null);

    useEffect(() => {
        // Fix: Use setTimeout to avoid "setState synchronously within an effect" lint error
        const timer = setTimeout(() => {
            setStartLogTime(new Date().toLocaleTimeString());
        }, 0);
        return () => clearTimeout(timer);
    }, []);

    useEffect(() => {
        if (!isSuccess) {
            const interval = setInterval(() => {
                setSystemIntegrity((prev) => Math.max(10, prev - Math.random() * 2));
            }, 2000);
            return () => clearInterval(interval);
        } else {
            // Fix: Use setTimeout to avoid "setState synchronously within an effect" lint error
            const timer = setTimeout(() => setSystemIntegrity(100), 0);
            return () => clearTimeout(timer);
        }
    }, [isSuccess]);

    return (
        <main
            className={`relative min-h-screen w-full overflow-x-hidden font-mono transition-colors duration-1000 ${
                isSuccess ? 'bg-[#0f172a]' : 'bg-[#050a05]'
            }`}
        >
            {/* --- FOND --- */}
            <div
                className={`pointer-events-none absolute inset-0 opacity-20 transition-colors duration-1000 ${isSuccess ? 'text-brand-blue' : 'text-brand-emerald'}`}
            >
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] bg-[size:40px_40px]"></div>
            </div>

            <AlphaScanlines />

            <AnimatePresence>
                {isSuccess && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: [0, 0.8, 0], backgroundColor: '#ffffff' }}
                        transition={{ duration: 0.8, ease: 'easeOut' }}
                        className="pointer-events-none fixed inset-0 z-50 mix-blend-overlay"
                    />
                )}
            </AnimatePresence>

            <div className="relative z-10 flex min-h-screen flex-col p-4 pb-10 md:p-8">
                {/* HEADER */}
                <AlphaPuzzleHeader
                    className="mb-4 md:mb-8"
                    left={
                        <div className="flex items-center gap-2 md:gap-3">
                            {isSuccess ? (
                                <ShieldCheckIcon className="text-brand-blue h-5 w-5 md:h-6 md:w-6" />
                            ) : (
                                <ExclamationTriangleIcon className="text-brand-error h-5 w-5 animate-pulse md:h-6 md:w-6" />
                            )}
                            <span
                                className={`text-sm font-bold tracking-widest md:text-lg ${isSuccess ? 'text-brand-blue' : 'text-brand-error'}`}
                            >
                                {isSuccess ? 'SYSTÈME SÉCURISÉ' : 'ALERTE INTRUSION'}
                            </span>
                        </div>
                    }
                    right={
                        <div className="hidden font-mono text-xs opacity-70 md:block">
                            SESSION_ID: <span className="text-white">XJ-904</span>
                        </div>
                    }
                />

                {/* --- MOBILE STATUS (Visible uniquement sur mobile) --- */}
                <div className="mx-auto mb-6 w-full max-w-lg space-y-4 lg:hidden">
                    {/* Intégration conditionnelle Mobile */}
                    {isSuccess ? (
                        <AlphaSuccess message="ANTIVIRUS : ACTIF" />
                    ) : (
                        <AlphaError message="MENACE DÉTECTÉE" />
                    )}

                    {!isSuccess && (
                        <div className="border-brand-error/30 bg-brand-error/20 h-1.5 w-full overflow-hidden rounded-full border">
                            <motion.div
                                className="bg-brand-error h-full shadow-[0_0_10px_currentColor]"
                                animate={{ width: `${systemIntegrity}%` }}
                                transition={{ type: 'tween', ease: 'linear' }}
                            />
                        </div>
                    )}
                </div>

                {/* GRID LAYOUT */}
                <div className="grid flex-1 grid-cols-1 items-center gap-6 lg:grid-cols-12 lg:items-start xl:items-center">
                    {/* GAUCHE : MONITORING & STATUS */}
                    <div className="hidden flex-col gap-4 opacity-80 lg:col-span-3 lg:flex">
                        {/* --- C'EST ICI QU'ON AFFICHE L'ÉTAT DU SYSTÈME --- */}
                        <div className="mb-2">
                            {isSuccess ? (
                                <AlphaSuccess message="ANTIVIRUS : ACTIF" />
                            ) : (
                                <AlphaError message="MENACE DÉTECTÉE" />
                            )}
                        </div>

                        <AlphaCard title="INTÉGRITÉ SYSTÈME">
                            <div className="flex justify-center py-4">
                                <AlphaCircularGauge
                                    value={systemIntegrity}
                                    max={100}
                                    size="h-32 w-32"
                                    variant={
                                        isSuccess
                                            ? 'default'
                                            : systemIntegrity < 40
                                              ? 'error'
                                              : 'warning'
                                    }
                                    showGlow={!isSuccess}
                                >
                                    <span className="text-xl font-bold">
                                        {Math.round(systemIntegrity)}%
                                    </span>
                                </AlphaCircularGauge>
                            </div>
                        </AlphaCard>
                        <AlphaCard title="RÉSEAU">
                            <div className="space-y-2">
                                <AlphaInfoRow label="LATENCE" value="12ms" />
                                <AlphaInfoRow
                                    label="ENCRYPTION"
                                    value={isSuccess ? 'AES-256' : 'COMPROMIS'}
                                    active={isSuccess}
                                />
                            </div>
                        </AlphaCard>
                    </div>

                    {/* CENTRE : JEU */}
                    <div className="flex w-full justify-center lg:col-span-6">
                        <AnimatePresence mode="wait">
                            {!isSuccess ? (
                                <VirusView
                                    key="virus"
                                    input={input}
                                    setInput={setInput}
                                    messages={messages}
                                    handleVerify={handleVerify}
                                    handleHelp={handleHelp}
                                    hintLevel={hintLevel}
                                />
                            ) : (
                                <AntivirusView key="antivirus" />
                            )}
                        </AnimatePresence>
                    </div>

                    {/* DROITE : LOGS */}
                    <div className="pointer-events-none hidden flex-col gap-4 opacity-60 lg:col-span-3 lg:flex">
                        <div className="text-brand-emerald/50 h-64 overflow-hidden rounded border border-white/10 bg-black/20 p-4 font-mono text-[10px] backdrop-blur-sm">
                            {startLogTime &&
                                [...Array(10)].map((_, i) => (
                                    <div key={i} className="mb-1">
                                        <span className="opacity-50">
                                            [{startLogTime}:{i * 12}]
                                        </span>{' '}
                                        Scanning ports... {isSuccess ? 'OK' : 'ERR_TIMEOUT'}
                                    </div>
                                ))}
                            {!isSuccess && (
                                <div className="text-brand-error animate-pulse">
                                    &gt;&gt; UNAUTHORIZED ACCESS DETECTED
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}
