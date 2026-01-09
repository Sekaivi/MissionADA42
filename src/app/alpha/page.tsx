'use client';

import React, { useMemo } from 'react';

import {
    ArrowPathIcon,
    CameraIcon,
    ChatBubbleLeftIcon,
    CubeTransparentIcon,
    DevicePhoneMobileIcon,
    EyeIcon,
    GlobeAltIcon,
    LockOpenIcon,
    PencilIcon,
    PhotoIcon,
    PuzzlePieceIcon,
    QuestionMarkCircleIcon,
    ShieldCheckIcon,
    SquaresPlusIcon,
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
        title: 'Caméra',
        icon: CameraIcon,
        headerColor: 'text-brand-blue',
        items: [
            {
                href: '/alpha/camera/camera-only',
                title: 'Accès au flux vidéo brut',
                subtitle: 'Valide, construit sur des composants et hooks réutilisables',
                icon: VideoCameraIcon,
            },
            {
                href: '/alpha/camera/color-camera-test',
                title: 'Analyse colorimétrique RGB',
                subtitle: 'Interface de debug valide',
                icon: EyeIcon,
            },
            {
                href: '/alpha/camera/face-detector',
                title: 'Module de reconnaissance faciale',
                subtitle: 'Basé sur le composant FaceDetectionModule valide',
                icon: EyeIcon,
            },
            {
                href: '/alpha/camera/chromatic-puzzle-page',
                title: 'Jeu de mémorisation de couleurs',
                subtitle: 'Basé sur le composant ChromaticPuzzle valide',
                icon: SwatchIcon,
                isGame: true,
            },
        ],
    },
    {
        title: 'Capteurs de mouvement',
        icon: DevicePhoneMobileIcon,
        headerColor: 'text-brand-purple',
        items: [
            {
                href: '/alpha/sensors/orientation',
                title: 'Calibrage gyroscopique',
                subtitle: 'Valide, construit sur des composants et hooks réutilisables',
                icon: CubeTransparentIcon,
            },
            {
                href: '/alpha/sensors/orientation-game',
                title: "Jeu d'inclinaison",
                subtitle: 'Basé sur le composant OrientationPuzzle valide',
                icon: DevicePhoneMobileIcon,
                isGame: true,
            },
            {
                href: '/alpha/sensors/spin-puzzle-page',
                title: 'Jeu de rotation',
                subtitle: 'Basé sur le composant SpinPuzzle valide',
                icon: ArrowPathIcon,
                isGame: true,
            },
            {
                href: '/alpha/sensors/coding-puzzle-page',
                title: 'Jeu de code',
                subtitle: 'Basé sur le composant CodingPuzzle valide',
                icon: PuzzlePieceIcon,
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
                href: '/alpha/dialogue-test',
                title: 'Dialogues',
                subtitle: 'Test du hook de dialogues',
                icon: ChatBubbleLeftIcon,
            },
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

    {
        title: 'Quiz',
        icon: QuestionMarkCircleIcon,
        headerColor: 'text-brand-orange',
        items: [
            {
                href: '/alpha/quiz/qcm',
                title: 'QCM à la suite',
                subtitle: 'Basé sur le composant QuizGame valide, qcm customisable',
                icon: SquaresPlusIcon,
                isGame: true,
            },
            {
                href: '/alpha/quiz/text',
                title: 'Réponse textuelle requise',
                subtitle: 'Basé sur le composant QuizGame valide, customisable',
                icon: PencilIcon,
                isGame: true,
            },
            {
                href: '/alpha/quiz/trueFalse',
                title: 'Vrai ou faux',
                subtitle: 'Basé sur le composant QuizGame valide, customisable',
                icon: ShieldCheckIcon,
                isGame: true,
            },
            {
                href: '/alpha/quiz/rebuildPuzzle',
                title: "Reconstitution d'image",
                subtitle: 'Basé sur le composant RebuildPuzzle valide, customisable',
                icon: PhotoIcon,
                isGame: true,
            },
            {
                href: '/alpha/quiz/code-secret',
                title: 'Code secret',
                subtitle: 'Basé sur le composant QuizGame valide, customisable',
                icon: LockOpenIcon,
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
