import React from 'react';

type FeedbackType = 'success' | 'error' | 'info';

interface FeedbackPillProps {
    message: string;
    type?: FeedbackType;
    isLoading?: boolean;
    className?: string;
    pulse?: boolean;
}

const FeedbackPill: React.FC<FeedbackPillProps> = ({
    message,
    type = 'info',
    isLoading = false,
    pulse = false,
    className,
}) => {
    if (!message) return null;

    const variants = {
        success: 'border-brand-emerald text-brand-emerald bg-brand-emerald/10',
        error: 'border-brand-error text-brand-error bg-brand-red/10',
        info: 'border-brand-blue text-brand-blue bg-brand-blue/20',
    };

    const baseStyles =
        'whitespace-nowrap rounded-full border px-3 py-1 font-mono text-xs font-bold tracking-widest uppercase';

    // si isLoading est vrai, on force le style 'info' et l'animation
    const activeStyle = isLoading
        ? `${variants.info} animate-pulse`
        : pulse
          ? `${variants[type]} animate-pulse`
          : variants[type];

    return (
        <div className={`text-center ${className}`}>
            <span className={`${baseStyles} ${activeStyle}`}>{message}</span>
        </div>
    );
};

export default FeedbackPill;
