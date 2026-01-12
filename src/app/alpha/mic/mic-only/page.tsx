'use client';

import { AlphaButton } from '@/components/alpha/AlphaButton';
import { AlphaCard } from '@/components/alpha/AlphaCard';
import { AlphaGrid } from '@/components/alpha/AlphaGrid';
import { AlphaHeader } from '@/components/alpha/AlphaHeader';
import { useMicrophone } from '@/hooks/useMicrophone';

export default function MicrophoneDebug() {
    const { data, isCalibrated, permissionGranted, error, requestPermission, startCalibration } =
        useMicrophone();

    return (
        <>
            <AlphaHeader
                title="Debug Microphone"
                subtitle="Vérification des flux audio et calibration"
            />
            {!permissionGranted ? (
                <AlphaCard title="Autorisation">
                    <p className="mb-4 text-neutral-400">
                        Le micro doit être activé pour lire les données.
                    </p>
                    <AlphaButton onClick={requestPermission}>Activer le micro</AlphaButton>
                    {error && <p className="mt-2 text-red-500">{error}</p>}
                </AlphaCard>
            ) : (
                <AlphaGrid>
                    <AlphaCard title="Données en temps réel">
                        <div className="space-y-4 font-mono">
                            <div className="flex justify-between">
                                <span className="text-neutral-500">Volume :</span>
                                <span className="text-emerald-400">{data.volume.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-neutral-500">Intensité Souffle :</span>
                                <span className="text-blue-400">{data.intensity.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-neutral-500">Souffle détecté :</span>
                                <span
                                    className={
                                        data.isBlowing
                                            ? 'font-bold text-emerald-500'
                                            : 'text-red-500'
                                    }
                                >
                                    {data.isBlowing ? 'OUI' : 'NON'}
                                </span>
                            </div>
                        </div>
                    </AlphaCard>

                    <AlphaCard title="Statut Calibration">
                        <div className="flex flex-col items-center gap-4">
                            <div
                                className={`rounded border px-3 py-1 text-sm ${isCalibrated ? 'border-emerald-500 text-emerald-500' : 'border-orange-500 text-orange-500'}`}
                            >
                                {isCalibrated ? 'CALIBRÉ' : 'NON CALIBRÉ / EN COURS'}
                            </div>

                            <AlphaButton variant="secondary" onClick={startCalibration}>
                                Relancer Calibration (5s)
                            </AlphaButton>

                            <p className="text-center text-xs text-neutral-500">
                                Restez silencieux pendant la calibration pour fixer le seuil
                                ambiant.
                            </p>
                        </div>
                    </AlphaCard>
                </AlphaGrid>
            )}

            {permissionGranted && (
                <AlphaCard title="Visualiseur">
                    <div className="h-4 w-full overflow-hidden rounded-full bg-neutral-800">
                        <div
                            className="h-full bg-emerald-500 transition-all duration-75"
                            style={{ width: `${Math.min(data.volume * 2, 100)}%` }}
                        />
                    </div>
                </AlphaCard>
            )}
        </>
    );
}
