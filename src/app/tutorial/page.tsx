'use client';
import React, { useState } from 'react';

import { useRouter } from 'next/navigation';

import { AnimatePresence, motion } from 'framer-motion';

// Imports des jeux
import CodeGame from '@/components/Tutorial/CodeGame';
import CompassGame from '@/components/Tutorial/CompassGame';
import { FaceDetectionModule } from '@/components/Tutorial/FaceDetectionModule';
import MicroGame from '@/components/Tutorial/MicroGame';
import NetworkGame from '@/components/Tutorial/NetworkGame';
import SystemCheck from '@/components/Tutorial/systemCheck';
// Imports UI
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';

export default function Tutoriel() {
    const router = useRouter();
    const TOTAL_STEPS = 5;
    const [step, setStep] = useState(0);

    const handleNextStep = () => {
        // Scroll en haut de page automatiquement quand on change d'étape
        window.scrollTo({ top: 0, behavior: 'smooth' });
        setStep((prev) => (prev <= TOTAL_STEPS ? prev + 1 : prev));
    };

    const handleFinish = () => router.push('/home');

    return (
        // CORRECTION 1 : on remplace overflow-hidden par overflow-y-auto et min-h-screen
        // On ajoute py-8 pour laisser de l'espace en haut et en bas sur mobile
        <main className="relative flex min-h-screen w-full flex-col items-center justify-center overflow-x-hidden overflow-y-auto bg-gray-50 p-6 py-12 font-sans md:p-12">
            {/* Background (inchangé) */}
            <div className="pointer-events-none fixed inset-0 z-0 opacity-5">
                <div className="absolute top-10 left-10 h-64 w-64 rounded-full bg-blue-500 blur-3xl"></div>
                <div className="absolute right-10 bottom-10 h-96 w-96 rounded-full bg-purple-500 blur-3xl"></div>
            </div>

            {/* Barre de Progression (inchangée) */}
            {step > 0 && step <= TOTAL_STEPS && (
                <div className="z-10 mb-8 h-2 w-full max-w-xl shrink-0 overflow-hidden rounded-full bg-gray-200">
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
                <Card
                    key={step}
                    // CORRECTION 2 : On s'assure que la card peut grandir si le contenu est long (h-auto)
                    // On garde le centrage du texte
                    className="z-10 flex h-auto min-h-[300px] w-full max-w-xl flex-col items-center justify-center text-center"
                    initial={{ opacity: 0, x: 50, scale: 0.95 }}
                    animate={{ opacity: 1, x: 0, scale: 1 }}
                    exit={{ opacity: 0, x: -50, scale: 0.95 }}
                    transition={{ duration: 0.3 }}
                >
                    {step === 0 && <SystemCheck onSuccess={handleNextStep} onFail={handleFinish} />}
                    {step === 1 && <FaceDetectionModule onSolve={handleNextStep} />}
                    {step === 2 && <MicroGame onSuccess={handleNextStep} />}
                    {step === 3 && <CompassGame onSuccess={handleNextStep} />}
                    {step === 4 && <CodeGame onSuccess={handleNextStep} />}
                    {step === 5 && <NetworkGame onSuccess={handleNextStep} />}

                    {/* Écran Final */}
                    {step > TOTAL_STEPS && (
                        <div className="flex w-full flex-col items-center">
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-green-100 text-4xl shadow-lg shadow-green-200"
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
                </Card>
            </AnimatePresence>

            {/* Debug (inchangé) */}
            {step <= TOTAL_STEPS && (
                <button
                    onClick={handleNextStep}
                    className="z-10 mt-8 shrink-0 text-xs text-gray-400 underline hover:text-gray-600"
                >
                    (Debug: Passer l'étape {step})
                </button>
            )}
        </main>
    );
}
