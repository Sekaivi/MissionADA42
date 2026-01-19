'use client';

import React, { useEffect, useRef, useState } from 'react';

import clsx from 'clsx';

import { AlphaTerminalWrapper } from '@/components/alpha/AlphaTerminalWrapper';
import { GameLogEntry } from '@/types/game';

interface AlphaLogTerminalProps {
    logs: GameLogEntry[];
    systemMessage?: string;
    className?: string;
}

export const LogTerminal: React.FC<AlphaLogTerminalProps> = ({
    logs,
    systemMessage = 'Système...',
    className,
}) => {
    const scrollRef = useRef<HTMLDivElement>(null);
    const [userHasScrolledUp, setUserHasScrolledUp] = useState(false);

    // gestion du scroll => détecter si l'utilisateur est remonté
    const handleScroll = () => {
        if (!scrollRef.current) return;
        const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;

        // à 20px du bas on considère qu'on suit le flux
        const isAtBottom = scrollHeight - scrollTop - clientHeight < 20;
        setUserHasScrolledUp(!isAtBottom);
    };

    // auto-scroll à chaque nouveau log sauf si l'utilisateur lit l'historique
    useEffect(() => {
        if (!userHasScrolledUp && scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [logs, userHasScrolledUp]);

    const getTypeColor = (type?: string) => {
        switch (type) {
            case 'ADMIN':
                return 'text-brand-purple';
            case 'ERROR':
                return 'text-brand-error';
            case 'WARNING':
                return 'text-brand-yellow';
            case 'SUCCESS':
                return 'text-brand-emerald';
            case 'PLAYER':
                return 'text-brand-blue';
            case 'INFO':
            default:
                return 'text-gray-400';
        }
    };

    return (
        <AlphaTerminalWrapper className={className}>
            <div
                ref={scrollRef}
                onScroll={handleScroll}
                className={clsx(
                    'scrollbar-thin scrollbar-thumb-brand-emerald/20 scrollbar-track-transparent max-h-[200px] overflow-y-auto pr-2'
                )}
            >
                {logs && logs.length > 0 ? (
                    logs.map((log) => (
                        <div
                            key={log.id}
                            className="group flex gap-2 font-mono text-xs opacity-80 transition-opacity hover:opacity-100"
                        >
                            {/* heure */}
                            <span className="text-muted shrink-0 select-none">
                                {new Date(log.timestamp).toLocaleTimeString([], {
                                    hour: '2-digit',
                                    minute: '2-digit',
                                    second: '2-digit',
                                })}
                            </span>

                            {/* type + couleur */}
                            <span
                                className={clsx(
                                    'w-10 shrink-0 text-right font-bold select-none',
                                    getTypeColor(log.type)
                                )}
                            >
                                [{log.type ? log.type.substring(0, 3) : 'SYS'}]
                            </span>

                            {/* message détaillé */}
                            <div className="break-words">
                                <span className="text-muted mr-1">{log.message}</span>
                                {log.details && (
                                    <>
                                        <span className="text-muted mx-1">:</span>
                                        <span className="text-muted">{log.details}</span>
                                    </>
                                )}
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="text-muted flex items-center italic">
                        <span className="mr-2 animate-pulse opacity-50">&gt;</span>
                        {systemMessage}
                    </div>
                )}
            </div>
        </AlphaTerminalWrapper>
    );
};
