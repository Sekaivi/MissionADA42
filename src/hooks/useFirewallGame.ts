'use client';

import { useEffect, useRef, useState } from 'react';

interface FirewallLogicProps {
    isActive: boolean;
    isStable: boolean;
    isBlowing: boolean;
    onWin: () => void;
}

export function useFirewallLogic({ isActive, isStable, isBlowing, onWin }: FirewallLogicProps) {
    const [temp, setTemp] = useState(200);

    const stateRef = useRef({ isStable, isBlowing, onWin, isActive });

    useEffect(() => {
        stateRef.current = { isStable, isBlowing, onWin, isActive };
    });
    useEffect(() => {
        if (!isActive) return;

        const gameLoop = setInterval(() => {
            if (!stateRef.current.isActive) return;

            setTemp((prev) => {
                const { isStable: s, isBlowing: b, onWin: win } = stateRef.current;

                let nextTemp = prev + 0.1;

                if (s && b) {
                    nextTemp -= 0.6;
                }

                if (nextTemp <= 50) {
                    win();
                    return 50;
                }

                return nextTemp;
            });
        }, 100);

        return () => {
            clearInterval(gameLoop);
        };
    }, [isActive]); // On ne dépend QUE de isActive

    return { temp };
}
