import React from 'react';

export type ButtonProps = {
    onClick?: () => void;
    children: React.ReactNode;
    disabled?: boolean;
};

export default function Button({ onClick, children, disabled, ...props }: ButtonProps) {
    return (
        <button onClick={onClick} disabled={disabled} {...props}>
            {children}
        </button>
    );
}
