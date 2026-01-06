'use client';
import React, { useState } from 'react';

import { useRouter } from 'next/navigation';

import { AnimatePresence, motion } from 'framer-motion';

import CameraGame from '@/components/Tutoriel/CameraGame';
import CodeGame from '@/components/Tutoriel/CodeGame';
import CompassGame from '@/components/Tutoriel/CompassGame';
import MicroGame from '@/components/Tutoriel/MicroGame';
import NetworkGame from '@/components/Tutoriel/NetworkGame';
import SystemCheck from '@/components/Tutoriel/systemCheck';
import Button from '@/components/ui/Button';

export default function Tutoriel() {
    const router = useRouter();
    const TOTAL_STEPS = 5;
    const [step, setStep] = useState(0);

    const handleNextStep = () => {
        setStep((prevStep) => {
            if (prevStep <= TOTAL_STEPS) {
                return prevStep + 1;
            }
            return prevStep;
        });
    };

    const handleFinish = () => {
        // Redirige vers l'accueil (utilisé à la fin OU en cas d'échec)
        router.push('/home');
    };

    return (
        <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden p-6 font-sans">
            {/* Background */}
            <div className="pointer-events-none absolute inset-0 z-0 opacity-5">
                <div className="absolute top-10 left-10 h-64 w-64 rounded-full bg-blue-500 blur-3xl"></div>
                <div className="absolute right-10 bottom-10 h-96 w-96 rounded-full bg-purple-500 blur-3xl"></div>
            </div>

            {/* Barre de Progression (Cachée à l'étape 0) */}
            {step > 0 && step <= TOTAL_STEPS && (
                <div className="z-10 mb-8 h-2 w-full max-w-xl overflow-hidden rounded-full bg-gray-200">
                    <motion.div
                        className="h-full bg-gradient-to-r from-blue-500 to-purple-600"
                        initial={{ width: 0 }}
                        animate={{ width: `${((step - 1) / TOTAL_STEPS) * 100}%` }}
                        transition={{ duration: 0.5 }}
                    />
                </div>
            )}

            {/* Zone de Contenu */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={step}
                    initial={{ opacity: 0, x: 50, scale: 0.95 }}
                    animate={{ opacity: 1, x: 0, scale: 1 }}
                    exit={{ opacity: 0, x: -50, scale: 0.95 }}
                    transition={{ duration: 0.3 }}
                    className="z-10 w-full max-w-xl rounded-3xl border border-white/60 bg-white/80 p-8 shadow-2xl backdrop-blur-xl"
                >
                    {/* MODIFICATION ICI :
                        On passe handleFinish à onFail.
                        Si ça rate, ça renvoie à l'accueil.
                    */}
                    {step === 0 && <SystemCheck onSuccess={handleNextStep} onFail={handleFinish} />}

                    {step === 1 && <CameraGame onSuccess={handleNextStep} />}
                    {step === 2 && <MicroGame onSuccess={handleNextStep} />}
                    {step === 3 && <CompassGame onSuccess={handleNextStep} />}
                    {step === 4 && <CodeGame onSuccess={handleNextStep} />}
                    {step === 5 && <NetworkGame onSuccess={handleNextStep} />}

                    {/* Écran Final */}
                    {step > TOTAL_STEPS && (
                        <div className="py-6 text-center">
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-green-100 text-4xl shadow-lg shadow-green-200"
                            >
                                🚀
                            </motion.div>
                            <h2 className="mb-4 text-3xl font-bold text-gray-800">AGENT PRÊT</h2>
                            <p className="mb-8 text-gray-600">
                                Calibrage terminé avec succès.
                                <br />
                                Bienvenue dans l'équipe Ada42.
                            </p>
                            <div className="transform transition-transform duration-200 hover:scale-105">
                                <Button onClick={handleFinish}>LANCER LA MISSION</Button>
                            </div>
                        </div>
                    )}
                </motion.div>
            </AnimatePresence>

            {/* Debug */}
            {step <= TOTAL_STEPS && (
                <button
                    onClick={handleNextStep}
                    className="z-10 mt-8 text-xs text-gray-400 underline hover:text-gray-600"
                >
                    (Debug: Passer l'étape {step})
                </button>
            )}
        </main>
    );
}
