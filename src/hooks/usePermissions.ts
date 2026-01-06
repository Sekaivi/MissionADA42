import { useEffect, useState } from 'react';

type PermissionStatus = 'idle' | 'granted' | 'denied' | 'error';

// Interface pour gérer la spécificité iOS sans utiliser 'any'
interface DeviceOrientationEventiOS extends DeviceOrientationEvent {
    requestPermission?: () => Promise<'granted' | 'denied'>;
}

export default function usePermissions() {
    const [cameraStatus, setCameraStatus] = useState<PermissionStatus>('idle');
    const [microStatus, setMicroStatus] = useState<PermissionStatus>('idle');
    const [motionStatus, setMotionStatus] = useState<PermissionStatus>('idle');

    useEffect(() => {
        // Initialisation vide pour satisfaire le linter si besoin
    }, []);

    const requestMediaPermissions = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
            // On coupe tout de suite, on voulait juste la permission
            stream.getTracks().forEach((track) => track.stop());
            setCameraStatus('granted');
            setMicroStatus('granted');
            return true;
        } catch (err) {
            console.error('Erreur permissions média:', err);
            setCameraStatus('denied');
            setMicroStatus('denied');
            return false;
        }
    };

    const requestMotionPermissions = async () => {
        // On force le type ici de manière sécurisée
        const requestPermission = (DeviceOrientationEvent as unknown as DeviceOrientationEventiOS)
            .requestPermission;

        if (typeof requestPermission === 'function') {
            try {
                const permissionState = await requestPermission();
                if (permissionState === 'granted') {
                    setMotionStatus('granted');
                    return true;
                } else {
                    setMotionStatus('denied');
                    return false;
                }
            } catch (error) {
                console.error(error);
                setMotionStatus('error');
                return false;
            }
        } else {
            // Android ou non-iOS 13+
            setMotionStatus('granted');
            return true;
        }
    };

    const requestAll = async () => {
        const mediaOk = await requestMediaPermissions();
        const motionOk = await requestMotionPermissions();
        return mediaOk && motionOk;
    };

    return {
        cameraStatus,
        microStatus,
        motionStatus,
        requestAll,
    };
}
