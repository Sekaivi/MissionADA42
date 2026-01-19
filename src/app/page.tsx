'use client';

import React, { useEffect, useMemo, useState } from 'react';

import { HandRaisedIcon } from '@heroicons/react/24/outline';

import ClientLayout from '@/app/ClientLayout';
import { ModuleTestModal } from '@/app/test/ModuleTestModal';
import DebugPage, { DebugTab } from '@/app/test/debug';
import Homepage from '@/app/test/homepage';
import { AlphaButton } from '@/components/alpha/AlphaButton';
import { AlphaModal } from '@/components/alpha/AlphaModal';
import { DialogueBox } from '@/components/dialogueBox';
import { ModuleAction, PuzzlePhases } from '@/components/puzzles/PuzzleRegistry';
import { EscapeGameProvider, useEscapeGame } from '@/context/EscapeGameContext';
import { CHARACTERS } from '@/data/characters';
import { ModuleId } from '@/data/modules';
import { useGameScenario, useScenarioTransition } from '@/hooks/useGameScenario';
import { useShake } from '@/hooks/useShake';
import { DialogueLine } from '@/types/dialogue';
import { say } from '@/utils/dialogueUtils';

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
        say(
            CHARACTERS.fabien,
            'Ah, bonjour à tous, ça fait plaisir de vous voir mobilisés et prêts à aider l’IUT.'
        ),
        say(
            CHARACTERS.fabien,
            'Bon les élèves de 3e année vous ont déjà expliqué la situation j’imagine, donc faisons court.'
        ),
        say(
            CHARACTERS.fabien,
            'Un élève vient de développer un virus qui menace toutes les machines, alors M. Jacquot a créé un antivirus.'
        ),
        say(
            CHARACTERS.fabien,
            "Le problème, c'est que la clé USB sur laquelle il était stocké a été subtilisée par ce mystérieux élève..."
        ),
        say(
            CHARACTERS.fabien,
            'Comme par hasard, cet évènement est survenu juste après une SAE de dev !'
        ),
        say(
            CHARACTERS.fabien,
            'On a reçu un message du malfaiteur et il nous a laissé des puzzles pour retrouver notre précieuse clé USB !'
        ),
        say(
            CHARACTERS.fabien,
            'Il a menacé d’activer immédiatement le virus si ce puzzle n’était pas fait exclusivement par des premières années.'
        ),
        say(
            CHARACTERS.fabien,
            'Vous avez donc été choisis pour trouver cette clé, l’activer et sauver l’IUT !'
        ),
        say(
            CHARACTERS.fabien,
            "D’ailleurs, même si ce n'est pas la priorité ultime, il faudrait aussi trouver l’identité de l’élève qui a créé ce virus..."
        ),
        say(
            CHARACTERS.paj,
            'Si on l’attrape, il subira les conséquences de ses actes, et je m’en assurerai personnellement.',
            {}
        ),        say(
            CHARACTERS.goguey,
            "Avant ça, laisse-moi te présenter les outils que tu utiliseras pour retrouver ce criminel ! Il faudra parfois que tu utilises l'interface debug."
        ),say(
            CHARACTERS.goguey,
            "Secoue ton téléphone pour y accéder!"
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
    debug_all_validated: [
        say(CHARACTERS.paj, 'Ton équipement est opérationnel.'),
        say(
            CHARACTERS.goguey,
            "Tu peux retourner sur l'interface principal pour débuter l'opération quand tes amis et toi seront prêts !"
        ),
    ],
};

// config highlight => phase = ID élément
const HIGHLIGHT_MAP: Partial<Record<string, string>> = {
    debug_pres_home: 'nav_home',
    debug_pres_evidence: 'nav_evidence',
    debug_pres_modules: 'nav_modules',
    debug_go_to_modules: 'nav_modules',
    tuto_face_id: 'facial_recognition',
    tuto_color: 'color_scanner',
    tuto_qr: 'qr_scanner',
    tuto_gyro: 'gyroscope',
    tuto_mic: 'microphone',
};

// séquence du tutoriel : ordre strict des modules à valider
const TUTORIAL_SEQUENCE: { id: ModuleId; phase: GamePhases }[] = [
    { id: 'facial_recognition', phase: 'tuto_face_id' },
    { id: 'color_scanner', phase: 'tuto_color' },
    { id: 'qr_scanner', phase: 'tuto_qr' },
    { id: 'gyroscope', phase: 'tuto_gyro' },
    { id: 'microphone', phase: 'tuto_mic' },
];

const GameContent = () => {
    // contexte multijoueur
    const { isConnected, logic, pseudo, playerId } = useEscapeGame();

    const [isAlternateView, setIsAlternateView] = useState(false);
    const [isIntroFinished, setIsIntroFinished] = useState(false);
    const [hasDiscoveredDebug, setHasDiscoveredDebug] = useState(false);
    const [showPermissionModal, setShowPermissionModal] = useState(false);

    const [currentTab, setCurrentTab] = useState<DebugTab>('home');

    // gestion de validation de vote multijoueur
    const [validatedModules, setValidatedModules] = useState<ModuleId[]>([]);
    const [testingModule, setTestingModule] = useState<ModuleId | null>(null);
    const [lastModuleAction, setLastModuleAction] = useState<ModuleAction | null>(null);

    const {
        gameState: currentPhase,
        isDialogueOpen,
        currentScript,
        triggerPhase,
        onDialogueComplete,
    } = useGameScenario<GamePhases>(SCRIPTS);

    const phaseString = currentPhase as string;

    // persistance et restauration
    useEffect(() => {
        const isTutoDone =
            typeof window !== 'undefined' &&
            localStorage.getItem('alpha_tuto_completed') === 'true';

        // si le joueur est connecté ou a fini le tuto, mais que localStorage n'est pas encore à jour
        if ((isConnected || isTutoDone) && phaseString !== 'debug_all_validated') {
            const timer = setTimeout(() => {
                triggerPhase('debug_all_validated', true);
                setIsIntroFinished(true);
                setHasDiscoveredDebug(true);
                setValidatedModules(TUTORIAL_SEQUENCE.map((s) => s.id));
            }, 0);
            return () => clearTimeout(timer);
        }
    }, [isConnected, phaseString, triggerPhase]);

    // switch interface
    const switchInterface = () => {
        if (!isIntroFinished && phaseString !== 'debug_all_validated') return;
        if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(200);

        setIsAlternateView((prev) => {
            const nextView = !prev;
            if (nextView && !hasDiscoveredDebug) {
                if (phaseString !== 'debug_all_validated') triggerPhase('debug_start');
                setHasDiscoveredDebug(true);
            }
            return nextView;
        });
    };

    const { requestPermission, permissionGranted } = useShake(switchInterface, {
        threshold: 20,
        minShakes: 4,
        timeout: 1000,
    });

    useScenarioTransition(currentPhase, isDialogueOpen, {
        idle: () => {
            const isDone = localStorage.getItem('alpha_tuto_completed') === 'true';
            triggerPhase(isDone ? 'debug_all_validated' : 'intro');
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
        debug_all_validated: () => {
            console.log('save tuto passed');
            localStorage.setItem('alpha_tuto_completed', 'true');
        },
    });

    // validation des modules (unlock pendant le tuto)
    useEffect(() => {
        if (!isAlternateView || !hasDiscoveredDebug || phaseString === 'debug_all_validated')
            return;

        const isReadyToStart =
            validatedModules.length > 0 ||
            currentPhase === 'debug_go_to_modules' ||
            currentTab === 'modules';
        if (!isReadyToStart) return;

        for (const step of TUTORIAL_SEQUENCE) {
            // si ce module n'est pas encore validé
            if (!validatedModules.includes(step.id)) {
                // si on n'est pas déjà dans la bonne phase et qu'on n'est pas en train de tester
                if (currentPhase !== step.phase && !testingModule) {
                    // pour le premier module, on force l'onglet
                    if (step.id === 'facial_recognition' && currentTab === 'modules') {
                        triggerPhase(step.phase);
                    } else if (step.id !== 'facial_recognition') {
                        triggerPhase(step.phase);
                    }
                }
                return; // on arrête la boucle ici => on attend que ce module soit validé
            }
        }

        // si la boucle se termine => tous les modules sont validés
        if (phaseString !== 'debug_all_validated') {
            triggerPhase('debug_all_validated');
        }
    }, [
        validatedModules,
        isAlternateView,
        hasDiscoveredDebug,
        currentPhase,
        testingModule,
        triggerPhase,
        currentTab,
        phaseString,
    ]);

    const handleTabChange = (tab: DebugTab) => {
        setCurrentTab(tab);
        if (currentPhase === 'debug_go_to_modules' && tab === 'modules') {
            triggerPhase('tuto_face_id');
        }
    };

    // GESTION DES RÉSULTATS DES MODULES
    const handleModuleSuccess = (id: ModuleId, result: Record<string, unknown> = {}) => {
        const isGameMode = phaseString === 'debug_all_validated';

        // tutoriel
        if (!isGameMode) {
            if (!validatedModules.includes(id)) setValidatedModules((prev) => [...prev, id]);
            // ferme automatiquement pour valider l'étape et passer à la suivante
            setTestingModule(null);
        } else {
            // logique de jeu => mode libre
            console.log(`[GAME] Module ${id} used.`);
            if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(50);

            logic?.submitModuleAction(id, result);
            // màj locale pour réactivité immédiate
            setLastModuleAction({ id, data: result, timestamp: Date.now() });
        }
    };

    const highlightedElement = useMemo(() => {
        if (phaseString === 'debug_all_validated') return null;
        return HIGHLIGHT_MAP[phaseString] || null;
    }, [phaseString]);

    const isDebugTuto = [
        'debug_start',
        'debug_pres_home',
        'debug_pres_evidence',
        'debug_pres_modules',
        'debug_go_to_modules',
    ].includes(phaseString);
    const multiplayerState = logic?.gameState;
    const currentMultiplayerStep = logic?.currentScenarioStep;
    const activePuzzleId = logic?.activePuzzleId;
    const validationRequest = multiplayerState?.validationRequest;
    const isValidationPending = !!validationRequest;
    const isPlayerReady = validationRequest?.readyPlayers?.includes(playerId) || false;
    const shouldTimerRun =
        !!logic && (multiplayerState?.step || 0) > 0 && !logic.isGameWon && !logic.isTimeUp;

    return (
        <ClientLayout variant={isAlternateView ? 'dark' : 'light'}>
            <AlphaButton variant={'primary'} onClick={switchInterface}>
                Switch
            </AlphaButton>

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
                isTutorial={phaseString !== 'debug_all_validated'}
            />

            <AlphaModal
                isOpen={showPermissionModal}
                title="Autorisation Requise"
                message="Accès aux capteurs de mouvement requis."
                hideIcon
                variant={'info'}
            >
                <div className="flex flex-col items-center gap-4 pt-4">
                    <HandRaisedIcon className="text-brand-orange h-12 w-12 animate-pulse" />
                    <AlphaButton
                        variant={'secondary'}
                        onClick={async () => {
                            await requestPermission();
                            setShowPermissionModal(false);
                        }}
                        size="lg"
                    >
                        Activer
                    </AlphaButton>
                </div>
            </AlphaModal>

            <div className={!isAlternateView ? '_HOMEPAGE_CONTENT my-4 space-y-4' : 'hidden'}>
                {phaseString === 'debug_all_validated' ? (
                    <Homepage
                        missionStatus={currentMultiplayerStep?.title}
                        missionStep={multiplayerState?.step}
                        isTimerRunning={shouldTimerRun}
                        isTimeUp={logic?.isTimeUp || false}
                        notificationCount={multiplayerState?.step ? 1 : 0}
                        activePuzzleId={activePuzzleId}
                        gameState={multiplayerState || null}
                        onPuzzleSolve={(id, data) => {
                            if (logic && currentMultiplayerStep) {
                                const payload = data ? ` : ${JSON.stringify(data)}` : '';
                                const source = id ? `[${id}] ` : '';
                                logic.submitProposal(
                                    pseudo,
                                    `${source}Solution pour "${currentMultiplayerStep.title}"${payload}`
                                );
                            }
                        }}
                        isValidationPending={isValidationPending}
                        isPlayerReady={isPlayerReady}
                        onVoteReady={() => logic?.voteReady()}
                        lastModuleAction={lastModuleAction}
                        showLobby={isIntroFinished}
                    />
                ) : (
                    <Homepage />
                )}
            </div>

            {/* VUE DEBUG */}
            <div className={isAlternateView ? '_DEBUG_CONTENT my-4 space-y-4' : 'hidden'}>
                <DebugPage
                    currentTab={currentTab}
                    onTabChange={handleTabChange}
                    validatedModules={validatedModules}
                    highlightedElement={highlightedElement}
                    onModuleClick={setTestingModule}
                    gameLogic={logic}
                    activeExternalPuzzle={activePuzzleId}
                />
            </div>
        </ClientLayout>
    );
};

export default function GameWrapper() {
    return (
        <EscapeGameProvider>
            <GameContent />
        </EscapeGameProvider>
    );
}
