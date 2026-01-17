'use client';

import React, { useEffect, useMemo, useState } from 'react';

import { HandRaisedIcon } from '@heroicons/react/24/outline';

import { GameLobby } from '@/app/test/GameLobby';
import { ModuleTestModal } from '@/app/test/ModuleTestModal';
import DebugPage, { DebugTab } from '@/app/test/debug';
import Homepage from '@/app/test/homepage';
import { AlphaButton } from '@/components/alpha/AlphaButton';
import { AlphaModal } from '@/components/alpha/AlphaModal';
import { DialogueBox } from '@/components/dialogueBox';
import { PuzzlePhases } from '@/components/puzzles/PuzzleRegistry';
import { EscapeGameProvider, useEscapeGame } from '@/context/EscapeGameContext';
import { CHARACTERS } from '@/data/characters';
import { ModuleId } from '@/data/modules';
import { useGameScenario, useScenarioTransition } from '@/hooks/useGameScenario';
import { useShake } from '@/hooks/useShake';
import { DialogueLine } from '@/types/dialogue';
import { say } from '@/utils/dialogueUtils';
import ClientLayout from "@/app/ClientLayout";

export type GamePhases =
    | PuzzlePhases
    | 'intro'
    | 'debug_start'
    | 'debug_pres_home'
    | 'debug_pres_evidence'
    | 'debug_pres_modules'
    | 'debug_go_to_modules'
    | 'tuto_face_id'
    | 'tuto_color'
    | 'tuto_qr'
    | 'tuto_gyro'
    | 'tuto_mic'
    | 'debug_all_validated';

const SCRIPTS: Partial<Record<GamePhases, DialogueLine[]>> = {
    intro: [
        say(CHARACTERS.fabien, 'Ah, bonjour à tous, ça fait plaisir de vous voir.'),
        say(
            CHARACTERS.goguey,
            "Parfois, il faudra utiliser l'interface debug. Secoue ton téléphone !"
        ),
    ],
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
    tuto_face_id: [say(CHARACTERS.paj, 'Premier test : La reconnaissance faciale. Clique dessus.')],
    tuto_color: [say(CHARACTERS.paj, 'Bien. Maintenant, le scanner de couleur.')],
    tuto_qr: [say(CHARACTERS.paj, 'Ensuite, le Décodeur QR. Indispensable.')],
    tuto_gyro: [say(CHARACTERS.paj, 'Calibrons le Gyroscope.')],
    tuto_mic: [say(CHARACTERS.paj, "Enfin, le Micro. On a besoin d'oreilles partout.")],
    debug_all_validated: [],
};

const GameContent = () => {
    // Contexte multijoueur
    const { isConnected, logic, isHost, pseudo, playerId } = useEscapeGame();

    const multiplayerState = logic?.gameState;
    const currentMultiplayerStep = logic?.currentScenarioStep;
    const activePuzzleId = logic?.activePuzzleId;

    // gestion de validation de vote multijoueur
    const validationRequest = logic?.gameState?.validationRequest;
    const isValidationPending = !!validationRequest;
    const isPlayerReady = validationRequest?.readyPlayers?.includes(playerId) || false;

    const [isAlternateView, setIsAlternateView] = useState(false);
    const [isIntroFinished, setIsIntroFinished] = useState(false);
    const [hasDiscoveredDebug, setHasDiscoveredDebug] = useState(false);
    const [showPermissionModal, setShowPermissionModal] = useState(false);

    const [currentTab, setCurrentTab] = useState<DebugTab>('home');
    const [validatedModules, setValidatedModules] = useState<ModuleId[]>([]);
    const [testingModule, setTestingModule] = useState<ModuleId | null>(null);

    const {
        gameState: tutorialPhase,
        isDialogueOpen,
        currentScript,
        triggerPhase,
        onDialogueComplete,
    } = useGameScenario<GamePhases>(SCRIPTS);

    // persistance et restauration
    useEffect(() => {
        const tutoCompleted =
            typeof window !== 'undefined' &&
            localStorage.getItem('alpha_tuto_completed') === 'true';

        // si le joueur est connecté ou a fini le tuto, mais que localStorage n'est pas encore à jour
        if ((isConnected || tutoCompleted) && (tutorialPhase as string) !== 'debug_all_validated') {
            const timer = setTimeout(() => {
                triggerPhase('debug_all_validated');
                setIsIntroFinished(true);
                setHasDiscoveredDebug(true);
                setValidatedModules([
                    'facial_recognition',
                    'color_scanner',
                    'qr_scanner',
                    'gyroscope',
                    'microphone',
                ]);
            }, 0);

            return () => clearTimeout(timer);
        }
    }, [isConnected, tutorialPhase, triggerPhase]);

    useEffect(() => {
        if ((tutorialPhase as string) === 'debug_all_validated') {
            localStorage.setItem('alpha_tuto_completed', 'true');
        }
    }, [tutorialPhase]);

    // logs
    useEffect(() => {
        if (isConnected && multiplayerState) {
            console.log('🔄 [SYNC] State Step:', multiplayerState.step);
        }
    }, [multiplayerState, isConnected]);

    // switch interface
    const switchInterface = () => {
        if (!isIntroFinished && (tutorialPhase as string) !== 'debug_all_validated') return;
        if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(200);

        setIsAlternateView((prev) => {
            const nextView = !prev;
            if (nextView && !hasDiscoveredDebug) {
                if ((tutorialPhase as string) !== 'debug_all_validated') {
                    triggerPhase('debug_start');
                }
                setHasDiscoveredDebug(true);
            }
            return nextView;
        });
    };

    const { requestPermission, permissionGranted } = useShake(() => switchInterface(), {
        threshold: 20,
        minShakes: 4,
        timeout: 1000,
    });

    const handlePermissionRequest = async () => {
        await requestPermission();
        setShowPermissionModal(false);
    };

    useScenarioTransition(tutorialPhase, isDialogueOpen, {
        idle: () => {
            if (localStorage.getItem('alpha_tuto_completed') !== 'true') {
                triggerPhase('intro');
            } else {
                triggerPhase('debug_all_validated');
            }
        },
        intro: () => {
            setIsIntroFinished(true);
            if (!permissionGranted) setShowPermissionModal(true);
        },
        debug_start: () => triggerPhase('debug_pres_home'),
        debug_pres_home: () => triggerPhase('debug_pres_evidence'),
        debug_pres_evidence: () => triggerPhase('debug_pres_modules'),
        debug_pres_modules: () => triggerPhase('debug_go_to_modules'),
        debug_go_to_modules: () => {
            if (currentTab === 'modules') triggerPhase('tuto_face_id');
        },
    });

    // validation des modules (Unlock during Tuto)
    useEffect(() => {
        if (
            !isAlternateView ||
            !hasDiscoveredDebug ||
            (tutorialPhase as string) === 'debug_all_validated'
        )
            return;
        const isTutorialReady =
            validatedModules.length > 0 ||
            tutorialPhase === 'debug_go_to_modules' ||
            currentTab === 'modules';
        if (!isTutorialReady) return;

        if (!validatedModules.includes('facial_recognition')) {
            if (tutorialPhase !== 'tuto_face_id' && !testingModule && currentTab === 'modules')
                triggerPhase('tuto_face_id');
        } else if (!validatedModules.includes('color_scanner')) {
            if (tutorialPhase !== 'tuto_color' && !testingModule) triggerPhase('tuto_color');
        } else if (!validatedModules.includes('qr_scanner')) {
            if (tutorialPhase !== 'tuto_qr' && !testingModule) triggerPhase('tuto_qr');
        } else if (!validatedModules.includes('gyroscope')) {
            if (tutorialPhase !== 'tuto_gyro' && !testingModule) triggerPhase('tuto_gyro');
        } else if (!validatedModules.includes('microphone')) {
            if (tutorialPhase !== 'tuto_mic' && !testingModule) triggerPhase('tuto_mic');
        } else {
            if ((tutorialPhase as string) !== 'debug_all_validated')
                triggerPhase('debug_all_validated');
        }
    }, [
        validatedModules,
        isAlternateView,
        hasDiscoveredDebug,
        tutorialPhase,
        testingModule,
        triggerPhase,
        currentTab,
    ]);

    const handleTabChange = (tab: DebugTab) => {
        setCurrentTab(tab);
        if (tutorialPhase === 'debug_go_to_modules' && tab === 'modules') {
            triggerPhase('tuto_face_id');
        }
    };

    // GESTION DES RÉSULTATS DES MODULES
    const handleModuleSuccess = (id: ModuleId, result?: any) => {
        const isGameMode = (tutorialPhase as string) === 'debug_all_validated';

        // tutoriel
        if (!isGameMode) {
            if (!validatedModules.includes(id)) {
                setValidatedModules((prev) => [...prev, id]);
            }
            // ferme automatiquement pour valider l'étape et passer à la suivante
            setTestingModule(null);
            return;
        }

        // logique de jeu => mode libre
        if (isGameMode) {
            console.log(`[GAME] Module ${id} used. Result:`, result);

            if (typeof navigator !== 'undefined' && navigator.vibrate) {
                navigator.vibrate(50);
            }

            if (logic) {
                // envoie les données au moteur de jeu
                const payload = result ? JSON.stringify(result) : 'OK';
                logic.submitProposal(pseudo, `MODULE_ACTION:${id}:${payload}`);
            }

            // EN JEU : ON NE FERME PAS LA MODALE AUTOMATIQUEMENT
        }
    };

    const highlightedElement = useMemo(() => {
        if ((tutorialPhase as string) === 'debug_all_validated') return null;
        if (tutorialPhase === 'debug_pres_home') return 'nav_home';
        if (tutorialPhase === 'debug_pres_evidence') return 'nav_evidence';
        if (tutorialPhase === 'debug_pres_modules') return 'nav_modules';
        if (tutorialPhase === 'debug_go_to_modules') return 'nav_modules';
        if (tutorialPhase === 'tuto_face_id') return 'facial_recognition';
        if (tutorialPhase === 'tuto_color') return 'color_scanner';
        if (tutorialPhase === 'tuto_qr') return 'qr_scanner';
        if (tutorialPhase === 'tuto_gyro') return 'gyroscope';
        if (tutorialPhase === 'tuto_mic') return 'microphone';
        return null;
    }, [tutorialPhase]);

    const isDebugTuto = [
        'debug_start',
        'debug_pres_home',
        'debug_pres_evidence',
        'debug_pres_modules',
        'debug_go_to_modules',
    ].includes((tutorialPhase as string) || '');

    const handleMultiplayerPuzzleSolve = () => {
        if (logic && currentMultiplayerStep) {
            logic.submitProposal(pseudo, `Solution pour "${currentMultiplayerStep.title}"`);
        }
    };

    const showDialogBox = isDialogueOpen && (tutorialPhase as string) !== 'debug_all_validated';

    const shouldTimerRun =
        !!logic && (multiplayerState?.step || 0) > 0 && !logic.isGameWon && !logic.isTimeUp;

    return (
        <>
            <AlphaButton variant={'primary'} onClick={switchInterface}>
                Switch
            </AlphaButton>

            {showDialogBox && (
                <DialogueBox
                    isOpen={true}
                    script={currentScript}
                    onComplete={onDialogueComplete}
                    position={isDebugTuto ? 'top' : 'bottom'}
                />
            )}

            {/* Note : ModuleTestModal doit être capable de renvoyer des données via onSuccess
                Exemple: onSuccess={(id, data) => handleModuleSuccess(id, data)}
            */}
            <ModuleTestModal
                moduleId={testingModule}
                onClose={() => setTestingModule(null)}
                onSuccess={(id, data) => handleModuleSuccess(id, data)}
                // C'est un tuto SI on n'est PAS encore à l'étape 'debug_all_validated'
                isTutorial={(tutorialPhase as string) !== 'debug_all_validated'}
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

            <div className={!isAlternateView ? '_HOMEPAGE_CONTENT' : 'hidden'}>
                <ClientLayout variant={'light'}>
                    {(tutorialPhase as string) === 'debug_all_validated' ? (
                        isConnected ? (
                            <Homepage
                                missionStatus={currentMultiplayerStep?.title}
                                missionStep={multiplayerState?.step}
                                isTimerRunning={shouldTimerRun}
                                notificationCount={multiplayerState?.step ? 1 : 0}
                                activePuzzleId={activePuzzleId}
                                gameState={multiplayerState || null}
                                onPuzzleSolve={handleMultiplayerPuzzleSolve}
                                isValidationPending={isValidationPending}
                                isPlayerReady={isPlayerReady}
                                onVoteReady={() => logic?.voteReady()}
                                isHost={isHost}
                            />
                        ) : (
                            <GameLobby />
                        )
                    ) : (
                        <Homepage />
                    )}
                </ClientLayout>
            </div>

            <div className={isAlternateView ? '_DEBUG_CONTENT' : 'hidden'}>
                <ClientLayout variant={'dark'}>

                    <DebugPage
                        currentTab={currentTab}
                        onTabChange={handleTabChange}
                        validatedModules={validatedModules}
                        highlightedElement={highlightedElement}
                        onModuleClick={setTestingModule}
                        isHost={isHost}
                        gameLogic={logic}
                        activeExternalPuzzle={activePuzzleId}
                    />
                </ClientLayout>
            </div>
        </>
    );
};

export default function GameWrapper() {
    return (
        <EscapeGameProvider>
            <GameContent />
        </EscapeGameProvider>
    );
}