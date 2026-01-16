// src/app/alpha/sensors/shake-debug/page.tsx
'use client';

import { useCallback, useState } from 'react';

import {
    ArrowPathIcon,
    Cog6ToothIcon,
    HandRaisedIcon,
    SignalIcon,
} from '@heroicons/react/24/outline';

import { AlphaButton } from '@/components/alpha/AlphaButton';
import { AlphaCard } from '@/components/alpha/AlphaCard';
import { AlphaGrid } from '@/components/alpha/AlphaGrid';
import { AlphaHeader } from '@/components/alpha/AlphaHeader';
import { AlphaLogViewer } from '@/components/alpha/AlphaLogViewer';
import { AlphaRange } from '@/components/alpha/AlphaRange';
import { useShake } from '@/hooks/useShake';

export default function ShakeDebugPage() {
    const [threshold, setThreshold] = useState(20);
    const [timeoutVal, setTimeoutVal] = useState(1000);
    const [minShakes, setMinShakes] = useState(3);

    const [shakeCount, setShakeCount] = useState(0);
    const [lastShakeTime, setLastShakeTime] = useState<string>('--:--:--');
    const [isVisualFeedbackActive, setIsVisualFeedbackActive] = useState(false);
    const [logs, setLogs] = useState<string[]>([]);

    const onShake = useCallback(() => {
        const now = new Date();
        const timeString =
            now.toLocaleTimeString() + '.' + String(now.getMilliseconds()).padStart(3, '0');

        if (typeof navigator !== 'undefined' && navigator.vibrate) {
            navigator.vibrate([50, 50, 50]);
        }

        setIsVisualFeedbackActive(true);
        setTimeout(() => setIsVisualFeedbackActive(false), 300);

        setShakeCount((prev) => prev + 1);
        setLastShakeTime(timeString);
        setLogs((prev) => [`SHAKE DETECTED at ${timeString}`, ...prev]);
    }, []);

    const { requestPermission, permissionGranted } = useShake(onShake, {
        threshold,
        timeout: timeoutVal,
        minShakes,
    });

    return (
        <div className="space-y-6 pb-20">
            <AlphaHeader
                title="Capteur Accéléromètre"
                subtitle="Outil de calibration pour le geste 'Secouer'"
            />

            {/* permissions iOS */}
            {!permissionGranted && (
                <AlphaCard title="Autorisation Requise">
                    <div className="flex flex-col items-center gap-4 py-4 text-center">
                        <HandRaisedIcon className="text-brand-orange h-12 w-12 animate-pulse" />
                        <p className="text-muted max-w-sm">
                            iOS bloque l'accès aux capteurs par défaut. Cliquez ci-dessous pour
                            activer la détection.
                        </p>
                        <AlphaButton onClick={requestPermission} size="lg">
                            Autoriser l'accès
                        </AlphaButton>
                    </div>
                </AlphaCard>
            )}

            <AlphaGrid>
                {/* visualisation */}
                <AlphaCard title="État du Capteur">
                    <div className="flex h-full flex-col items-center justify-center gap-6 py-6">
                        <div
                            className={`flex h-36 w-36 items-center justify-center rounded-full border-4 transition-all duration-150 ${
                                isVisualFeedbackActive
                                    ? 'bg-brand-emerald border-border scale-110 shadow-[0_0_50px_var(--color-brand-emerald)]'
                                    : 'bg-surface border-border shadow-inner'
                            } `}
                        >
                            <div className="text-center">
                                <span
                                    className={`text-5xl font-bold ${isVisualFeedbackActive ? '' : 'text-muted'}`}
                                >
                                    {shakeCount}
                                </span>
                            </div>
                        </div>

                        <div className="space-y-1 text-center">
                            <p className="text-muted font-mono text-xs tracking-widest uppercase">
                                Dernière détection
                            </p>
                            <p className="bg-surface rounded px-3 py-1 font-mono text-lg">
                                {lastShakeTime}
                            </p>
                        </div>
                    </div>
                </AlphaCard>

                {/* settings */}
                <AlphaCard title="Calibration">
                    <div className="space-y-6 pt-2">
                        <AlphaRange
                            label="Force (Threshold)"
                            value={threshold}
                            onChange={setThreshold}
                            min={10}
                            max={60}
                            icon={SignalIcon}
                            color="brand-orange"
                            description={
                                <>
                                    Intensité du mouvement. <br />
                                    <span className="text-brand-emerald">~15-20</span> : Standard.{' '}
                                    <br />
                                    <span className="text-brand-orange">40+</span> : Violent.
                                </>
                            }
                        />

                        <AlphaRange
                            label="Répétitions (Min Shakes)"
                            value={minShakes}
                            onChange={setMinShakes}
                            min={1}
                            max={6}
                            icon={Cog6ToothIcon}
                            color="brand-purple"
                            description={
                                <>
                                    Aller-retours nécessaires. <br />
                                    <span className="text-brand-error">1</span> : Déclenche au choc
                                    (Table). <br />
                                    <span className="text-brand-emerald">3+</span> : Déclenche au
                                    secouage.
                                </>
                            }
                        />

                        <AlphaRange
                            label="Cooldown (Timeout)"
                            value={timeoutVal}
                            onChange={setTimeoutVal}
                            min={500}
                            max={3000}
                            step={100}
                            unit="ms"
                            icon={ArrowPathIcon}
                            color="brand-blue"
                            description="Temps d'attente minimum entre deux validations."
                        />
                    </div>
                </AlphaCard>
            </AlphaGrid>

            {/* logs */}
            <AlphaCard title="Logs Système">
                <AlphaLogViewer
                    logs={logs}
                    onClear={() => {
                        setLogs([]);
                        setShakeCount(0);
                    }}
                    emptyMessage="En attente de mouvement... Secouez l'appareil !"
                />
            </AlphaCard>
        </div>
    );
}
