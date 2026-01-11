'use client';
import React, { useMemo, useRef } from 'react';

import clsx from 'clsx';

import { AlphaCard } from '@/components/alpha/AlphaCard';
import { AlphaError } from '@/components/alpha/AlphaError';
import AlphaFeedbackPill from '@/components/alpha/AlphaFeedbackPill';
import { AlphaGrid } from '@/components/alpha/AlphaGrid';
import { AlphaHeader } from '@/components/alpha/AlphaHeader';
import { AlphaVideoContainer } from '@/components/alpha/AlphaVideoContainer';
import { useCamera } from '@/hooks/useCamera';
import { useColorDetection } from '@/hooks/useColorDetection';
import { ColorDefinition } from '@/types/colorDetection';
import { PRESETS } from '@/utils/colorPresets';

interface DebugData {
    rgbAverage: { r: number; g: number; b: number };
    scores: Record<string, number>;
    threshold: number;
    totalPixels: number;
}

// interface barre de score de matching
interface ScoreBarProps {
    label: string;
    value: number;
    max: number;
    colorHex: string;
    isThresholdMet: boolean;
}

const ScoreBar: React.FC<ScoreBarProps> = ({ label, value, max, colorHex, isThresholdMet }) => {
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
                <span className="text-muted">{Math.round(value)}</span>
            </div>
            <div className="border-border bg-surface-highlight h-2 w-full overflow-hidden rounded-sm border">
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

// interface barre RGB
interface RGBBarProps {
    channel: 'r' | 'g' | 'b';
    value: number;
}

const RGB_CONFIG = {
    r: {
        label: 'R',
        text: 'text-red-400',
        border: 'border-red-900/50',
        bg: 'bg-red-950/30',
        bar: 'bg-red-600/20',
        sub: 'text-red-900',
    },
    g: {
        label: 'G',
        text: 'text-green-400',
        border: 'border-green-900/50',
        bg: 'bg-green-950/30',
        bar: 'bg-green-600/20',
        sub: 'text-green-900',
    },
    b: {
        label: 'B',
        text: 'text-blue-400',
        border: 'border-blue-900/50',
        bg: 'bg-blue-950/30',
        bar: 'bg-blue-600/20',
        sub: 'text-blue-900',
    },
};

const RGBBar: React.FC<RGBBarProps> = ({ channel, value }) => {
    const theme = RGB_CONFIG[channel];

    return (
        <div
            className={clsx(
                'group relative flex flex-1 flex-col items-center justify-end overflow-hidden rounded border pb-2',
                theme.border,
                theme.bg
            )}
        >
            <div
                className={clsx(
                    'absolute right-0 bottom-0 left-0 transition-all duration-100',
                    theme.bar
                )}
                style={{ height: `${(value / 255) * 100}%` }}
            />
            <span className={clsx('z-10 text-xs font-bold', theme.text)}>{value}</span>
            <span className={clsx('z-10 text-[10px]', theme.sub)}>{theme.label}</span>
        </div>
    );
};

// interface section scanner
interface ScannerSectionProps {
    videoRef: React.RefObject<HTMLVideoElement | null>;
    canvasRef: React.RefObject<HTMLCanvasElement | null>;
    scanConfig: { size: number; xOffset: number; yOffset: number };
    detectedName?: string;
    detectedColorHex?: string;
}

const ScannerSection: React.FC<ScannerSectionProps> = ({
    videoRef,
    canvasRef,
    scanConfig,
    detectedName,
    detectedColorHex,
}) => (
    <div className="space-y-6">
        <AlphaCard title="Scanner Optique" contentClassName="space-y-4">
            <AlphaVideoContainer scanSettings={scanConfig} label="COLOR SENSOR" videoRef={videoRef}>
                {detectedName && (
                    <div
                        className="pointer-events-none absolute inset-0 z-20 border-[6px] transition-colors duration-300"
                        style={{ borderColor: detectedColorHex }}
                    />
                )}
            </AlphaVideoContainer>

            <div className="border-border bg-background flex flex-wrap gap-4 rounded border p-4 text-center">
                <canvas ref={canvasRef} className="pixelated mx-auto h-auto max-h-[150px] w-auto" />
                <div className="flex flex-1 flex-col justify-center">
                    <AlphaFeedbackPill
                        message={detectedName ? 'Cible verrouillée' : 'Analyse en cours...'}
                        type={detectedName ? 'success' : 'info'}
                        isLoading={!detectedName}
                    />
                    {detectedName && (
                        <div
                            className="text-4xl font-black tracking-wider transition-colors duration-300"
                            style={{
                                color: detectedColorHex,
                                textShadow: detectedColorHex
                                    ? `0 0 20px ${detectedColorHex}40`
                                    : 'none',
                            }}
                        >
                            {detectedName}
                        </div>
                    )}
                </div>
            </div>
        </AlphaCard>
    </div>
);

// section analyse rgb
const RGBAnalysisSection: React.FC<{ debugData: DebugData | null }> = ({ debugData }) => (
    <AlphaCard title="Calibration RGB (Luminosité)">
        {!debugData ? (
            <AlphaFeedbackPill message="Initialisation..." isLoading />
        ) : (
            <div className="space-y-4">
                <div className="flex h-16 gap-2">
                    <RGBBar channel="r" value={debugData.rgbAverage.r} />
                    <RGBBar channel="g" value={debugData.rgbAverage.g} />
                    <RGBBar channel="b" value={debugData.rgbAverage.b} />
                </div>

                <div className="flex items-center gap-3">
                    <div
                        className="border-border h-12 w-12 rounded border shadow-inner"
                        style={{
                            backgroundColor: `rgb(${debugData.rgbAverage.r},${debugData.rgbAverage.g},${debugData.rgbAverage.b})`,
                        }}
                    />
                    <p className="text-muted flex-1 text-xs leading-relaxed">
                        Moyenne calculée sur la zone centrale (100px²). <br />
                        <span className="text-foreground/70">
                            Seuil dynamique actuel : {Math.round(debugData.threshold)}px
                        </span>
                    </p>
                </div>
            </div>
        )}
    </AlphaCard>
);

// interface section matching
interface MatchingSectionProps {
    debugData: DebugData | null;
    activePresets: ColorDefinition[];
}

const MatchingSection: React.FC<MatchingSectionProps> = ({ debugData, activePresets }) => (
    <AlphaCard title="Algorithme de Matching">
        {!debugData ? (
            <div className="text-muted text-sm">En attente de flux...</div>
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
);

export default function AlphaColorCameraTest() {
    const { videoRef, error } = useCamera();
    const debugCanvasRef = useRef<HTMLCanvasElement>(null);

    const activePresets = useMemo(() => Object.values(PRESETS), []);
    const scanConfig = useMemo(() => ({ size: 100, xOffset: 0, yOffset: 0 }), []);

    const { detectedId, debug: debugData } = useColorDetection(
        videoRef,
        activePresets,
        true,
        scanConfig,
        debugCanvasRef
    );

    const detectedPreset = activePresets.find((p) => p.id === detectedId);

    return (
        <>
            <AlphaHeader
                title="Détection Chromatique"
                subtitle="Analyse temps réel des canaux RGB et matching algorithmique."
            />

            <AlphaError message={error} />

            <AlphaGrid>
                {/* col 1 : visuel */}
                <ScannerSection
                    videoRef={videoRef}
                    canvasRef={debugCanvasRef}
                    scanConfig={scanConfig}
                    detectedName={detectedPreset?.name}
                    detectedColorHex={detectedPreset?.displayHex}
                />

                {/* col 2 : data */}
                <div className="space-y-6">
                    <RGBAnalysisSection debugData={debugData} />
                    <MatchingSection debugData={debugData} activePresets={activePresets} />
                </div>
            </AlphaGrid>
        </>
    );
}
