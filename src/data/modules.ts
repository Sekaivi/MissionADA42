// src/data/modules.ts
import React from 'react';

import {
    ArrowsRightLeftIcon,
    MicrophoneIcon,
    QrCodeIcon,
    SwatchIcon,
    VideoCameraIcon,
} from '@heroicons/react/24/outline';

export type ModuleId =
    | 'facial_recognition'
    | 'color_scanner'
    | 'qr_scanner'
    | 'gyroscope'
    | 'microphone';

export interface ModuleConfig {
    id: ModuleId;
    label: string;
    icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
    description: string;
    permissionType?: 'camera' | 'microphone' | 'sensor';
}

export const MODULES: ModuleConfig[] = [
    {
        id: 'facial_recognition',
        label: 'Reconnaissance Faciale',
        icon: VideoCameraIcon,
        description: 'Analyse biométrique via la caméra frontale.',
        permissionType: 'camera',
    },
    {
        id: 'color_scanner',
        label: 'Scanner de couleur',
        icon: SwatchIcon,
        description: "Analyse colorimétrique de l'environnement.",
        permissionType: 'camera',
    },
    {
        id: 'qr_scanner',
        label: 'QR Scanneur',
        icon: QrCodeIcon,
        description: 'Lecture de données cryptées.',
        permissionType: 'camera',
    },
    {
        id: 'gyroscope',
        label: 'Calibrage Gyroscopique',
        icon: ArrowsRightLeftIcon,
        description: "Analyse gyroscopique de l'appareil.",
        permissionType: 'sensor',
    },
    {
        id: 'microphone',
        label: 'Capteur Micro',
        icon: MicrophoneIcon,
        description: 'Capteur de fréquences et décibels.',
        permissionType: 'microphone',
    },
];
