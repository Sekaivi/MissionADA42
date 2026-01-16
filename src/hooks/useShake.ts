import { useCallback, useEffect, useRef, useState } from 'react';

interface UseShakeOptions {
    threshold?: number; // force du mouvement
    timeout?: number; // anti-spam après un succès
    minShakes?: number; // nombre de mouvements consécutifs requis
    shakeWindow?: number; // temps max pour enchainer les minShakes
}

export const useShake = (
    onShake: () => void,
    { threshold = 15, timeout = 1000, minShakes = 3, shakeWindow = 1000 }: UseShakeOptions = {}
) => {
    const [permissionGranted, setPermissionGranted] = useState(false);

    // physique
    const lastX = useRef(0);
    const lastY = useRef(0);
    const lastZ = useRef(0);

    // comptage
    const lastUpdate = useRef(0);
    const shakeCount = useRef(0);
    const lastShakeEvent = useRef(0);

    const requestPermission = useCallback(async () => {
        if (
            typeof DeviceMotionEvent !== 'undefined' &&
            // @ts-expect-error : méthode spécifique iOS non standardisée
            typeof DeviceMotionEvent.requestPermission === 'function'
        ) {
            try {
                // @ts-expect-error : méthode spécifique iOS non standardisée
                const response = await DeviceMotionEvent.requestPermission();
                if (response === 'granted') {
                    setPermissionGranted(true);
                }
            } catch (error) {
                console.error(error);
            }
        } else {
            setPermissionGranted(true);
        }
    }, []);

    const handleMotion = useCallback(
        (event: DeviceMotionEvent) => {
            const current = event.accelerationIncludingGravity;
            if (!current) return;

            const currentTime = Date.now();
            // fréquence de calcul toutes les 100ms max pour éviter de compter trop de micro-pics
            if (currentTime - lastUpdate.current < 100) {
                return;
            }

            const x = current.x || 0;
            const y = current.y || 0;
            const z = current.z || 0;

            const deltaX = Math.abs(lastX.current - x);
            const deltaY = Math.abs(lastY.current - y);
            const deltaZ = Math.abs(lastZ.current - z);

            // vitesse actuelle
            const speed = deltaX + deltaY + deltaZ;

            if (speed > threshold) {
                // reset compteur si on a attendu trop longtemps depuis le dernier mouvement
                if (currentTime - lastUpdate.current > shakeWindow) {
                    shakeCount.current = 0;
                }

                shakeCount.current += 1;
                lastUpdate.current = currentTime;

                // nombre de mouvements requis atteint
                if (shakeCount.current >= minShakes) {
                    const timeSinceLastEvent = currentTime - lastShakeEvent.current;

                    // hors du cooldown
                    if (timeSinceLastEvent > timeout) {
                        lastShakeEvent.current = currentTime;
                        shakeCount.current = 0; // reset
                        onShake();
                    }
                }
            }

            lastX.current = x;
            lastY.current = y;
            lastZ.current = z;
        },
        [onShake, threshold, timeout, minShakes, shakeWindow]
    );

    useEffect(() => {
        if (permissionGranted) {
            window.addEventListener('devicemotion', handleMotion);
        }
        return () => {
            window.removeEventListener('devicemotion', handleMotion);
        };
    }, [permissionGranted, handleMotion]);

    return { requestPermission, permissionGranted };
};
