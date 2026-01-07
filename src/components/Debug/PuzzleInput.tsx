import React from 'react';

import { motion } from 'framer-motion';

interface PuzzleInputProps {
    label: string;
    placeholder: string;
    value: string;
    onChange: (val: string) => void;
    onSubmit: () => void;
    status: 'locked' | 'active' | 'solved';
}

export default function PuzzleInput({
    label,
    placeholder,
    value,
    onChange,
    onSubmit,
    status,
}: PuzzleInputProps) {
    const isLocked = status === 'locked';
    const isSolved = status === 'solved';

    return (
        <div
            className={`relative mb-4 rounded-xl border p-4 transition-all duration-500 ${
                isSolved
                    ? 'border-green-500 bg-green-900/30'
                    : isLocked
                      ? 'border-gray-800 bg-gray-900/50 opacity-50'
                      : 'border-green-600 bg-[#063506]'
            }`}
        >
            <div className="mb-2 flex items-center justify-between">
                <label className="flex items-center gap-2 text-sm font-bold tracking-widest text-green-200 uppercase">
                    {isLocked && <span>🔒</span>}
                    {label}
                </label>
                {isSolved && (
                    <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="text-xs font-bold text-green-400"
                    >
                        ✅ DÉVERROUILLÉ
                    </motion.span>
                )}
            </div>

            <div className="relative">
                <input
                    type="text"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && !isLocked && !isSolved && onSubmit()}
                    className={`w-full rounded-lg px-3 py-2 font-mono text-green-300 uppercase placeholder-green-700/50 transition-all outline-none ${
                        isLocked
                            ? 'cursor-not-allowed bg-black'
                            : 'bg-[#0b4d0b] focus:ring-2 focus:ring-green-500'
                    }`}
                    placeholder={isLocked ? 'Verrouillé par le niveau précédent' : placeholder}
                    disabled={isLocked || isSolved}
                />
                {!isLocked && !isSolved && value.length > 0 && (
                    <button
                        onClick={onSubmit}
                        className="absolute top-1/2 right-2 -translate-y-1/2 rounded bg-green-700 px-2 py-1 text-xs text-white hover:bg-green-600"
                    >
                        OK
                    </button>
                )}
            </div>
        </div>
    );
}
