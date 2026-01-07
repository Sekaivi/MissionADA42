'use client';

import React, { useMemo } from 'react';

import {
    ArrowPathIcon,
    CameraIcon,
    CubeTransparentIcon,
    DevicePhoneMobileIcon,
    EyeIcon,
    GlobeAltIcon,
    PuzzlePieceIcon,
    SwatchIcon,
    UserGroupIcon,
    VideoCameraIcon,
} from '@heroicons/react/24/outline';

import { AlphaCard } from '@/components/alpha/AlphaCard';
import { AlphaGrid } from '@/components/alpha/AlphaGrid';
import { AlphaHeader } from '@/components/alpha/AlphaHeader';
import { ModuleLink } from '@/components/alpha/ModuleLink';
import { ModuleGroup } from '@/types/alpha/module';

const ALPHA_MODULES: ModuleGroup[] = [
    {
        title: 'Systèmes de Vision',
        icon: CameraIcon,
        headerColor: 'text-brand-blue',
        items: [
            {
                href: '/alpha/camera-only',
                title: 'Flux Vidéo Brut',
                subtitle: "Test d'accès matériel & snapshot",
                icon: VideoCameraIcon,
            },
            {
                href: '/alpha/color-camera-test',
                title: 'Analyse Colorimétrique',
                subtitle: 'Algorithme de détection RGB',
                icon: EyeIcon,
            },
            {
                href: '/alpha/color-game',
                title: 'Protocole Chromatique',
                subtitle: 'Jeu de mémorisation visuelle',
                icon: SwatchIcon,
                isGame: true,
            },
            {
                href: '/alpha/camera-face-detector',
                title: 'Détection de Visage',
                subtitle: 'Jeu de reconnaissance faciale',
                icon: EyeIcon,
                isGame: true,
            },
        ],
    },
    {
        title: 'Capteurs de Mouvement',
        icon: DevicePhoneMobileIcon,
        headerColor: 'text-brand-purple',
        items: [
            {
                href: '/alpha/orientation-debug',
                title: 'Calibrage Gyroscopique',
                subtitle: 'Visualisation 3D temps réel',
                icon: CubeTransparentIcon,
            },
            {
                href: '/alpha/orientation-game',
                title: "Séquenceur d'Orientation",
                subtitle: "Jeu d'inclinaison (Tilt)",
                icon: DevicePhoneMobileIcon,
                isGame: true,
            },
            {
                href: '/alpha/spin-game',
                title: 'Module de Rotation',
                subtitle: 'Jeu de rotation 360° (Spin)',
                icon: ArrowPathIcon,
                isGame: true,
            },
            {
                href: '/alpha/spin-game-test',
                title: 'Module de Rotation Dialogué',
                subtitle: 'Jeu de rotation 360° (Spin)',
                icon: ArrowPathIcon,
                isGame: true,
            },
        ],
    },
    {
        title: 'Partie et synchronisation',
        icon: GlobeAltIcon,
        headerColor: 'text-brand-error',
        items: [
            {
                href: '/alpha/game-sync-test',
                title: 'Lancer une partie synchronisée',
                subtitle: "Test pour créer et modifier les informations d'une partie",
                icon: UserGroupIcon,
            },
            {
                href: '/alpha/escape-game-test',
                title: 'Lancer un escape game',
                subtitle: "Tester une configuration d'escape game réel",
                icon: PuzzlePieceIcon,
                isGame: true,
            },
        ],
    },
];

export default function AlphaHome() {
    const appVersion = process.env.NEXT_PUBLIC_APP_VERSION || 'DEV';

    const stats = useMemo(() => {
        const allItems = ALPHA_MODULES.flatMap((group) => group.items);
        return {
            totalModules: allItems.length,
            totalGames: allItems.filter((item) => item.isGame).length,
            categories: ALPHA_MODULES.length,
        };
    }, []);

    return (
        <>
            <AlphaHeader
                title="Alpha Dashboard"
                subtitle="Centre de test des modules expérimentaux"
            />

            <AlphaGrid>
                {ALPHA_MODULES.map((group, groupIndex) => (
                    <section key={groupIndex} className="space-y-6">
                        <h2
                            className={`flex items-center gap-2 text-xl font-bold ${group.headerColor}`}
                        >
                            <group.icon className="h-6 w-6" />
                            {group.title}
                        </h2>

                        <div className="grid gap-4">
                            {group.items.map((item, itemIndex) => (
                                <ModuleLink key={itemIndex} {...item} />
                            ))}
                        </div>
                    </section>
                ))}

                <div className="col-span-1 lg:col-span-2">
                    <AlphaCard title="État du Système">
                        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                            {/* stat 1 : version */}
                            <div className="border-border bg-background rounded border p-3 text-center">
                                <div className="text-foreground text-2xl font-bold">
                                    v{appVersion}
                                </div>
                                <div className="text-muted text-xs">Version Alpha</div>
                            </div>

                            {/* stat 2 : tech */}
                            <div className="border-border bg-background rounded border p-3 text-center">
                                <div className="text-brand-emerald text-2xl font-bold">Actif</div>
                                <div className="text-muted text-xs">Next hooks</div>
                            </div>

                            {/* stat 3 : nb jeux */}
                            <div className="border-border bg-background rounded border p-3 text-center">
                                <div className="text-brand-blue text-2xl font-bold">
                                    {stats.totalGames}
                                </div>
                                <div className="text-muted text-xs">Modules jouables</div>
                            </div>

                            {/* stat 4 : total */}
                            <div className="border-border bg-background rounded border p-3 text-center">
                                <div className="text-brand-purple text-2xl font-bold">
                                    {stats.totalModules}
                                </div>
                                <div className="text-muted text-xs">Modules Total</div>
                            </div>
                        </div>
                    </AlphaCard>
                </div>
            </AlphaGrid>
        </>
    );
}
