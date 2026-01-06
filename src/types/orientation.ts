export type Direction = 'Haut' | 'Bas' | 'Gauche' | 'Droite' | 'Stable';

export interface OrientationData {
    alpha: number | null; // orientation relative z (0-360)
    beta: number | null; // inclinaison Avant/Arrière (-180 à 180)
    gamma: number | null; // inclinaison Gauche/Droite (-90 à 90)
    heading: number | null;
}

export interface OrientationState {
    data: OrientationData;
    error: string | null;
    permissionGranted: boolean;
    requestPermission: () => Promise<void>;
}
