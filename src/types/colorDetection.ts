// src/types/colorDetection.ts

export interface RGB {
    r: number;
    g: number;
    b: number;
}

export interface ColorDefinition {
    id: string; // ex: 'cyan_neon'
    name: string; // ex: 'Cyan'
    displayHex: string; // pour l'UI (ex: '#00FFFF')
    match: (rgb: RGB) => boolean; // fonction qui décide si un pixel correspond
}

export interface DetectionResult {
    detectedId: string | null;
    debug: {
        scores: Record<string, number>; // score dynamique par ID
        rgbAverage: RGB;
        threshold: number;
        totalPixels: number;
    };
}

export interface ScanZoneSettings {
    size: number; // taille du carré en pixels
    yOffset?: number; // décalage vertical
    xOffset?: number; // décalage horizontal
}
