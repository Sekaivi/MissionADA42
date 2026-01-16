'use client';

import React, { useEffect, useMemo, useState } from 'react';

import { HandRaisedIcon } from '@heroicons/react/24/outline';

import Homepage from '@/app/home/page';
import { ModuleTestModal } from '@/app/test/ModuleTestModal';
import DebugPage, { DebugTab } from '@/app/test/debug';
import { AlphaButton } from '@/components/alpha/AlphaButton';
import { AlphaModal } from '@/components/alpha/AlphaModal';
import { DialogueBox } from '@/components/dialogueBox';
import { PuzzlePhases } from '@/components/puzzles/PuzzleRegistry';
import { CHARACTERS } from '@/data/characters';
import { ModuleId } from '@/data/modules';
import { useGameScenario, useScenarioTransition } from '@/hooks/useGameScenario';
import { useShake } from '@/hooks/useShake';
import { DialogueLine } from '@/types/dialogue';
import { say } from '@/utils/dialogueUtils';

export type GamePhases =
    | PuzzlePhases
    | 'intro'
    // intro nav Debug
    | 'debug_start'
    | 'debug_pres_home'
    | 'debug_pres_evidence'
    | 'debug_pres_modules'
    | 'debug_go_to_modules'
    // tuto modules
    | 'tuto_face_id'
    | 'tuto_color'
    | 'tuto_qr'
    | 'tuto_gyro'
    | 'tuto_mic'
    // fin
    | 'debug_all_validated';

const SCRIPTS: Partial<Record<GamePhases, DialogueLine[]>> = {
    intro: [
        say(CHARACTERS.fabien, 'Ah, bonjour à tous, ça fait plaisir de vous voir.'),
        say(
            CHARACTERS.goguey,
            "Parfois, il faudra utiliser l'interface debug. Secoue ton téléphone !"
        ),
    ],

    // intro nav debug
    debug_start: [
        say(
            CHARACTERS.goguey,
            "Bienvenue dans le Debugger. C'est ici que tu pourras accéder aux systèmes cachés."
        ),
    ],
    debug_pres_home: [
        say(
            CHARACTERS.goguey,
            "L'onglet TERMINAL affichera les logs systèmes et les messages interceptés."
        ),
    ],
    debug_pres_evidence: [
        say(
            CHARACTERS.goguey,
            "L'onglet PREUVES stockera les indices que tu trouveras sur le malfaiteur."
        ),
    ],
    debug_pres_modules: [
        say(
            CHARACTERS.goguey,
            "L'onglet MODULES permet d'activer et calibrer les différents capteurs du téléphone."
        ),
    ],
    debug_go_to_modules: [
        say(
            CHARACTERS.goguey,
            "Pour commencer l'enquête, nous devons vérifier ton matériel. Rends-toi dans MODULES."
        ),
    ],

    // tuto modules
    tuto_face_id: [say(CHARACTERS.paj, 'Premier test : La reconnaissance faciale. Clique dessus.')],
    tuto_color: [say(CHARACTERS.paj, 'Bien. Maintenant, le scanner de couleur.')],
    tuto_qr: [say(CHARACTERS.paj, 'Ensuite, le Décodeur QR. Indispensable.')],
    tuto_gyro: [say(CHARACTERS.paj, 'Calibrons le Gyroscope.')],
    tuto_mic: [say(CHARACTERS.paj, "Enfin, le Micro. On a besoin d'oreilles partout.")],
    debug_all_validated: [
        say(CHARACTERS.fabien, 'Parfait ! Tous les systèmes sont opérationnels.'),
        say(CHARACTERS.fabien, "L'escape game commence vraiment maintenant. Bonne chance !"),
    ],
};

export default function Game() {
    const [isAlternateView, setIsAlternateView] = useState(false);
    const [isIntroFinished, setIsIntroFinished] = useState(false);
    const [hasDiscoveredDebug, setHasDiscoveredDebug] = useState(false);
    const [showPermissionModal, setShowPermissionModal] = useState(false);

    const [currentTab, setCurrentTab] = useState<DebugTab>('home'); // démarrage sur Home
    const [validatedModules, setValidatedModules] = useState<ModuleId[]>([]);
    const [testingModule, setTestingModule] = useState<ModuleId | null>(null);

    const { gameState, isDialogueOpen, currentScript, triggerPhase, onDialogueComplete } =
        useGameScenario<GamePhases>(SCRIPTS);

    const { requestPermission, permissionGranted } = useShake(
        () => {
            // ignore les secousses tant que l'intro n'est pas finie
            if (!isIntroFinished) return;

            if (navigator.vibrate) navigator.vibrate(200);

            // bascule de l'interface
            const nextIsAlternateView = !isAlternateView;
            setIsAlternateView(nextIsAlternateView);

            // trigger la phase que si on passe en mode Debug pour la première fois
            if (nextIsAlternateView && !hasDiscoveredDebug) {
                triggerPhase('debug_start');
                setHasDiscoveredDebug(true);
            }
        },
        { threshold: 20, minShakes: 4, timeout: 1000 }
    );

    const handlePermissionRequest = async () => {
        await requestPermission();
        setShowPermissionModal(false);
    };

    useScenarioTransition(gameState, isDialogueOpen, {
        idle: () => triggerPhase('intro'),
        intro: () => {
            setIsIntroFinished(true);
            if (!permissionGranted) setShowPermissionModal(true);
        },

        debug_start: () => triggerPhase('debug_pres_home'),
        debug_pres_home: () => triggerPhase('debug_pres_evidence'),
        debug_pres_evidence: () => triggerPhase('debug_pres_modules'),
        debug_pres_modules: () => triggerPhase('debug_go_to_modules'),
        debug_go_to_modules: () => {
            // si le joueur a déjà cliqué sur 'modules' pendant qu'on parlait, on enchaine
            if (currentTab === 'modules') triggerPhase('tuto_face_id');
        },
    });

    useEffect(() => {
        if (!isAlternateView || !hasDiscoveredDebug) return;

        // ne lance les tutos de module que si le joueur a fini la présentation de la nav
        // => si on a dépassé l'étape 'debug_go_to_modules' ou qu'on est dedans
        const isTutorialReady =
            validatedModules.length > 0 ||
            gameState === 'debug_go_to_modules' ||
            currentTab === 'modules';

        if (!isTutorialReady) return;

        if (!validatedModules.includes('facial_recognition')) {
            if (gameState !== 'tuto_face_id' && !testingModule && currentTab === 'modules')
                triggerPhase('tuto_face_id');
        } else if (!validatedModules.includes('color_scanner')) {
            if (gameState !== 'tuto_color' && !testingModule) triggerPhase('tuto_color');
        } else if (!validatedModules.includes('qr_scanner')) {
            if (gameState !== 'tuto_qr' && !testingModule) triggerPhase('tuto_qr');
        } else if (!validatedModules.includes('gyroscope')) {
            if (gameState !== 'tuto_gyro' && !testingModule) triggerPhase('tuto_gyro');
        } else if (!validatedModules.includes('microphone')) {
            if (gameState !== 'tuto_mic' && !testingModule) triggerPhase('tuto_mic');
        } else {
            if (gameState !== 'debug_all_validated') triggerPhase('debug_all_validated');
        }
    }, [
        validatedModules,
        isAlternateView,
        hasDiscoveredDebug,
        gameState,
        testingModule,
        triggerPhase,
        currentTab,
    ]);

    const handleTabChange = (tab: DebugTab) => {
        setCurrentTab(tab);
        // si le joueur clique sur Modules à la fin de la présentation
        if (gameState === 'debug_go_to_modules' && tab === 'modules') {
            triggerPhase('tuto_face_id');
        }
    };

    const handleModuleSuccess = (id: ModuleId) => {
        setValidatedModules((prev) => [...prev, id]);
        setTestingModule(null);
    };

    // CALCULATE HIGHLIGHT
    const highlightedElement = useMemo(() => {
        // intro nav
        if (gameState === 'debug_pres_home') return 'nav_home';
        if (gameState === 'debug_pres_evidence') return 'nav_evidence';
        if (gameState === 'debug_pres_modules') return 'nav_modules';
        if (gameState === 'debug_go_to_modules') return 'nav_modules';

        // tuto modules
        if (gameState === 'tuto_face_id') return 'facial_recognition';
        if (gameState === 'tuto_color') return 'color_scanner';
        if (gameState === 'tuto_qr') return 'qr_scanner';
        if (gameState === 'tuto_gyro') return 'gyroscope';
        if (gameState === 'tuto_mic') return 'microphone';
        return null;
    }, [gameState]);

    const isDebugTuto = [
        'debug_start',
        'debug_pres_home',
        'debug_pres_evidence',
        'debug_pres_modules',
        'debug_go_to_modules',
    ].includes(gameState);

    return (
        <>
            <DialogueBox
                isOpen={isDialogueOpen}
                script={currentScript}
                onComplete={onDialogueComplete}
                position={isDebugTuto ? 'top' : 'bottom'}
            />

            <ModuleTestModal
                moduleId={testingModule}
                onClose={() => setTestingModule(null)}
                onSuccess={handleModuleSuccess}
            />

            <AlphaModal
                isOpen={showPermissionModal}
                title="Autorisation Requise"
                message="Accès aux capteurs de mouvement requis."
                onClose={() => {}}
                hideIcon
                variant={'info'}
            >
                <div className="flex flex-col items-center gap-4 pt-4">
                    <HandRaisedIcon className="text-brand-orange h-12 w-12 animate-pulse" />
                    <AlphaButton variant={'secondary'} onClick={handlePermissionRequest} size="lg">
                        Activer
                    </AlphaButton>
                </div>
            </AlphaModal>

            {!isAlternateView && <Homepage />}

            {isAlternateView && permissionGranted && (
                <DebugPage
                    currentTab={currentTab}
                    onTabChange={handleTabChange}
                    validatedModules={validatedModules}
                    highlightedElement={highlightedElement}
                    onModuleClick={setTestingModule}
                />
            )}
        </>
    );
}
