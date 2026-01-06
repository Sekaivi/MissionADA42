'use client';
import React, { useState } from 'react';

import { motion } from 'framer-motion';

import usePermissions from '@/hooks/usePermissions';

export default function SystemCheck({
    onSuccess,
    onFail,
}: {
    onSuccess: () => void;
    onFail: () => void;
}) {
    const { cameraStatus, microStatus, motionStatus, requestAll } = usePermissions();
    const [isChecking, setIsChecking] = useState(false);

    // On combine tout en une seule action : "Start Game" = "Ask Permission"
    const handleStartMission = async () => {
        setIsChecking(true);
        await requestAll();
        setIsChecking(false);

        if (cameraStatus !== 'denied' && microStatus !== 'denied') {
            // Augmente le délai à 1000ms (1 seconde) pour laisser le temps
            // au navigateur de libérer les ressources et fermer la popup
            setTimeout(() => {
                onSuccess();
            }, 1000);
        }
    };

    // Si l'utilisateur a refusé, on affiche l'écran d'erreur (inchangé)
    const isDenied =
        cameraStatus === 'denied' || microStatus === 'denied' || motionStatus === 'denied';

    if (isDenied) {
        return (
            <div className="flex w-full max-w-md flex-col items-center text-center">
                <h2 className="mb-4 text-2xl font-bold text-red-600">ACCÈS REFUSÉ</h2>
                <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4">
                    <p className="mb-2 text-sm font-bold text-red-800">
                        L'agent Ada42 ne peut pas travailler à l'aveugle.
                    </p>
                    <p className="text-xs text-red-600">
                        Veuillez autoriser l'accès à la caméra et aux capteurs dans les réglages de
                        votre navigateur (cadenas 🔒 dans la barre d'adresse), puis rechargez la
                        page.
                    </p>
                </div>
                <button
                    onClick={onFail}
                    className="w-full rounded-lg bg-gray-800 py-3 font-bold text-white"
                >
                    RETOUR À L'ACCUEIL
                </button>
            </div>
        );
    }

    // --- L'ÉCRAN D'ACCUEIL (qui cache la demande de permission) ---
    return (
        <div className="relative z-10 flex w-full max-w-md flex-col items-center text-center">
            {/* Logo ou Titre Stylé */}
            <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="mb-8"
            >
                <div className="mx-auto mb-4 flex h-24 w-24 items-center justify-center rounded-2xl bg-blue-600 shadow-lg shadow-blue-500/30">
                    <span className="text-4xl">🕵️‍♂️</span>
                </div>
                <h1 className="text-3xl font-black tracking-tight text-gray-800">
                    MISSION <span className="text-blue-600">ADA42</span>
                </h1>
                <p className="mt-2 text-sm text-gray-500">Protocole d'initialisation requis.</p>
            </motion.div>

            {/* Le bouton "Magique" */}
            <button
                onClick={handleStartMission}
                disabled={isChecking}
                className="group relative w-full"
            >
                <div className="absolute -inset-1 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 opacity-25 blur transition duration-200 group-hover:opacity-75"></div>
                <div
                    className={`relative flex w-full items-center justify-center gap-3 rounded-xl py-5 text-xl font-bold tracking-widest text-white shadow-2xl transition-all ${isChecking ? 'cursor-wait bg-gray-800' : 'bg-gray-900 hover:scale-[1.02] active:scale-95'} `}
                >
                    {isChecking ? (
                        <>
                            <svg
                                className="h-5 w-5 animate-spin text-white"
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                            >
                                <circle
                                    className="opacity-25"
                                    cx="12"
                                    cy="12"
                                    r="10"
                                    stroke="currentColor"
                                    strokeWidth="4"
                                ></circle>
                                <path
                                    className="opacity-75"
                                    fill="currentColor"
                                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                ></path>
                            </svg>
                            <span>CONNEXION...</span>
                        </>
                    ) : (
                        <>
                            <span>COMMENCER</span>
                            <span className="transition-transform group-hover:translate-x-1">
                                ➜
                            </span>
                        </>
                    )}
                </div>
            </button>

            <p className="mt-6 max-w-xs text-[10px] text-gray-400">
                En commençant, vous acceptez l'utilisation temporaire de la caméra et des capteurs
                pour l'expérience de jeu.
            </p>
        </div>
    );
}
