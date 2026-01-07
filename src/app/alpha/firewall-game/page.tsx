'use client';

import { AlphaButton } from '@/components/alpha/AlphaButton';
import { AlphaCard } from '@/components/alpha/AlphaCard';
import { AlphaGrid } from '@/components/alpha/AlphaGrid';
import { AlphaHeader } from '@/components/alpha/AlphaHeader';
import { useMicrophone } from '@/hooks/useMicrophone';
import { useOrientation } from '@/hooks/useOrientation';
import { useStability } from '@/hooks/useStability';

export default function MicrophoneDebug() {
    /* const { data, isCalibrated, permissionGranted, error, requestPermission, startCalibration } =
        useMicrophone(); */

    const { data: orientationData } = useOrientation();
    const { isStable, progress } = useStability(orientationData, {
        threshold: 2,
        requiredTime: 3000,
    });

    return (
        <>
            <AlphaHeader
                title="Pare-feu puzzle TESTs"
                subtitle="L'objectif est de maintenir le téléphone dans une position stable et de souffler dans le micro"
            />
            <AlphaCard title="Autorisation">
                <p className="mb-4 text-neutral-400">Activer les autorisations :)</p>
                <div className="px-10">
                    <div className="space-y-4">
                        {/* Visualisation des données brutes */}
                        <div className="text-xs text-green-800">
                            BETA: {orientationData.beta?.toFixed(2)} | GAMMA:{' '}
                            {orientationData.gamma?.toFixed(2)}
                        </div>

                        {/* État de stabilité */}
                        <div
                            className={`text-2xl font-bold ${isStable ? 'text-green-500' : 'animate-pulse text-red-500'}`}
                        >
                            STATUS: {isStable ? 'STABLE' : 'IMMOBILISATION...'}
                        </div>

                        {/* Barre de test Tailwind */}
                        <div className="relative h-8 w-full overflow-hidden rounded-none border border-green-900 bg-gray-900">
                            <div
                                className="h-full bg-green-500 transition-all duration-100 ease-linear"
                                style={{ width: `${progress}%` }}
                            />
                            <div className="absolute inset-0 flex items-center justify-center text-xs font-bold text-black">
                                {Math.floor(progress)}%
                            </div>
                        </div>

                        <p className="text-[10px] text-gray-500">
                            {progress === 0
                                ? 'Bougez pour tester le reset'
                                : 'Gardez cette position...'}
                        </p>
                    </div>
                </div>
            </AlphaCard>
        </>
    );
}
