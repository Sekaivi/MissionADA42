import React from 'react';

interface GameHudProps {
    levelCount: number;
    gyroActive: boolean;
}

export const GameHud = ({ levelCount, gyroActive }: GameHudProps) => (
    <div className="border-muted mb-2 flex w-[90%] justify-between border-b pb-1 text-sm">
        <span>SEC_LEVEL: {levelCount}</span>
        <span className={`${gyroActive ? 'text-brand-emerald font-bold' : 'text-muted'}`}>
            GYRO: {gyroActive ? 'ON' : 'OFF'}
        </span>
    </div>
);

// --- 4. TARGET SLOT & 5. CODE BLOCK ---
// (Ces composants restent identiques à la version précédente)
interface TargetSlotProps {
    index: number;
    isSnapReady: boolean;
    top: number;
}
export const TargetSlot = ({ index, isSnapReady, top }: TargetSlotProps) => (
    <div
        className={`absolute left-1/2 flex h-[40px] w-[280px] -translate-x-1/2 items-center border border-dashed pl-2 transition-colors duration-200 ${isSnapReady ? 'border-yellow-400 bg-yellow-400/10' : 'border-brand-emerald/30 bg-surface/10'} `}
        style={{ top: `${top}px` }}
    >
        <span className="mr-2 opacity-30">{index + 1}</span>
    </div>
);

interface CodeBlockProps {
    id: number;
    text: string;
    x: number;
    y: number;
    isLocked: boolean;
    isActive: boolean;
    onSelect: () => void;
}
export const CodeBlock = ({ id, text, x, y, isLocked, isActive, onSelect }: CodeBlockProps) => (
    <div
        id={`block-${id}`}
        onTouchStart={(e) => {
            e.stopPropagation();
            onSelect();
        }}
        onClick={(e) => {
            e.stopPropagation();
            onSelect();
        }}
        className={`absolute flex h-[40px] w-[280px] cursor-pointer items-center border pl-2 text-lg transition-colors ${
            isLocked
                ? 'border-brand-emerald bg-brand-emerald/20 z-0 text-white shadow-[0_0_10px_var(--color-brand-emerald)]'
                : isActive
                  ? 'bg-surface-highlight z-50 border-white shadow-[0_0_15px_white]'
                  : 'border-brand-emerald bg-surface z-10'
        } `}
        style={isActive ? {} : { transform: `translate(${x}px, ${y}px)` }}
    >
        {text}
    </div>
);
