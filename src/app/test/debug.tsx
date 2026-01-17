'use client';

import React, { useState } from 'react';

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
import { PlayIcon } from '@heroicons/react/24/solid';
import clsx from 'clsx';

import { AlphaButton } from '@/components/alpha/AlphaButton';
import { AlphaCard } from '@/components/alpha/AlphaCard';
import { AlphaTerminalWrapper } from '@/components/alpha/AlphaTerminalWrapper';
import { ModuleLink } from '@/components/alpha/ModuleLink';
import { useEscapeGame } from '@/context/EscapeGameContext';
import { SCENARIO } from '@/data/alphaScenario';
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
            console.error("Erreur lors de la sauvegarde du départ", e);
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

    return (
        <>
            {/* TAB: TERMINAL */}
            {currentTab === 'home' && (
                <div className="space-y-4">
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
                            <AlphaTerminalWrapper>
                                <div className="space-y-1 font-mono text-xs">
                                    <div className="text-brand-emerald mb-2">
                                        {'>'} SYSTEM_READY...
                                    </div>
                                    {gameLogic?.gameState?.history?.map((entry, i) => (
                                        <div key={i} className="border-border mb-1 border-l-2 pl-2">
                                            <span className="text-muted text-xs">
                                                {new Date(entry.solvedAt).toLocaleTimeString()}
                                            </span>
                                            <div className="text-brand-blue">
                                                [{entry.solverName}] step_{entry.step} OK
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </AlphaTerminalWrapper>
                        </div>
                    </AlphaCard>

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
                </div>
            )}

            {/* TAB: MODULES */}
            {currentTab === 'modules' && (
                <div className="grid grid-cols-1 gap-3">
                    {MODULES.map((mod) => {
                        const isValidated = validatedModules.includes(mod.id);
                        const isLocked = isModuleLocked(mod.id);
                        const isActiveInGame = activeExternalPuzzle === mod.id;
                        return (
                            // TODO: checker ici pour remettre les highlights pendant le tuto
                            // <button key={mod.id} onClick={() => onModuleClick(mod.id)} disabled={isLocked} className={getHighlightClass(mod.id, `flex items-center gap-4 rounded-lg border p-4 text-left transition-all ${isActiveInGame ? 'bg-brand-purple/20 border-brand-purple text-white' : isValidated ? 'bg-brand-emerald/10 border-brand-emerald text-brand-emerald opacity-70' : 'border-white/10 bg-neutral-900 text-neutral-300 hover:bg-white/5'}`)}>
                            //     <mod.icon className="h-8 w-8 flex-shrink-0" />
                            //     <div className="flex-1">
                            //         <div className="flex items-center gap-2 text-sm font-bold">
                            //             {mod.label}
                            //             {isValidated && !isActiveInGame && <CheckCircleIcon className="text-brand-emerald h-4 w-4" />}
                            //             {isActiveInGame && <span className="text-[10px] bg-brand-purple px-1 rounded text-white animate-pulse">REQUIS</span>}
                            //         </div>
                            //         <p className="line-clamp-1 text-xs opacity-60">{mod.description}</p>
                            //     </div>
                            //     {isLocked && <LockClosedIcon className="h-5 w-5 text-neutral-600" />}
                            // </button>
                            <ModuleLink
                                key={mod.id}
                                onClick={() => onModuleClick(mod.id)}
                                title={mod.label}
                                subtitle={mod.description}
                                icon={mod.icon}
                            />
                        );
                    })}
                </div>
            )}

            {/* TAB: ADMIN */}
            {currentTab === 'admin' && isHost && gameLogic && (
                <AlphaCard title="Contrôle Maître du Jeu" className="border-brand-purple">
                    <div className="space-y-6">
                        <div className="bg-brand-purple/10 rounded-lg p-4 text-center">
                            <div className="text-brand-purple text-xs font-bold">État actuel</div>
                            <div className="text-2xl font-black text-white">
                                {gameLogic.currentScenarioStep?.title || 'En attente'}
                            </div>
                            <div className="text-muted text-xs">
                                Étape {gameLogic.gameState?.step || 0} / {SCENARIO.steps.length}
                            </div>
                        </div>
                        <div className="space-y-2">
                            <p className="text-muted text-xs font-bold uppercase">
                                Actions Force Majeure
                            </p>
                            {!validationRequest && (
                                <AlphaButton
                                    onClick={() => gameLogic.initiateNextStep()}
                                    variant="secondary"
                                >
                                    <div className="flex items-center justify-center gap-2">
                                        <PlayIcon className="h-4 w-4" /> SKIPPER L'ÉTAPE (Force)
                                    </div>
                                </AlphaButton>
                            )}
                        </div>
                    </div>
                </AlphaCard>
            )}

            {/* nav en bas */}
            <div className="border-border bg-surface fixed right-0 bottom-0 left-0 z-40 border-t px-2 py-3 pb-8">
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
