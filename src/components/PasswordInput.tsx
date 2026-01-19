import React from 'react';

import { AlphaInput } from '@/components/alpha/AlphaInput';

interface PasswordInputProps {
    value: string;
    onChange: (val: string) => void;
    isLocked: boolean;
}

export const PasswordInput = ({ value, onChange, isLocked }: PasswordInputProps) => (
    <div className="relative mb-8 w-full max-w-md">
        <AlphaInput
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            disabled={isLocked}
            placeholder="ENTER_PASSWORD..."
            autoComplete="off"
            spellCheck={false}
        />
        <div className="text-muted absolute top-1/2 right-2 -translate-y-1/2 text-xs">
            CHARS: {value.length}
        </div>
    </div>
);
