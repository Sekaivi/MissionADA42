// src/components/LocalThemeContext.tsx
'use client';

import { createContext, useContext } from 'react';

// par défaut 'light'
const LocalThemeContext = createContext<'light' | 'dark'>('light');

export const useLocalTheme = () => useContext(LocalThemeContext);

export const LocalThemeProvider = ({
                                       children,
                                       value
                                   }: {
    children: React.ReactNode;
    value: 'light' | 'dark'
}) => {
    return (
        <LocalThemeContext.Provider value={value}>
            {children}
        </LocalThemeContext.Provider>
    );
};