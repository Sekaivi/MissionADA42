import React from 'react';

interface PasswordInputProps {
    value: string;
    onChange: (val: string) => void;
    isLocked: boolean;
}

export const PasswordInput = ({ value, onChange, isLocked }: PasswordInputProps) => (
    <div className="relative mb-8 w-full max-w-md">
        <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            disabled={isLocked}
            placeholder="ENTER_PASSWORD..."
            className="border-brand-emerald w-full border-b-2 bg-black p-4 font-mono text-2xl text-white transition-all outline-none placeholder:text-white/20 focus:border-white focus:bg-white/5"
            autoComplete="off"
            spellCheck={false}
        />
        <div className="text-muted absolute top-1/2 right-2 -translate-y-1/2 text-xs">
            CHARS: {value.length}
        </div>
    </div>
);
