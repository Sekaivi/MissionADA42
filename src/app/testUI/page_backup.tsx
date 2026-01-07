"use client";

import { useCallback, useEffect, useRef, useState } from 'react';

import Link from 'next/link';

import { AlphaButton } from '@/components/alpha/AlphaButton';
import { AlphaCard } from '@/components/alpha/AlphaCard';
import { AlphaError } from '@/components/alpha/AlphaError';
import { AlphaGrid } from '@/components/alpha/AlphaGrid';
import { AlphaHeader } from '@/components/alpha/AlphaHeader';
import { AlphaPage } from '@/components/alpha/AlphaPage';
import { ModuleLink } from '@/components/alpha/ModuleLink';
import { SparklesIcon } from '@heroicons/react/24/outline';
import { useMicrophone } from '@/hooks/useMicrophone';


export default function testUI() {
    const {
        data,
        isCalibrated,
        permissionGranted,
        error,
        requestPermission,
        startCalibration
    } = useMicrophone();

    return (
        <AlphaPage>
            <AlphaHeader title="Refroidir le pare-feu" subtitle="Maintener le téléphone dans une position stable et soufflez dans votre micro afin de refroidir le pare-feu" />
            <AlphaError message={"test erreur :D"} />
            <AlphaGrid>
                <AlphaCard title="Refroidir le pare-feu">
                    <p className='"mb-6 text-neutral-400"'>Parefeu ici</p>
                    <AlphaButton onClick={() => { }}>Bouton test</AlphaButton>
                </AlphaCard>
                <AlphaCard title="ssection IDE ?">
                    <p className='"mb-6 text-neutral-400"'>Ide ici</p>
                    <AlphaError message={"more errors cuz why not mdr"} />
                </AlphaCard>
            </AlphaGrid>

            <AlphaHeader title="Debug Microphone" subtitle="Vérification des flux audio et calibration" />

            {!permissionGranted ? (
                <AlphaCard title="Autorisation">
                    <p className="mb-4 text-neutral-400">Le micro doit être activé pour lire les données.</p>
                    <AlphaButton onClick={requestPermission}>Activer le micro</AlphaButton>
                    {error && <p className="mt-2 text-red-500">{error}</p>}
                </AlphaCard>
            ) : (
                <AlphaGrid>
                    {/* Colonne 1 : Données Brutes */}
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
                                <span className={data.isBlowing ? "text-emerald-500 font-bold" : "text-red-500"}>
                                    {data.isBlowing ? "OUI" : "NON"}
                                </span>
                            </div>
                        </div>
                    </AlphaCard>

                    {/* Colonne 2 : Calibration */}
                    <AlphaCard title="Statut Calibration">
                        <div className="flex flex-col items-center gap-4">
                            <div className={`text-sm px-3 py-1 rounded border ${isCalibrated ? 'border-emerald-500 text-emerald-500' : 'border-orange-500 text-orange-500'}`}>
                                {isCalibrated ? "CALIBRÉ" : "NON CALIBRÉ / EN COURS"}
                            </div>

                            <AlphaButton variant="secondary" onClick={startCalibration}>
                                Relancer Calibration (3s)
                            </AlphaButton>

                            <p className="text-xs text-neutral-500 text-center">
                                Restez silencieux pendant la calibration pour fixer le seuil ambiant.
                            </p>
                        </div>
                    </AlphaCard>
                </AlphaGrid>
            )}

            {/* Visualiseur de volume simple */}
            {permissionGranted && (
                <AlphaCard title="Visualiseur">
                    <div className="w-full bg-neutral-800 h-4 rounded-full overflow-hidden">
                        <div
                            className="bg-emerald-500 h-full transition-all duration-75"
                            style={{ width: `${Math.min(data.volume * 2, 100)}%` }}
                        />
                    </div>
                </AlphaCard>
            )}

            <p>Futur lien de module (à laisser de coté)</p>
            <ModuleLink href={"#"} title={"Pare-feu"} subtitle={"subtitle hehe"} icon={SparklesIcon} isGame={true} />
        </AlphaPage>
    );
}