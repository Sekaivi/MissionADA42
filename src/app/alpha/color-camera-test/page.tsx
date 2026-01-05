'use client';

import { useMemo, useRef } from 'react';

import { AlphaCard } from '@/components/alpha/AlphaCard';
import { AlphaError } from '@/components/alpha/AlphaError';
import { AlphaGrid } from '@/components/alpha/AlphaGrid';
import { AlphaHeader } from '@/components/alpha/AlphaHeader';
import { AlphaVideoContainer } from '@/components/alpha/AlphaVideoContainer';
import { useCamera } from '@/hooks/useCamera';
import { useColorDetection } from '@/hooks/useColorDetection';
import { PRESETS } from '@/utils/colorPresets';

const ScoreBar = ({
    label,
    value,
    max,
    colorHex,
    isThresholdMet,
}: {
    label: string;
    value: number;
    max: number;
    colorHex: string;
    isThresholdMet: boolean;
}) => {
    const percent = Math.min(100, Math.max(0, (value / max) * 100));
    const displayColor = isThresholdMet ? colorHex : `${colorHex}40`;

    return (
        <div className="mb-3 last:mb-0">
            <div className="mb-1 flex justify-between font-mono text-xs">
                <span
                    style={{ color: displayColor }}
                    className="font-bold transition-colors duration-300"
                >
                    {label}
                </span>
                <span className="text-neutral-500">{Math.round(value)}</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-sm border border-neutral-700/50 bg-neutral-800">
                <div
                    className="h-full transition-all duration-200 ease-out"
                    style={{
                        width: `${percent}%`,
                        backgroundColor: displayColor,
                        boxShadow: isThresholdMet ? `0 0 10px ${colorHex}80` : 'none',
                    }}
                />
            </div>
        </div>
    );
};

export default function AlphaColorCameraTest() {
    const { videoRef, error } = useCamera();

    const debugCanvasRef = useRef<HTMLCanvasElement>(null);

    // on charge toutes les couleurs disponibles dans les presets
    const activePresets = useMemo(() => Object.values(PRESETS), []);
    const scanConfig = useMemo(
        () => ({
            size: 100,
            xOffset: -150,
            yOffset: 0,
        }),
        []
    );
    const { detectedId, debug: debugData } = useColorDetection(
        videoRef,
        activePresets,
        true,
        scanConfig,
        debugCanvasRef
    );

    // get le nom lisible de la couleur détectée (red -> rouge)
    const detectedPreset = activePresets.find((p) => p.id === detectedId);
    const detectedName = detectedPreset?.name;
    const detectedColorHex = detectedPreset?.displayHex;

    return (
        <>
            <AlphaHeader
                title="Détection Chromatique"
                subtitle="Analyse temps réel des canaux RGB et matching algorithmique."
            />

            <AlphaError message={error} />

            <AlphaGrid>
                {/* col 1 : visuel */}
                <div className="space-y-6">
                    <AlphaCard title="Scanner Optique">
                        <div className="space-y-4">
                            <AlphaVideoContainer scanSettings={scanConfig} label="COLOR SENSOR">
                                <video
                                    ref={videoRef}
                                    autoPlay
                                    playsInline
                                    muted
                                    className="h-full w-full object-cover opacity-90"
                                />

                                {detectedName && (
                                    <div
                                        className="pointer-events-none absolute inset-0 z-20 border-[6px] transition-colors duration-300"
                                        style={{ borderColor: detectedColorHex }}
                                    />
                                )}
                            </AlphaVideoContainer>

                            {/* résultat */}
                            <div className="flex rounded border border-neutral-800 bg-neutral-900 p-4 text-center">
                                <canvas
                                    ref={debugCanvasRef}
                                    className="pixelated h-auto max-h-[150px] w-auto"
                                />
                                <div className={'flex flex-1 flex-col justify-center'}>
                                    <p className="mb-1 text-xs tracking-widest text-neutral-500 uppercase">
                                        Cible verrouillée
                                    </p>
                                    <div
                                        className="text-4xl font-black tracking-wider transition-colors duration-300"
                                        style={{
                                            color: detectedColorHex || '#404040',
                                            textShadow: detectedColorHex
                                                ? `0 0 20px ${detectedColorHex}40`
                                                : 'none',
                                        }}
                                    >
                                        {detectedName || 'EN ATTENTE...'}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </AlphaCard>
                </div>

                {/* col 2 : data */}
                <div className="space-y-6">
                    {/* analyse RGB brute */}
                    <AlphaCard title="Calibration RGB (Luminosité)">
                        {!debugData ? (
                            <div className="animate-pulse text-sm text-yellow-500">
                                Initialisation...
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {/* Barres R G B */}
                                <div className="flex h-16 gap-2">
                                    <div className="group relative flex flex-1 flex-col items-center justify-end overflow-hidden rounded border border-red-900/50 bg-red-950/30 pb-2">
                                        <div
                                            className="absolute right-0 bottom-0 left-0 bg-red-600/20 transition-all duration-100"
                                            style={{
                                                height: `${(debugData.rgbAverage.r / 255) * 100}%`,
                                            }}
                                        />
                                        <span className="z-10 text-xs font-bold text-red-400">
                                            {debugData.rgbAverage.r}
                                        </span>
                                        <span className="z-10 text-[10px] text-red-900">R</span>
                                    </div>
                                    <div className="relative flex flex-1 flex-col items-center justify-end overflow-hidden rounded border border-green-900/50 bg-green-950/30 pb-2">
                                        <div
                                            className="absolute right-0 bottom-0 left-0 bg-green-600/20 transition-all duration-100"
                                            style={{
                                                height: `${(debugData.rgbAverage.g / 255) * 100}%`,
                                            }}
                                        />
                                        <span className="z-10 text-xs font-bold text-green-400">
                                            {debugData.rgbAverage.g}
                                        </span>
                                        <span className="z-10 text-[10px] text-green-900">G</span>
                                    </div>
                                    <div className="relative flex flex-1 flex-col items-center justify-end overflow-hidden rounded border border-blue-900/50 bg-blue-950/30 pb-2">
                                        <div
                                            className="absolute right-0 bottom-0 left-0 bg-blue-600/20 transition-all duration-100"
                                            style={{
                                                height: `${(debugData.rgbAverage.b / 255) * 100}%`,
                                            }}
                                        />
                                        <span className="z-10 text-xs font-bold text-blue-400">
                                            {debugData.rgbAverage.b}
                                        </span>
                                        <span className="z-10 text-[10px] text-blue-900">B</span>
                                    </div>
                                </div>

                                {/* aperçu couleur moyenne */}
                                <div className="flex items-center gap-3">
                                    <div
                                        className="h-12 w-12 rounded border border-white/10 shadow-inner"
                                        style={{
                                            backgroundColor: `rgb(${debugData.rgbAverage.r},${debugData.rgbAverage.g},${debugData.rgbAverage.b})`,
                                        }}
                                    />
                                    <p className="flex-1 text-xs leading-relaxed text-neutral-500">
                                        Moyenne calculée sur la zone centrale (100px²). <br />
                                        <span className="text-neutral-400">
                                            Seuil dynamique actuel :{' '}
                                            {Math.round(debugData.threshold)}px
                                        </span>
                                    </p>
                                </div>
                            </div>
                        )}
                    </AlphaCard>

                    {/* matching */}
                    <AlphaCard title="Algorithme de Matching">
                        {!debugData ? (
                            <div className="text-sm text-neutral-600">En attente de flux...</div>
                        ) : (
                            <div className="space-y-4">
                                {activePresets.map((preset) => {
                                    const score = debugData.scores[preset.id] || 0;
                                    const isThresholdMet = score > debugData.threshold;

                                    return (
                                        <ScoreBar
                                            key={preset.id}
                                            label={preset.name.toUpperCase()}
                                            value={score}
                                            max={debugData.totalPixels * 0.6}
                                            colorHex={preset.displayHex}
                                            isThresholdMet={isThresholdMet}
                                        />
                                    );
                                })}
                            </div>
                        )}
                    </AlphaCard>
                </div>
            </AlphaGrid>
        </>
    );
}
