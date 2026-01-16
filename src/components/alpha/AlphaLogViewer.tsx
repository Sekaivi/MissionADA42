// src/components/alpha/AlphaLogViewer.tsx
import React, { useEffect, useRef } from 'react';

import { TrashIcon } from '@heroicons/react/24/outline';

import { AlphaTerminalWrapper } from '@/components/alpha/AlphaTerminalWrapper';

interface AlphaLogViewerProps {
    logs: string[];
    onClear: () => void;
    emptyMessage?: string;
    maxHeight?: string;
}

export const AlphaLogViewer = ({
    logs,
    onClear,
    emptyMessage = 'Aucun événement...',
    maxHeight = 'h-40',
}: AlphaLogViewerProps) => {
    const containerRef = useRef<HTMLDivElement>(null);

    // auto-scroll vers le bas si nouveau log
    useEffect(() => {
        if (containerRef.current) {
            containerRef.current.scrollTo({
                top: containerRef.current.scrollHeight,
                behavior: 'smooth',
            });
        }
    }, [logs]);

    return (
        <AlphaTerminalWrapper className={'relative'}>
            <div
                ref={containerRef}
                className={`overflow-y-auto rounded font-mono text-xs ${maxHeight}`}
            >
                {logs.length === 0 ? (
                    <p className="text-muted py-4 text-center italic">{emptyMessage}</p>
                ) : (
                    logs.map((log, i) => (
                        <div
                            key={i}
                            className="text-brand-emerald border-border mb-1 border-b pb-1 break-all last:border-0"
                        >
                            <span className="mr-2 opacity-40">[{i + 1}]</span>
                            {log}
                        </div>
                    ))
                )}
            </div>

            {logs.length > 0 && (
                <button
                    onClick={onClear}
                    className="bg-surface hover:bg-brand-error/50 text-muted hover:text-brand-error absolute top-2 right-2 rounded p-1 transition-colors"
                    title="Effacer les logs"
                >
                    <TrashIcon className="h-4 w-4" />
                </button>
            )}
        </AlphaTerminalWrapper>
    );
};
