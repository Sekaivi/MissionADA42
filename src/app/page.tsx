'use client';

import React, { useMemo, useState } from 'react';

import { HandRaisedIcon } from '@heroicons/react/24/outline';

import Homepage from '@/app/home/page';
import DebugPage, { DebugElementId } from '@/app/test/debug';
import { AlphaButton } from '@/components/alpha/AlphaButton';
import { AlphaModal } from '@/components/alpha/AlphaModal';
import { DialogueBox } from '@/components/dialogueBox';
import { PuzzlePhases } from '@/components/puzzles/PuzzleRegistry';
import { SCENARIO } from '@/data/alphaScenario';
import { CHARACTERS } from '@/data/characters';
import { useGameScenario, useScenarioTransition } from '@/hooks/useGameScenario';
import { useShake } from '@/hooks/useShake';
import { DialogueLine } from '@/types/dialogue';
import { say } from '@/utils/dialogueUtils';

export type DialoguePuzzlePhases =
    | PuzzlePhases
    | 'debug_start'
    | 'debug_focus_console'
    | 'debug_focus_sources'
    | 'debug_focus_network'
    | 'debug_end';

const SCRIPTS: Partial<Record<DialoguePuzzlePhases, DialogueLine[]>> = {
    intro: [
        say(CHARACTERS.fabien, 'Ah, bonjour à tous, ça fait plaisir de vous voir mobilisés.'),
        // ... tes dialogues ...
        say(
            CHARACTERS.goguey,
            'Mais parfois, il vous faudra basculer vers le côté obscur. Secoue ton téléphone !'
        ),
    ],
    debug_start: [
        say(CHARACTERS.goguey, "Ah ! Te voilà de l'autre côté du miroir."),
        say(
            CHARACTERS.goguey,
            "Ceci est l'interface Debug du malfaiteur. Regarde en bas de l'écran."
        ),
    ],
    debug_focus_console: [
        say(
            CHARACTERS.goguey,
            "Ici, c'est la CONSOLE. C'est là que tu pourras entrer des commandes manuelles."
        ),
    ],
    debug_focus_sources: [
        say(
            CHARACTERS.goguey,
            "Là, ce sont les SOURCES. C'est ici que tu trouveras les fichiers des énigmes de code."
        ),
    ],
    debug_focus_network: [
        say(CHARACTERS.goguey, 'Et enfin, le RÉSEAU. Utile pour intercepter des communications.'),
    ],
    debug_end: [
        say(CHARACTERS.fabien, 'Parfait. Tu connais les outils. Au travail maintenant !'),
        say(CHARACTERS.fabien, "Secoue à nouveau quand tu voudras revenir à la page d'accueil."),
    ],
    win: [say(CHARACTERS.fabien, 'Excellent travail. Une étape de franchie.')],
};

export default function Game() {
    // États logiques
    const [isAlternateView, setIsAlternateView] = useState(false);
    const [hasDiscoveredDebug, setHasDiscoveredDebug] = useState(false);
    const [isIntroFinished, setIsIntroFinished] = useState(false);
    const [showPermissionModal, setShowPermissionModal] = useState(false);

    const { gameState, isDialogueOpen, currentScript, triggerPhase, onDialogueComplete } =
        useGameScenario<DialoguePuzzlePhases>(SCRIPTS);

    // --- LOGIQUE SHAKE ---
    const handleShake = () => {
        // PROTECTION ANDROID : On ignore les secousses tant que l'intro n'est pas finie
        if (!isIntroFinished) return;

        if (navigator.vibrate) navigator.vibrate(200);

        // On calcule le futur état pour savoir si on doit déclencher le tuto
        const nextIsAlternateView = !isAlternateView;
        setIsAlternateView(nextIsAlternateView);

        // Si on passe en mode Debug pour la première fois, on déclenche le tuto ICI
        // (au lieu d'utiliser un useEffect)
        if (nextIsAlternateView && !hasDiscoveredDebug) {
            triggerPhase('debug_start');
            setHasDiscoveredDebug(true);
        }
    };

    const { requestPermission, permissionGranted } = useShake(handleShake, {
        threshold: 20,
        minShakes: 4,
        timeout: 1000,
    });

    // --- GESTION PERMISSION ---
    const handlePermissionRequest = async () => {
        await requestPermission();
        setShowPermissionModal(false);
    };

    // --- LOGIQUE TRANSITIONS SCÉNARIO ---
    useScenarioTransition(gameState, isDialogueOpen, {
        idle: () => triggerPhase('intro'),

        intro: () => {
            setIsIntroFinished(true);
            if (!permissionGranted) {
                setShowPermissionModal(true);
            }
        },

        // Enchaînement Debug
        debug_start: () => triggerPhase('debug_focus_console'),
        debug_focus_console: () => triggerPhase('debug_focus_sources'),
        debug_focus_sources: () => triggerPhase('debug_focus_network'),
        debug_focus_network: () => triggerPhase('debug_end'),

        // debug_end ne fait rien de spécial, la highlight sera retirée via le calcul dérivé

        win: () => window.alert('win'),
    });

    // --- LOGIQUE VISUELLE (Calculée à la volée, plus de useEffect + useState) ---
    // C'est une valeur dérivée du gameState
    const highlightedElement: DebugElementId = useMemo(() => {
        switch (gameState) {
            case 'debug_focus_console':
                return 'nav_console';
            case 'debug_focus_sources':
                return 'nav_sources';
            case 'debug_focus_network':
                return 'nav_network';
            default:
                return null;
        }
    }, [gameState]);

    return (
        <>
            <DialogueBox
                isOpen={isDialogueOpen}
                script={currentScript}
                onComplete={onDialogueComplete}
                position={
                    ['debug_focus_console', 'debug_focus_sources', 'debug_focus_network'].includes(
                        gameState
                    )
                        ? 'top'
                        : 'bottom'
                }
            />

            <AlphaModal
                isOpen={gameState === 'win' && !isDialogueOpen}
                title={'Succès'}
                message="Epreuve passée avec succès"
                autoCloseDuration={SCENARIO.defaultTimeBeforeNextStep}
                durationUnit={'ms'}
                onClose={() => window.alert('Navigation vers la suite...')}
            />

            <AlphaModal
                isOpen={showPermissionModal}
                title="Autorisation Requise"
                message="Pour révéler les secrets de cette salle, nous avons besoin de vos capteurs de mouvement."
                onClose={() => {}}
            >
                <div className="flex flex-col items-center gap-4 pt-4">
                    <HandRaisedIcon className="text-brand-orange h-12 w-12 animate-pulse" />
                    <AlphaButton onClick={handlePermissionRequest} size="lg">
                        Activer la Vision
                    </AlphaButton>
                </div>
            </AlphaModal>

            {/* VUE NORMALE */}
            {!isAlternateView && <Homepage />}

            {/* VUE DEBUG */}
            {isAlternateView && <DebugPage highlightedElement={highlightedElement} />}
        </>
    );
}
