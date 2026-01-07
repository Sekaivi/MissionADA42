import { PasswordRule, RuleStatus } from '@/types/passwordGame';

interface RuleItemProps {
    rule: PasswordRule;
    status: RuleStatus;
}

export const RuleItem = ({ rule, status }: RuleItemProps) => {
    let borderColor = 'border-muted/20';
    let bgColor = 'bg-surface/5';
    let icon = '○'; // Pending
    let textColor = 'text-muted';

    if (status === 'valid') {
        borderColor = 'border-brand-emerald';
        bgColor = 'bg-brand-emerald/10';
        icon = '✓';
        textColor = 'text-brand-emerald';
    } else if (status === 'invalid') {
        borderColor = 'border-brand-error';
        bgColor = 'bg-brand-error/10';
        icon = '✕';
        textColor = 'text-brand-error';
    }

    return (
        <div
            className={`mb-3 w-full max-w-md border-l-4 p-4 transition-all duration-300 ease-in-out ${borderColor} ${bgColor}`}
        >
            <div className="flex items-start justify-between">
                <h3 className={`font-bold tracking-wider uppercase ${textColor}`}>
                    RULE {rule.id}
                </h3>
                <span className={`font-mono text-lg ${textColor}`}>{icon}</span>
            </div>
            <p
                className={`mt-1 font-mono text-sm ${status === 'pending' ? 'text-muted' : 'text-foreground'}`}
            >
                {rule.description}
            </p>
        </div>
    );
};
