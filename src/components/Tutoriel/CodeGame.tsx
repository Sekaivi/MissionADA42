'use client';
import React, { useState } from 'react';

import { motion } from 'framer-motion';

export default function CodeGame({ onSuccess }: { onSuccess: () => void }) {
    const [input, setInput] = useState('');
    const [error, setError] = useState(false);
    const secretCode = 'ADA42';

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (input.toUpperCase().trim() === secretCode) {
            onSuccess();
        } else {
            setError(true);
            setInput('');
            setTimeout(() => setError(false), 800);
        }
    };

    return (
        <div className="flex w-full flex-col items-center px-4">
            {' '}
            {/* Ajout px-4 pour marges sur mobile */}
            <h2 className="mb-4 text-center text-xl font-bold text-rose-500">
                ÉTAPE 5/5 : DÉCRYPTAGE
            </h2>
            <p className="mb-6 text-center text-sm text-gray-600 sm:text-base">
                Entrez le code d&apos;accès pour valider votre accréditation.
            </p>
            {/* Indice visuel du code à taper */}
            <div className="mb-6 w-full max-w-sm rounded-lg border border-gray-300 bg-gray-100 p-4 text-center">
                <p className="font-mono text-lg font-bold tracking-widest text-gray-800 select-none sm:text-xl">
                    CODE REQUIS : <span className="text-rose-600">ADA42</span>
                </p>
            </div>
            {/* FORMULAIRE RESPONSIVE :
               - flex-col : Colonne par défaut (Mobile)
               - sm:flex-row : Ligne à partir des tablettes/PC
            */}
            <form
                onSubmit={handleSubmit}
                className="flex w-full max-w-sm flex-col gap-3 sm:flex-row"
            >
                <input
                    type="text"
                    value={input}
                    onChange={(e) => {
                        setError(false);
                        setInput(e.target.value.toUpperCase());
                    }}
                    placeholder="Ex: ADA42"
                    className={`w-full rounded-lg border-2 px-4 py-3 text-center text-lg font-bold tracking-[0.2em] uppercase transition-all duration-200 outline-none sm:flex-1 ${
                        error
                            ? 'animate-shake border-red-500 bg-red-50 text-red-600'
                            : 'border-gray-300 focus:border-rose-500 focus:ring-4 focus:ring-rose-500/10'
                    }`}
                    maxLength={5}
                    autoFocus // Attention: autofocus marche mal sur mobile iOS parfois
                />

                <button
                    type="submit"
                    className="w-full rounded-lg bg-rose-500 px-6 py-3 font-bold whitespace-nowrap text-white shadow-lg shadow-rose-500/30 transition-all hover:bg-rose-600 active:scale-95 sm:w-auto sm:py-2"
                >
                    OK
                </button>
            </form>
            {/* Message d'erreur animé */}
            <div className="mt-3 h-6">
                {error && (
                    <motion.p
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-center gap-2 text-sm font-bold text-red-500"
                    >
                        <span>❌</span> CODE INCORRECT
                    </motion.p>
                )}
            </div>
        </div>
    );
}
