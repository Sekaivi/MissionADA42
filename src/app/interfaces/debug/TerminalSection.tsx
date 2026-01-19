import React from 'react';

type TerminalSectionProps = {
    label: string;
    children: React.ReactNode;
    className?: string;
};

const TerminalSection = ({ label, children, className = '' }: TerminalSectionProps) => (
    <div className={`border-border border-t border-dashed pt-2 ${className}`}>
        <div className="text-border mb-3 flex items-center gap-2 text-xs tracking-widest uppercase">
            <span className="text-brand-error">Input</span>
            <span>::</span>
            <span>{label}</span>
        </div>
        {children}
    </div>
);

export default TerminalSection;
