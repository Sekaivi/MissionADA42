import React from 'react';

import { CheckCircleIcon, MinusCircleIcon, XCircleIcon } from '@heroicons/react/24/solid';

import { PasswordRule, RuleStatus } from '@/types/passwordGame';

interface RuleItemProps {
    rule: PasswordRule;
    status: RuleStatus;
}

export const RuleItem = ({ rule, status }: RuleItemProps) => {
    let borderColor = 'border-muted/20';
    let bgColor = 'bg-surface/5';
    let textColor = 'text-muted';
    let Icon = MinusCircleIcon;

    if (status === 'valid') {
        borderColor = 'border-brand-emerald';
        bgColor = 'bg-brand-emerald/10';
        textColor = 'text-brand-emerald';
        Icon = CheckCircleIcon;
    } else if (status === 'invalid') {
        borderColor = 'border-brand-error';
        bgColor = 'bg-brand-error/10';
        textColor = 'text-brand-error';
        Icon = XCircleIcon;
    }

    return (
        <div
            className={`mb-3 w-full border-l-4 p-4 transition-all duration-300 ease-in-out ${borderColor} ${bgColor}`}
        >
            <div className="flex items-start justify-between">
                <h3 className={`font-bold tracking-wider uppercase ${textColor}`}>
                    RULE {rule.id}
                </h3>
                <Icon className={`h-6 w-6 ${textColor}`} />
            </div>
            <p
                className={`mt-1 font-mono text-sm ${
                    status === 'pending' ? 'text-muted' : 'text-foreground'
                }`}
            >
                {rule.description}
            </p>
        </div>
    );
};
