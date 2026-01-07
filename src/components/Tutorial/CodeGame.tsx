'use client';
import React, { useState } from 'react';

import { motion } from 'framer-motion';

export default function CodeGame({ onSuccess }: { onSuccess: () => void }) {
    // CORRECTION : On génère le code directement dans le useState (Lazy Init)
    const [secretCode] = useState<string>(() => {
        let code = '';
        while (code.length < 3) {
            const digit = Math.floor(Math.random() * 10).toString();
            if (!code.includes(digit)) code += digit;
        }

        console.log('🕵️‍♂️ Code Secret :', code);
        return code;
    });

    const [currentGuess, setCurrentGuess] = useState<string>('');
    const [history, setHistory] = useState<{ guess: string; result: string[] }[]>([]);
    const [status, setStatus] = useState('DÉCRYPTAGE REQUIS');
    const [isSuccess, setIsSuccess] = useState(false);
    const [shake, setShake] = useState(0);

    const handleInput = (num: string) => {
        if (isSuccess || currentGuess.length >= 3) return;
        if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(10);
        setCurrentGuess((prev) => prev + num);
    };

    const handleDelete = () => {
        if (isSuccess) return;
        setCurrentGuess((prev) => prev.slice(0, -1));
    };

    const checkCode = () => {
        if (currentGuess.length !== 3) return;

        const result: string[] = [];
        let correctCount = 0;

        for (let i = 0; i < 3; i++) {
            const digit = currentGuess[i];
            if (digit === secretCode[i]) {
                result.push('green');
                correctCount++;
            } else if (secretCode.includes(digit)) {
                result.push('yellow');
            } else {
                result.push('gray');
            }
        }

        setHistory((prev) => [...prev, { guess: currentGuess, result }]);

        if (correctCount === 3) {
            setIsSuccess(true);
            setStatus('ACCÈS AUTORISÉ');
            if (typeof navigator !== 'undefined' && navigator.vibrate)
                navigator.vibrate([50, 50, 50]);
            setTimeout(onSuccess, 1500);
        } else {
            setCurrentGuess('');
            setStatus('CODE INCORRECT');
            setShake((prev) => prev + 1);
            if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(200);
        }
    };

    return (
        // CONTENEUR PRINCIPAL : Max-width limité pour ne pas être trop large sur PC
        <div className="mx-auto flex w-full max-w-[400px] flex-col items-center font-mono text-sm select-none md:text-base">
            <h2 className="mb-2 text-base font-bold tracking-widest text-emerald-500 uppercase md:text-xl">
                Étape 4/5 : Décryptage
            </h2>

            {/* --- TERMINAL (ÉCRAN NOIR) --- */}
            <div className="relative mb-3 flex w-full flex-col overflow-hidden rounded-xl border-2 border-emerald-900 bg-black p-3 shadow-2xl md:p-4">
                {/* Scanline Effect */}
                <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(transparent_50%,rgba(0,255,0,0.05)_50%)] bg-[length:100%_4px]" />

                {/* Zone Historique (Hauteur réduite sur mobile h-24, normale sur PC h-32) */}
                <div className="no-scrollbar mb-2 flex h-24 flex-col justify-end gap-1 overflow-y-auto md:h-32 md:gap-2">
                    {history.length === 0 && (
                        <div className="flex h-full flex-col items-center justify-center text-center text-xs text-emerald-900 opacity-50 md:text-sm">
                            <p>INITIALISATION...</p>
                            <p>TROUVEZ LE CODE (3 CHIFFRES)</p>
                        </div>
                    )}
                    {history.map((item, idx) => (
                        <div
                            key={idx}
                            className="animate-fadeIn flex items-center justify-between border-b border-emerald-900/30 pb-1"
                        >
                            <span className="text-base font-bold tracking-[0.3em] text-emerald-400 md:text-lg md:tracking-[0.5em]">
                                {item.guess}
                            </span>
                            <div className="flex gap-1 md:gap-2">
                                {item.result.map((color, i) => (
                                    <div
                                        key={i}
                                        className={`h-2 w-2 rounded-full border border-black/50 md:h-3 md:w-3 ${
                                            color === 'green'
                                                ? 'bg-green-500 shadow-[0_0_8px_#22c55e]'
                                                : color === 'yellow'
                                                  ? 'bg-yellow-500'
                                                  : 'bg-gray-800'
                                        }`}
                                    />
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Zone de Saisie (Les 3 cases) */}
                <motion.div
                    key={shake}
                    animate={{ x: [0, -5, 5, -5, 5, 0] }}
                    transition={{ duration: 0.4 }}
                    className="mb-2 flex items-center justify-center gap-3 rounded border border-emerald-500/20 bg-emerald-900/10 py-1 md:gap-4 md:py-2"
                >
                    {[0, 1, 2].map((i) => (
                        <div
                            key={i}
                            className="flex h-10 w-8 items-center justify-center border-b-2 border-emerald-500 text-2xl font-bold text-emerald-400 md:h-12 md:w-10 md:text-3xl"
                        >
                            {currentGuess[i] || (
                                <motion.span
                                    animate={{ opacity: [0, 0.5, 0] }}
                                    transition={{ repeat: Infinity, duration: 1.5 }}
                                    className="text-emerald-900"
                                >
                                    _
                                </motion.span>
                            )}
                        </div>
                    ))}
                </motion.div>

                <p
                    className={`text-center text-[10px] font-bold tracking-wider md:text-xs ${isSuccess ? 'animate-pulse text-green-400' : 'text-emerald-600'}`}
                >
                    {status}
                </p>
            </div>

            {/* --- LÉGENDE --- */}
            <div className="mb-3 grid w-full grid-cols-1 gap-1 rounded-lg border border-gray-200 bg-gray-100 p-2 text-[10px] text-gray-600 shadow-inner md:gap-2 md:text-xs">
                <div className="flex items-center gap-2">
                    <div className="h-2 w-2 shrink-0 rounded-full bg-green-500 shadow-sm md:h-3 md:w-3"></div>
                    <span>
                        <strong className="text-green-700">Bon</strong> chiffre,{' '}
                        <strong className="text-green-700">bonne</strong> place.
                    </span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="h-2 w-2 shrink-0 rounded-full bg-yellow-500 shadow-sm md:h-3 md:w-3"></div>
                    <span>
                        <strong className="text-yellow-700">Bon</strong> chiffre,{' '}
                        <strong className="text-yellow-700">mauvaise</strong> place.
                    </span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="h-2 w-2 shrink-0 rounded-full bg-gray-800 shadow-sm md:h-3 md:w-3"></div>
                    <span>
                        Chiffre <strong className="text-gray-800">incorrect</strong> (absent).
                    </span>
                </div>
            </div>

            {/* --- CLAVIER NUMÉRIQUE --- */}
            <div className="grid w-full grid-cols-3 gap-2 md:gap-3">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                    <button
                        key={num}
                        onClick={() => handleInput(num.toString())}
                        disabled={isSuccess}
                        className="h-11 touch-manipulation rounded-lg border-b-4 border-gray-200 bg-white text-lg font-bold text-gray-700 shadow-sm transition-all active:translate-y-1 active:scale-95 active:border-b-0 active:bg-gray-100 md:h-14 md:text-xl"
                    >
                        {num}
                    </button>
                ))}

                <button
                    onClick={handleDelete}
                    className="flex h-11 touch-manipulation items-center justify-center rounded-lg border-b-4 border-red-100 bg-red-50 text-sm font-bold text-red-500 shadow-sm active:translate-y-1 active:scale-95 active:border-b-0 md:h-14 md:text-base"
                >
                    EFFACER
                </button>

                <button
                    onClick={() => handleInput('0')}
                    className="h-11 touch-manipulation rounded-lg border-b-4 border-gray-200 bg-white text-lg font-bold text-gray-700 shadow-sm active:translate-y-1 active:scale-95 active:border-b-0 md:h-14 md:text-xl"
                >
                    0
                </button>

                <button
                    onClick={checkCode}
                    disabled={currentGuess.length !== 3 || isSuccess}
                    className={`flex h-11 touch-manipulation items-center justify-center rounded-lg border-b-4 text-sm font-bold text-white shadow-sm transition-all active:translate-y-1 active:border-b-0 md:h-14 md:text-base ${
                        currentGuess.length === 3
                            ? 'border-emerald-700 bg-emerald-600 active:bg-emerald-700'
                            : 'cursor-not-allowed border-gray-400 bg-gray-300'
                    }`}
                >
                    VALIDER
                </button>
            </div>
        </div>
    );
}
