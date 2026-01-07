'use client';

import { useOrientation } from '@/hooks/useOrientation';
import { useMicrophone } from '@/hooks/useMicrophone';
import { useFirewallGame } from '@/hooks/useFirewallGame';

import { AlphaButton } from '@/components/alpha/AlphaButton';
import { AlphaCard } from '@/components/alpha/AlphaCard';
import { AlphaGrid } from '@/components/alpha/AlphaGrid';
import { AlphaHeader } from '@/components/alpha/AlphaHeader';

import { useState, useEffect } from 'react';

// --- PETITS COMPOSANTS SVG INTERNES (Pour remplacer Lucide) ---
const IconShield = () => (
    <svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
);

const IconWind = ({ active }: { active: boolean }) => (
    <svg className={active ? "animate-spin" : ""} viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
        <line x1="12" y1="2" x2="12" y2="6" /><line x1="12" y1="18" x2="12" y2="22" />
        <line x1="4.93" y1="4.93" x2="7.76" y2="7.76" /><line x1="16.24" y1="16.24" x2="19.07" y2="19.07" />
        <line x1="2" y1="12" x2="6" y2="12" /><line x1="18" y1="12" x2="22" y2="12" />
        <line x1="4.93" y1="19.07" x2="7.76" y2="16.24" /><line x1="16.24" y1="7.76" x2="19.07" y2="4.93" />
    </svg>
);

export default function FirewallGame() {
    const [isMounted, setIsMounted] = useState(false);
    const { data: orient, requestPermission: reqOrient, permissionGranted: pOrient } = useOrientation();
    const { data: mic, requestPermission: reqMic, startCalibration, isCalibrated, permissionGranted: pMic } = useMicrophone();

    const game = useFirewallGame(orient, { ...mic, isCalibrated });

    useEffect(() => setIsMounted(true), []);

    if (!isMounted) return <AlphaCard className="animate-pulse">SYNCHRONISATION...</AlphaCard>;

    const handleStart = async () => {
        await reqOrient();
        await reqMic();
        game.startSession();
    };

    return (
        <AlphaGrid>
            <AlphaCard title="CORE_THERMAL_MONITOR" className="relative overflow-hidden bg-black border-green-500/30">
                {/* Effet Scanlines */}
                <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%)] bg-[length:100%_4px]" />

                {!pOrient || !pMic ? (
                    <div className="flex flex-col items-center py-10 space-y-6 text-center">
                        <div className="text-red-500 animate-pulse">
                            <IconShield />
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-green-500 font-bold tracking-tighter text-xl">ACCÈS RESTREINT</h3>
                            <p className="text-green-800 text-xs font-mono max-w-[200px]">
                                CAPTEURS BIOMÉTRIQUES ET ACCÉLÉROMÈTRE REQUIS POUR STABILISATION
                            </p>
                        </div>
                        <AlphaButton onClick={handleStart}>
                            DÉVERROUILLER LES CAPTEURS
                        </AlphaButton>
                    </div>
                ) : (
                    <div className="space-y-6 font-mono">
                        {/* Barre de logs supérieure */}
                        <div className="flex justify-between text-[10px] text-green-500/50 uppercase tracking-widest border-b border-green-500/20 pb-2">
                            <span>POS: {orient.beta?.toFixed(0)},{orient.gamma?.toFixed(0)}</span>
                            <span className={isCalibrated ? "text-green-400" : "text-yellow-500 animate-pulse"}>
                                {isCalibrated ? "● MIC_LIVE" : "○ CALIBRATING..."}
                            </span>
                        </div>

                        {/* Thermal Core avec Shake Dynamique */}
                        <div className="relative flex flex-col items-center py-4">
                            <div
                                className="w-32 h-32 rounded-full border border-green-500/20 flex items-center justify-center relative"
                                style={{
                                    transform: game.temp > 100
                                        ? `translate(${(Math.random() - 0.5) * (game.temp / 25)}px, ${(Math.random() - 0.5) * (game.temp / 25)}px)`
                                        : 'none',
                                    boxShadow: `0 0 ${game.temp / 4}px ${game.temp > 200 ? 'rgba(239, 68, 68, 0.4)' : 'rgba(34, 197, 94, 0.2)'}`
                                }}
                            >
                                <div
                                    className="w-24 h-24 rounded-full transition-colors duration-700 flex flex-col items-center justify-center border-2 border-black/20 shadow-inner"
                                    style={{
                                        backgroundColor: game.temp > 200 ? '#dc2626' : '#16a34a',
                                        transform: game.temp > 300 ? `scale(${1 + Math.sin(Date.now() / 60) * 0.1})` : 'scale(1)'
                                    }}
                                >
                                    <span className="text-white font-black text-2xl tracking-tighter leading-none">
                                        {Math.floor(game.temp)}°
                                    </span>
                                    <span className="text-white/60 text-[8px] font-bold uppercase">Thermal</span>
                                </div>
                            </div>
                        </div>

                        {/* Moniteurs de Stabilité et Souffle */}
                        <div className="space-y-5 bg-green-500/5 p-3 border border-green-500/10 rounded">
                            {/* Stabilité */}
                            <div>
                                <div className="flex justify-between text-[10px] mb-1">
                                    <span className={game.isStable ? "text-green-400" : "text-red-500"}>
                                        {game.isStable ? "> STABLE_LINK_ESTABLISHED" : "> ERROR: DEVICE_STABILITY_LOST"}
                                    </span>
                                </div>
                                <div className="h-1.5 bg-neutral-900 rounded-full overflow-hidden border border-green-500/10">
                                    <div
                                        className="h-full bg-blue-500 transition-all duration-300"
                                        style={{ width: `${(game.stabilityProgress / 3000) * 100}%` }}
                                    />
                                </div>
                            </div>

                            {/* Souffle et Recalibration */}
                            <div className="flex justify-between items-center border-t border-green-500/10 pt-3">
                                <div className="flex items-center gap-2 text-xs">
                                    <div className={mic.isBlowing ? "text-blue-400" : "text-neutral-700"}>
                                        <IconWind active={mic.isBlowing} />
                                    </div>
                                    <span className={mic.isBlowing ? "text-blue-400" : "text-neutral-600"}>
                                        {mic.isBlowing ? "REFROIDISSEMENT ACTIF" : "ATTENTE_FLUX_AIR"}
                                    </span>
                                </div>
                                <button
                                    onClick={() => startCalibration()}
                                    className="text-[9px] px-2 py-1 border border-green-500/30 text-green-500/50 hover:bg-green-500 hover:text-black transition-all uppercase"
                                >
                                    Recalibrer
                                </button>
                            </div>
                        </div>

                        {/* Alertes et Victoire */}
                        {game.status === 'WIN' && (
                            <div className="bg-green-500 text-black font-black p-3 text-center border-2 border-white/20 animate-pulse">
                                CORE_STABILIZED // SYSTEM_READY
                            </div>
                        )}

                        {game.temp > 280 && game.status !== 'WIN' && (
                            <div className="text-red-500 font-bold text-[10px] text-center animate-[blink_0.3s_step-end_infinite]">
                                !!! WARNING: THERMAL_ESCAPE_VELOCITY_NEAR !!!
                            </div>
                        )}
                    </div>
                )}
            </AlphaCard>
            <div className="mt-4 p-2 bg-black border border-red-500 text-[10px] text-red-500 font-mono">
                DEBUG: <br />
                Stable: {game.isStable ? "OUI" : "NON"} ({Math.floor(game.stabilityProgress)}ms) <br />
                Souffle: {mic.isBlowing ? "ACTIF" : "OFF"} (Intensité: {mic.intensity.toFixed(1)}) <br />
                Micro Calibré: {mic.isCalibrated ? "OUI" : "NON"}
            </div>
        </AlphaGrid>
    );
}