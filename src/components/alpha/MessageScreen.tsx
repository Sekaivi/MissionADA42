import React from 'react';

interface MessageScreenProps {
    type: 'win' | 'breach' | 'lockdown';
    onAction: () => void;
}

export const MessageScreen = ({ type, onAction }: MessageScreenProps) => {
    let title = '';
    let detail = '';
    let buttonText = '';
    let colorClass = '';

    switch (type) {
        case 'win':
            title = 'ACCESS GRANTED';
            detail = 'Root privileges acquired.\nSystem unlocked.';
            buttonText = 'EXIT_SYSTEM()';
            colorClass = 'text-brand-emerald';
            break;
        case 'breach':
            title = '/// SECURITY BREACH ///';
            detail = 'Firewall counter-measures detected.\nCode complexity increased.';
            buttonText = 'RETRY_CONNECT()';
            colorClass = 'text-brand-error animate-pulse';
            break;
        case 'lockdown':
            title = 'SYSTEM LOCKDOWN';
            detail = 'Too many failed attempts.\nSystem requires manual reboot.';
            buttonText = 'REBOOT_SYSTEM()';
            colorClass = 'text-brand-error';
            break;
    }

    return (
        <div className="bg-background/95 absolute inset-0 z-50 flex flex-col items-center justify-center">
            <h1
                className={`mb-4 text-5xl ${colorClass} ${type === 'breach' ? 'glitch-effect' : ''}`}
            >
                {title}
            </h1>
            <p
                className={`mb-8 text-center whitespace-pre-wrap ${type === 'win' ? 'text-brand-emerald' : 'text-brand-error'}`}
            >
                {detail}
            </p>
            <button
                onClick={onAction}
                className={`border-2 px-8 py-3 uppercase ${type === 'win' ? 'border-brand-emerald text-brand-emerald' : 'border-brand-error text-brand-error'}`}
            >
                {buttonText}
            </button>
        </div>
    );
};
