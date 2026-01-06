'use client';
import React, { useState } from "react";
import { motion } from "framer-motion";
import usePermissions from "@/hooks/usePermissions";

export default function SystemCheck({ onSuccess, onFail }: { onSuccess: () => void, onFail: () => void }) {
    const { cameraStatus, microStatus, requestAll } = usePermissions();
    const [isChecking, setIsChecking] = useState(false);

    const handleStartMission = async () => {
        setIsChecking(true);

        // On demande les permissions
        const allGranted = await requestAll();

        setIsChecking(false);

        // Si tout est bon, on passe à la suite après une demi-seconde
        if (allGranted) {
            setTimeout(() => {
                onSuccess();
            }, 500);
        }
        // Si c'est refusé, on ne fait rien.
        // L'état 'cameraStatus' va changer seul et déclencher l'affichage du bloc "isDenied" ci-dessous.
    };

    // Vérification : Est-ce que l'utilisateur a explicitement refusé ?
    const isDenied = cameraStatus === 'denied' || microStatus === 'denied';

    // --- CAS 1 : ACCÈS REFUSÉ (L'écran rouge) ---
    if (isDenied) {
        return (
            <div className="flex flex-col items-center w-full max-w-md text-center px-4">
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="bg-red-50 p-6 rounded-xl border-2 border-red-100 shadow-xl w-full"
                >
                    <div className="text-5xl mb-4">⛔️</div>
                    <h2 className="text-xl font-bold text-red-600 mb-2">ACCÈS REFUSÉ</h2>

                    <div className="text-left bg-white p-4 rounded-lg border border-red-100 mb-6">
                        <p className="text-red-800 text-sm font-bold mb-2">
                            L'agent Ada42 ne peut pas travailler à l'aveugle.
                        </p>
                        <p className="text-gray-600 text-xs leading-relaxed">
                            Pour continuer, vous devez autoriser l'accès à la <strong>caméra</strong> et au <strong>micro</strong>.
                            <br/><br/>
                            1. Cliquez sur le cadenas 🔒 (barre d'adresse).<br/>
                            2. Cliquez sur "Réinitialiser" ou activez les options.<br/>
                            3. Rechargez la page.
                        </p>
                    </div>

                    {/* Ce bouton renvoie l'utilisateur à l'accueil */}
                    <button
                        onClick={onFail}
                        className="w-full py-3 rounded-lg font-bold bg-gray-900 text-white hover:bg-black transition-all shadow-lg active:scale-95"
                    >
                        RETOUR À L'ACCUEIL
                    </button>
                </motion.div>
            </div>
        );
    }

    // --- CAS 2 : ÉCRAN D'ACCUEIL (Tant qu'on n'a pas refusé) ---
    return (
        <div className="flex flex-col items-center w-full max-w-md text-center relative z-10 px-4">

            <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="mb-8"
            >
                <div className="w-24 h-24 bg-blue-600 rounded-2xl mx-auto flex items-center justify-center shadow-lg shadow-blue-500/30 mb-4">
                    <span className="text-4xl">🕵️‍♂️</span>
                </div>
                <h1 className="text-3xl font-black text-gray-800 tracking-tight">
                    MISSION <span className="text-blue-600">ADA42</span>
                </h1>
                <p className="text-gray-500 text-sm mt-2">
                    Initialisation des systèmes requise.
                </p>
            </motion.div>

            <button
                onClick={handleStartMission}
                disabled={isChecking}
                className="group relative w-full touch-manipulation"
            >
                <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl blur opacity-25 group-hover:opacity-75 transition duration-200"></div>
                <div className={`
                    relative w-full py-5 rounded-xl font-bold text-xl tracking-widest text-white shadow-2xl transition-all
                    flex items-center justify-center gap-3
                    ${isChecking ? "bg-gray-800 cursor-wait" : "bg-gray-900 active:scale-95"}
                `}>
                    {isChecking ? (
                        <>
                            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            <span>CONNEXION...</span>
                        </>
                    ) : (
                        <>
                            <span>COMMENCER</span>
                            <span className="group-hover:translate-x-1 transition-transform">➜</span>
                        </>
                    )}
                </div>
            </button>

            <p className="text-gray-400 text-[10px] mt-6 max-w-xs mx-auto">
                En commençant, vous acceptez l'utilisation temporaire de la caméra et des capteurs pour l'expérience de jeu.
            </p>
        </div>
    );
}