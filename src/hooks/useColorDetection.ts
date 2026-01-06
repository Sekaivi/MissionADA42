'use client';

import { RefObject, useEffect, useState } from 'react';

import { ColorDefinition, DetectionResult, RGB, ScanZoneSettings } from '@/types/colorDetection';

const EMPTY_RESULT: DetectionResult = {
    detectedId: null,
    debug: {
        scores: {},
        rgbAverage: { r: 0, g: 0, b: 0 },
        threshold: 0,
        totalPixels: 0,
    },
};

function analyzeFrameGeneric(
    data: Uint8ClampedArray,
    definitions: ColorDefinition[]
): DetectionResult {
    // init scores dynamiques
    const scores: Record<string, number> = {};
    definitions.forEach((d) => (scores[d.id] = 0));

    let total_pixels = 0;
    let sum_r = 0,
        sum_g = 0,
        sum_b = 0;

    // loop pixels
    for (let i = 0; i < data.length; i += 16) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];

        // Filtre de luminosité : si pixel trop sombre, on skip
        if (r < 40 && g < 40 && b < 40) continue;

        total_pixels++;
        sum_r += r;
        sum_g += g;
        sum_b += b;

        const pixel: RGB = { r, g, b };

        // test de score du pixel pour toutes les définitions
        for (const def of definitions) {
            if (def.match(pixel)) {
                scores[def.id]++;
            }
        }
    }

    const threshold = total_pixels * 0.15; // 15% de l'image

    // trouver le gagnant : celui qui a le plus haut score et qui dépasse le seuil
    let winnerId: string | null = null;
    let maxScore = 0;

    for (const def of definitions) {
        const score = scores[def.id];
        if (score > threshold && score > maxScore) {
            maxScore = score;
            winnerId = def.id;
        }
    }

    return {
        detectedId: winnerId,
        debug: {
            scores,
            threshold,
            totalPixels: total_pixels,
            rgbAverage:
                total_pixels > 0
                    ? {
                          r: Math.round(sum_r / total_pixels),
                          g: Math.round(sum_g / total_pixels),
                          b: Math.round(sum_b / total_pixels),
                      }
                    : { r: 0, g: 0, b: 0 },
        },
    };
}

export function useColorDetection(
    videoRef: RefObject<HTMLVideoElement | null>,
    targetColors: ColorDefinition[],
    isActive: boolean = true,
    scanSettings: ScanZoneSettings = { size: 100, yOffset: 0, xOffset: 0 },
    debugCanvasRef?: RefObject<HTMLCanvasElement | null> // <--- NOUVEAU PARAMÈTRE
) {
    const [result, setResult] = useState<DetectionResult>(EMPTY_RESULT);

    useEffect(() => {
        if (!isActive || !videoRef.current || targetColors.length === 0) return;

        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d', { willReadFrequently: true });

        const history: string[] = [];
        const STABILITY_THRESHOLD = 4;

        const process = () => {
            const video = videoRef.current;
            if (!video || !ctx || video.readyState !== 4) return;

            // mise à l'échelle
            const sourceW = video.videoWidth;
            const sourceH = video.videoHeight;
            const displayW = video.clientWidth;
            const displayH = video.clientHeight;

            if (displayW === 0 || displayH === 0) return;

            // calcul du ratio (ex: 1920 / 400 = 4.8)
            const scaleX = sourceW / displayW;
            const scaleY = sourceH / displayH;

            // ajustement du canvas interne
            if (canvas.width !== sourceW) {
                canvas.width = sourceW;
                canvas.height = sourceH;
            }

            ctx.drawImage(video, 0, 0);

            // CALCUL DE LA ZONE AVEC LE SCALE
            // conversions pixels CSS en pixels caméra
            const realSize = scanSettings.size * scaleX;
            const realOffsetX = (scanSettings.xOffset || 0) * scaleX;
            const realOffsetY = (scanSettings.yOffset || 0) * scaleY;

            // coordonnées sur l'image source
            const startX = (sourceW - realSize) / 2 + realOffsetX;
            const startY = (sourceH - realSize) / 2 + realOffsetY;

            // sécurité pour ne pas sortir du cadre
            const safeX = Math.max(0, Math.min(startX, sourceW - realSize));
            const safeY = Math.max(0, Math.min(startY, sourceH - realSize));

            try {
                // extraction de l'image
                const frameData = ctx.getImageData(safeX, safeY, realSize, realSize);

                // VISUALISATION DEBUG
                // si canvas de debug fourni, on y place ce qu'on voit dedans
                if (debugCanvasRef && debugCanvasRef.current) {
                    const dbgCtx = debugCanvasRef.current.getContext('2d');
                    if (dbgCtx) {
                        // redimensionne le canvas de debug pour qu'il matche la zone
                        if (debugCanvasRef.current.width !== realSize) {
                            debugCanvasRef.current.width = realSize;
                            debugCanvasRef.current.height = realSize;
                        }
                        dbgCtx.putImageData(frameData, 0, 0);
                    }
                }

                const frameResult = analyzeFrameGeneric(frameData.data, targetColors);

                if (frameResult.detectedId) {
                    history.push(frameResult.detectedId);
                    if (history.length > STABILITY_THRESHOLD) history.shift();
                } else {
                    if (history.length > 0) history.pop();
                }
                const isStable =
                    history.length >= STABILITY_THRESHOLD && history.every((v) => v === history[0]);

                setResult({
                    ...frameResult,
                    detectedId: isStable ? history[0] : null,
                });
            } catch (e) {
                console.warn('Erreur zone hors limites', e);
            }
        };

        const intervalId = setInterval(process, 100);
        return () => clearInterval(intervalId);
    }, [isActive, videoRef, targetColors, scanSettings, debugCanvasRef]);

    return result;
}
