'use client';
import { FaceDetectionModule } from '@/components/Tutorial/FaceDetectionModule';
import { AlphaHeader } from '@/components/alpha/AlphaHeader';

export default function FaceDetector() {
    return (
        <>
            <AlphaHeader title={'Module de reconnaissance faciale'} />
            <FaceDetectionModule
                onSolve={() =>
                    window.alert(
                        "Bravo, vous avez validé le module ! On peut passer à l'étape suivante !"
                    )
                }
            />
        </>
    );
}
