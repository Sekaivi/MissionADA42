import React from 'react';

export type ButtonProps = {
    onClick: () => void;
    children: React.ReactNode;
};

export default function Button({ onClick, children, ...props }: ButtonProps) {
    return (
        <button className="bouton" onClick={onClick} {...props}>
            {children}
        </button>
    );
}
