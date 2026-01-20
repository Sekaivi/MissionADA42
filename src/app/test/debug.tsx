'use client';

import React, { useState } from 'react';

import Image from 'next/image';

import {
    ArrowRightEndOnRectangleIcon,
    BellAlertIcon,
    CommandLineIcon,
    CpuChipIcon,
    FolderOpenIcon,
    HashtagIcon,
    ShieldCheckIcon,
    UserGroupIcon,
} from '@heroicons/react/24/outline';
import { ArrowLeftIcon } from '@heroicons/react/24/solid';
import clsx from 'clsx';

import { LogTerminal } from '@/components/LogTerminal';
import { AlphaButton } from '@/components/alpha/AlphaButton';
import { AlphaCard } from '@/components/alpha/AlphaCard';
import { AlphaModal } from '@/components/alpha/AlphaModal';
import { ModuleLink } from '@/components/alpha/ModuleLink';
import { InventoryGrid } from '@/components/inventory/InventoryGrid';
import { InventoryItemDetails } from '@/components/inventory/InventoryItemDetails';
import { InventoryItemUI } from '@/components/inventory/InventorySlot';
import { HintSystem } from '@/components/ui/HintSystem';
import { useEscapeGame } from '@/context/EscapeGameContext';
import { MODULES, ModuleId } from '@/data/modules';
import { useGameLogic } from '@/hooks/useGameLogic';

export type DebugTab = 'home' | 'modules' | 'evidence' | 'admin';

interface DebugPageProps {
    currentTab: DebugTab;
    onTabChange: (tab: DebugTab) => void;
    highlightedElement?: string | null;
    validatedModules: ModuleId[];
    onModuleClick: (id: ModuleId) => void;
    gameLogic?: ReturnType<typeof useGameLogic> | null;
    activeExternalPuzzle?: string | null;
}

export default function DebugPage({
    currentTab,
    onTabChange,
    highlightedElement,
    validatedModules,
    onModuleClick,
    gameLogic,
    activeExternalPuzzle,
}: DebugPageProps) {
    const { logout, playerId, gameCode } = useEscapeGame();
    const [isLeaving, setIsLeaving] = useState(false);

    const [viewedItem, setViewedItem] = useState<InventoryItemUI | null>(null);

    const inventoryItems: InventoryItemUI[] = (gameLogic?.gameState?.inventory || []).map(
        (item) => ({
            id: item.id,
            name: item.name,
            description: item.desc,
            sprite: item.sprite,
        })
    );

    const isHost = gameLogic?.isHost ?? false;

    // données validation
    const validationRequest = gameLogic?.gameState?.validationRequest;
    const isReady = validationRequest?.readyPlayers.includes(playerId);
    const totalPlayers = gameLogic?.gameState?.players?.length || 1;
    const readyCount = validationRequest?.readyPlayers.length || 0;

    // données proposition
    const pendingProposal = gameLogic?.gameState?.pendingProposal;

    const handleSafeLogout = async () => {
        setIsLeaving(true);
        try {
            // on tente la promotion
            if (gameLogic) {
                await gameLogic.leaveGame();
            }
        } catch (e) {
            console.error('Erreur lors de la sauvegarde du départ', e);
        } finally {
            logout();
            setIsLeaving(false);
        }
    };

    const isModuleLocked = (id: ModuleId) => {
        if (gameLogic?.gameState && gameLogic.gameState.step > 0) return false;
        if (id === 'facial_recognition') return false;
        if (id === 'color_scanner') return !validatedModules.includes('facial_recognition');
        if (id === 'qr_scanner') return !validatedModules.includes('color_scanner');
        if (id === 'gyroscope') return !validatedModules.includes('qr_scanner');
        if (id === 'microphone') return !validatedModules.includes('gyroscope');
        return true;
    };

    const getHighlightClass = (id: string, baseClass: string) => {
        const isHighlighted = highlightedElement === id || activeExternalPuzzle === id;
        return clsx(
            baseClass,
            isHighlighted &&
                'ring-2 ring-brand-purple ring-offset-2 ring-offset-black scale-105 z-50 animate-pulse bg-brand-purple/20 border-brand-purple shadow-[0_0_15px_rgba(168,85,247,0.5)]'
        );
    };

    const handleCloseItemModal = () => {
        if (gameLogic) {
            gameLogic.dismissItemNotification();
            // onTabChange('evidence');
        }
    };

    return (
        <>
            {/* MODALE DE DÉCOUVERTE D'OBJET */}
            {gameLogic && (
                <AlphaModal
                    isOpen={!!gameLogic.newItemNotification}
                    onClose={handleCloseItemModal}
                    title="NOUVELLE PREUVE"
                    message={`Vous avez récupéré : ${gameLogic.newItemNotification?.name}`}
                    subMessage="Donnée décryptée. Consultez l'onglet PREUVES."
                    variant="success"
                >
                    {gameLogic.newItemNotification?.sprite && (
                        <div className="relative mx-auto h-24 w-24">
                            <Image
                                fill
                                src={gameLogic.newItemNotification.sprite}
                                alt="Item"
                                className="h-full w-full object-contain drop-shadow-lg"
                            />
                        </div>
                    )}

                    <AlphaButton
                        onClick={handleCloseItemModal}
                        variant={'primary'}
                        className={'mx-auto'}
                    >
                        Compris
                    </AlphaButton>
                </AlphaModal>
            )}

            {/* TAB: TERMINAL */}
            {currentTab === 'home' && (
                <>
                    {/* infos de session */}
                    {gameLogic && (
                        <AlphaCard
                            title="État du Réseau"
                            contentClassName={'grid grid-cols-2 gap-4 text-xs'}
                        >
                            <div className="bg-surface-highlight rounded p-2">
                                <div className="text-muted mb-1 flex items-center gap-1">
                                    <HashtagIcon className="h-3 w-3" /> SESSION
                                </div>
                                <div className="text-brand-emerald font-mono text-2xl font-black tracking-widest">
                                    {gameCode}
                                </div>
                            </div>
                            <div className="bg-surface-highlight rounded p-2">
                                <div className="text-muted mb-1 flex items-center gap-1">
                                    <UserGroupIcon className="h-3 w-3" /> AGENTS
                                </div>
                                <div className="font-mono">{totalPlayers} Connecté(s)</div>
                            </div>
                        </AlphaCard>
                    )}

                    {/* logs système + notifs actives */}
                    <AlphaCard title="Terminal de Commande">
                        <div className="space-y-4">
                            {/* notif de proposition (visible par tous, actionnable par l'hôte) */}
                            {pendingProposal && (
                                <div className="border-brand-yellow/50 bg-brand-yellow/10 animate-pulse rounded-lg border p-3">
                                    <div className="text-brand-yellow mb-2 flex items-center gap-2 text-xs font-bold uppercase">
                                        <BellAlertIcon className="h-4 w-4" /> Signal Détecté
                                    </div>
                                    <div className="mb-2 text-sm">
                                        <span className="text-brand-yellow font-bold">
                                            {pendingProposal.playerName}
                                        </span>{' '}
                                        propose une solution :
                                    </div>
                                    <div className="bg-surface text-muted border-border mb-3 rounded border p-2 text-center font-mono text-xs">
                                        "{pendingProposal.actionLabel}"
                                    </div>

                                    {isHost ? (
                                        <div className="grid grid-cols-2 gap-2">
                                            <AlphaButton
                                                onClick={() => gameLogic?.initiateNextStep()}
                                                variant="primary"
                                                size="sm"
                                            >
                                                VALIDER (Vote)
                                            </AlphaButton>
                                            <AlphaButton
                                                onClick={() => gameLogic?.rejectProposal()}
                                                variant="danger"
                                                size="sm"
                                            >
                                                REJETER
                                            </AlphaButton>
                                        </div>
                                    ) : (
                                        <div className="text-muted text-center text-xs italic">
                                            En attente de validation par le Host...
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* progress bar validation (visible pendant le vote) */}
                            {validationRequest && (
                                <div className="border-brand-emerald/50 bg-brand-emerald/5 rounded-lg border p-3">
                                    <div className="text-brand-emerald mb-1 flex justify-between text-xs font-bold uppercase">
                                        <span>Synchronisation Équipe</span>
                                        <span>
                                            {readyCount}/{totalPlayers}
                                        </span>
                                    </div>
                                    <div className="bg-surface-highlight mb-2 h-2 w-full overflow-hidden rounded-full">
                                        <div
                                            className="bg-brand-emerald h-full transition-all duration-500 ease-out"
                                            style={{
                                                width: `${(readyCount / totalPlayers) * 100}%`,
                                            }}
                                        />
                                    </div>

                                    {/* actions de vote */}
                                    <div className="flex justify-center gap-2">
                                        {!isReady && (
                                            <AlphaButton
                                                onClick={() => gameLogic?.voteReady()}
                                                variant="primary"
                                                size="sm"
                                            >
                                                JE SUIS PRÊT
                                            </AlphaButton>
                                        )}
                                        {isReady && !isHost && (
                                            <span className="text-brand-emerald animate-pulse text-xs">
                                                Vote enregistré...
                                            </span>
                                        )}
                                        {/* l'hôte peut encore forcer si besoin, mais l'auto-complete gère le reste */}
                                        {isHost && (
                                            <AlphaButton
                                                onClick={() => gameLogic?.confirmNextStep()}
                                                variant="secondary"
                                                size="sm"
                                            >
                                                FORCER LE DÉPART
                                            </AlphaButton>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* historique classique */}
                            <LogTerminal
                                logs={gameLogic?.gameState?.logs || []}
                                systemMessage={gameLogic?.gameState?.message}
                            />
                        </div>
                    </AlphaCard>

                    {gameLogic && gameLogic.currentScenarioStep && !gameLogic.isGameWon && (
                        <div className="my-4 flex justify-center">
                            <HintSystem
                                key={gameLogic.currentScenarioStep.id}
                                step={gameLogic.currentScenarioStep}
                                startTime={Number(
                                    gameLogic.gameState?.lastStepTime ||
                                        gameLogic.effectiveStartTime ||
                                        Date.now()
                                )}
                                onShowScript={(script) => {
                                    gameLogic.setAdminScript(script);
                                    gameLogic.setAdminDialogueOpen(true);
                                }}
                            />
                        </div>
                    )}

                    {gameLogic && (
                        <AlphaButton
                            onClick={handleSafeLogout}
                            disabled={isLeaving}
                            variant={'danger'}
                            fullWidth
                        >
                            <ArrowRightEndOnRectangleIcon className="h-4 w-4" />{' '}
                            {isLeaving ? 'Déconnexion...' : 'Quitter'}
                        </AlphaButton>
                    )}
                </>
            )}

            {/* TAB: MODULES */}
            {currentTab === 'modules' && (
                <div className="grid grid-cols-1 gap-3">
                    {MODULES.map((mod) => {
                        const isValidated = validatedModules.includes(mod.id);
                        const isLocked = isModuleLocked(mod.id);
                        const isActiveInGame = activeExternalPuzzle === mod.id;
                        const isGameMode = (gameLogic?.gameState?.step || 0) > 0;
                        const showValidatedStyle = isValidated && !isGameMode;

                        return (
                            <div
                                key={mod.id}
                                className={clsx(
                                    isLocked && 'pointer-events-none opacity-50',
                                    getHighlightClass(
                                        mod.id,
                                        `rounded-xl border transition-all ${
                                            isActiveInGame
                                                ? 'bg-brand-purple/20 border-brand-purple'
                                                : showValidatedStyle
                                                  ? 'bg-brand-emerald/10 border-brand-emerald text-brand-emerald pointer-events-none opacity-70'
                                                  : 'border-none border-transparent'
                                        }`
                                    )
                                )}
                            >
                                <ModuleLink
                                    key={mod.id}
                                    onClick={() => onModuleClick(mod.id)}
                                    title={mod.label}
                                    subtitle={mod.description}
                                    icon={mod.icon}
                                />
                            </div>
                        );
                    })}
                </div>
            )}

            {/* TAB: EVIDENCE (INVENTAIRE) */}
            {currentTab === 'evidence' && (
                <div className="h-full">
                    {viewedItem ? (
                        // VUE DÉTAIL
                        <div className="flex h-full flex-col">
                            <button
                                onClick={() => setViewedItem(null)}
                                className="text-muted hover:text-brand-emerald mb-2 flex items-center gap-2 text-xs font-bold uppercase transition-colors"
                            >
                                <ArrowLeftIcon className="h-4 w-4" /> Retour à la liste
                            </button>
                            <InventoryItemDetails item={viewedItem} variant="primary" />
                        </div>
                    ) : (
                        // VUE GRILLE
                        <div className="flex flex-col gap-4">
                            {inventoryItems.length > 0 ? (
                                <InventoryGrid
                                    items={inventoryItems}
                                    onSlotClick={setViewedItem}
                                    variant="primary"
                                />
                            ) : (
                                <div className="border-border bg-surface flex flex-col items-center justify-center space-y-2 rounded-lg border border-dashed py-12 text-center opacity-50">
                                    <FolderOpenIcon className="h-12 w-12" />
                                    <p className="font-mono text-sm">Aucune preuve collectée.</p>
                                    <p className="text-xs">
                                        Utilisez le SCANNER pour analyser l'environnement.
                                    </p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}

            {/* nav en bas */}
            <div className="border-border bg-surface fixed right-0 bottom-0 left-0 z-40 border-t px-2 py-3">
                <div className="mx-auto flex max-w-md items-center justify-around gap-2">
                    <NavButton
                        active={currentTab === 'home'}
                        onClick={() => onTabChange('home')}
                        icon={CommandLineIcon}
                        label="Terminal"
                        highlight={highlightedElement === 'nav_home'}
                    />
                    <NavButton
                        active={currentTab === 'modules'}
                        onClick={() => onTabChange('modules')}
                        icon={CpuChipIcon}
                        label="Modules"
                        highlight={highlightedElement === 'nav_modules'}
                    />
                    <NavButton
                        active={currentTab === 'evidence'}
                        onClick={() => onTabChange('evidence')}
                        icon={FolderOpenIcon}
                        label="Preuves"
                        highlight={highlightedElement === 'nav_evidence'}
                    />
                    {isHost && (
                        <NavButton
                            active={currentTab === 'admin'}
                            onClick={() => onTabChange('admin')}
                            icon={ShieldCheckIcon}
                            label="Admin"
                            isAdmin
                        />
                    )}
                </div>
            </div>
        </>
    );
}

interface NavButtonProps {
    active: boolean;
    onClick: () => void;
    icon: React.ElementType;
    label: string;
    highlight?: boolean | null;
    isAdmin?: boolean;
}

const NavButton = ({
    active,
    onClick,
    icon: Icon,
    label,
    highlight,
    isAdmin = false,
}: NavButtonProps) => (
    <button
        onClick={onClick}
        className={clsx(
            'flex flex-1 flex-col items-center justify-center rounded p-2 transition-colors',
            active
                ? isAdmin
                    ? 'bg-brand-purple/20 text-brand-purple'
                    : 'bg-surface-highlight'
                : 'text-muted',
            highlight && 'ring-brand-purple text-brand-purple animate-pulse ring-1'
        )}
    >
        <Icon className="mb-1 h-6 w-6" />
        <span className="text-xs font-bold uppercase">{label}</span>
    </button>
);
