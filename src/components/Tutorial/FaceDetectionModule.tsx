'use client';

import React, { useEffect, useRef, useState } from 'react';

import { ArrowPathIcon, CheckCircleIcon, UserIcon } from '@heroicons/react/24/solid';
import { motion } from 'framer-motion';

import { AlphaButton } from '@/components/alpha/AlphaButton';
import { AlphaError } from '@/components/alpha/AlphaError';
import AlphaFeedbackPill from '@/components/alpha/AlphaFeedbackPill';
import { AlphaModal } from '@/components/alpha/AlphaModal';
import { AlphaVideoContainer } from '@/components/alpha/AlphaVideoContainer';
import { PuzzleProps } from '@/components/puzzles/PuzzleRegistry';
import { SCENARIO } from '@/data/alphaScenario';
import { useCamera } from '@/hooks/useCamera';

export const FaceDetectionModule: React.FC<PuzzleProps> = ({ onSolve, isSolved }) => {
    const { videoRef, error: cameraError, toggleCamera, activeFacingMode } = useCamera();

    const faceApiRef = useRef<typeof import('@vladmandic/face-api') | null>(null);

    const [isModelLoaded, setIsModelLoaded] = useState(false);
    const [detectionError, setDetectionError] = useState<string>('');
    const [feedbackMsg, setFeedbackMsg] = useState('Initialisation des capteurs...');
    const [isValidating, setIsValidating] = useState(false);

    // chargement dynamique côté client
    useEffect(() => {
        let isMounted = true;

        const initFaceApi = async () => {
            try {
                const faceapi = await import('@vladmandic/face-api');
                faceApiRef.current = faceapi;

                const MODEL_URL = '/models';
                await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL);

                if (isMounted) {
                    setIsModelLoaded(true);
                    setFeedbackMsg('Veuillez présenter votre visage');
                }
            } catch (err) {
                console.error('Erreur FaceAPI:', err);
                if (isMounted) {
                    setDetectionError('Erreur : Module IA incompatible ou fichiers manquants.');
                }
            }
        };

        const t = setTimeout(initFaceApi, 100);

        return () => {
            isMounted = false;
            clearTimeout(t);
        };
    }, []);

    // boucle de détection
    useEffect(() => {
        if (!isModelLoaded || !videoRef.current || isValidating || !faceApiRef.current) return;

        const faceapi = faceApiRef.current;

        const interval = setInterval(async () => {
            // si la caméra est en train de switch
            if (
                !videoRef.current ||
                videoRef.current.paused ||
                videoRef.current.ended ||
                videoRef.current.readyState < 2
            )
                return;

            try {
                const options = new faceapi.TinyFaceDetectorOptions({
                    inputSize: 224,
                    scoreThreshold: 0.6,
                });

                const detection = await faceapi.detectSingleFace(videoRef.current, options);

                if (detection) {
                    setIsValidating(true);
                    setFeedbackMsg('Visage identifié avec succès !');
                    clearInterval(interval);
                    setTimeout(() => onSolve(), SCENARIO.defaultTimeBeforeNextStep);
                }
            } catch {
                // erreurs silencieuses
            }
        }, 500);

        return () => clearInterval(interval);
    }, [isModelLoaded, videoRef, isValidating, onSolve]);

    if (isSolved) {
        return (
            <div className="border-brand-emerald bg-brand-emerald/20 rounded-xl border p-6 text-center">
                <CheckCircleIcon className="text-brand-emerald mx-auto mb-4 h-16 w-16" />
                <h2 className="text-brand-emerald text-xl font-bold">
                    IDENTITÉ BIOMÉTRIQUE CONFIRMÉE
                </h2>
            </div>
        );
    }

    if (cameraError || detectionError)
        return <AlphaError message={cameraError || detectionError} />;

    return (
        <div className="space-y-6">
            <AlphaModal
                isOpen={isValidating}
                variant="success"
                title="SÉCURITÉ BIOMÉTRIQUE"
                message="Identité Confirmée"
                subMessage="Le module a été validé ! On peut passer à la suite !"
                Icon={UserIcon}
                autoCloseDuration={SCENARIO.defaultTimeBeforeNextStep}
                durationUnit={'ms'}
            />

            <AlphaFeedbackPill
                message={feedbackMsg}
                isLoading={!isModelLoaded}
                type={isValidating ? 'success' : 'info'}
            />

            <AlphaVideoContainer videoRef={videoRef} isMirrored={activeFacingMode === 'user'}>
                <div className={'absolute top-4 right-4'}>
                    <AlphaButton onClick={toggleCamera} variant="primary" className="!p-2">
                        <ArrowPathIcon className="h-5 w-5" />
                    </AlphaButton>
                </div>

                {/* effet de scan si l'ia tourne */}
                {!isValidating && isModelLoaded && (
                    <>
                        <motion.div
                            className="border-brand-blue/60 to-brand-blue/20 pointer-events-none absolute inset-0 z-10 border-b-2 bg-gradient-to-b from-transparent"
                            animate={{ top: ['-10%', '110%'] }}
                            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                        />
                        <div className="border-brand-blue/30 pointer-events-none absolute inset-0 z-0 m-8 rounded-lg border-2 border-dashed" />
                    </>
                )}
            </AlphaVideoContainer>
        </div>
    );
};
