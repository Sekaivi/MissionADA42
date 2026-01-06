'use client';
import React, { useState } from 'react';

import { motion } from 'framer-motion';

export default function CodeGame({ onSuccess }: { onSuccess: () => void }) {
    // CORRECTION : On génère le code directement dans le useState (Lazy Init)
    // Cela évite l'utilisation de useEffect et l'erreur de "setState synchronous"
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
        <div className="flex w-full flex-col items-center font-mono text-sm select-none md:text-base">
            <h2 className="mb-2 text-lg font-bold tracking-widest text-emerald-500 uppercase md:text-xl">
                Étape 4/5 : Décryptage
            </h2>

            <div className="relative mb-4 flex w-full max-w-md flex-col overflow-hidden rounded-xl border-2 border-emerald-900 bg-black p-4 shadow-2xl">
                <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(transparent_50%,rgba(0,255,0,0.05)_50%)] bg-[length:100%_4px]" />

                <div className="no-scrollbar mb-2 flex h-32 flex-col justify-end gap-2 overflow-y-auto">
                    {history.length === 0 && (
                        <div className="flex h-full flex-col items-center justify-center text-emerald-900 opacity-50">
                            <p>INITIALISATION...</p>
                            <p>TROUVEZ LE CODE (3 CHIFFRES)</p>
                        </div>
                    )}
                    {history.map((item, idx) => (
                        <div
                            key={idx}
                            className="animate-fadeIn flex items-center justify-between border-b border-emerald-900/30 pb-1"
                        >
                            <span className="text-lg font-bold tracking-[0.5em] text-emerald-400">
                                {item.guess}
                            </span>
                            <div className="flex gap-2">
                                {item.result.map((color, i) => (
                                    <div
                                        key={i}
                                        className={`h-3 w-3 rounded-full border border-black/50 ${
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

                <motion.div
                    key={shake}
                    animate={{ x: [0, -5, 5, -5, 5, 0] }}
                    transition={{ duration: 0.4 }}
                    className="mb-2 flex items-center justify-center gap-4 rounded border border-emerald-500/20 bg-emerald-900/10 py-2"
                >
                    {[0, 1, 2].map((i) => (
                        <div
                            key={i}
                            className="flex h-12 w-10 items-center justify-center border-b-2 border-emerald-500 text-3xl font-bold text-emerald-400"
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
                    className={`text-center text-xs font-bold tracking-wider ${isSuccess ? 'animate-pulse text-green-400' : 'text-emerald-600'}`}
                >
                    {status}
                </p>
            </div>

            <div className="mb-4 grid w-full max-w-md grid-cols-1 gap-2 rounded-lg border border-gray-200 bg-gray-100 p-3 text-xs text-gray-600 shadow-inner">
                <div className="flex items-center gap-2">
                    <div className="h-3 w-3 shrink-0 rounded-full bg-green-500 shadow-sm"></div>
                    <span>
                        <strong className="text-green-700">Bon</strong> chiffre,{' '}
                        <strong className="text-green-700">bonne</strong> place.
                    </span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="h-3 w-3 shrink-0 rounded-full bg-yellow-500 shadow-sm"></div>
                    <span>
                        <strong className="text-yellow-700">Bon</strong> chiffre,{' '}
                        <strong className="text-yellow-700">mauvaise</strong> place.
                    </span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="h-3 w-3 shrink-0 rounded-full bg-gray-800 shadow-sm"></div>
                    <span>
                        Chiffre <strong className="text-gray-800">incorrect</strong> (absent du
                        code).
                    </span>
                </div>
            </div>

            <div className="grid w-full max-w-md grid-cols-3 gap-2 md:gap-3">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                    <button
                        key={num}
                        onClick={() => handleInput(num.toString())}
                        disabled={isSuccess}
                        className="h-12 touch-manipulation rounded-lg border-b-4 border-gray-200 bg-white text-xl font-bold text-gray-700 shadow-sm transition-all active:translate-y-1 active:scale-95 active:border-b-0 active:bg-gray-100 md:h-14"
                    >
                        {num}
                    </button>
                ))}

                <button
                    onClick={handleDelete}
                    className="flex h-12 touch-manipulation items-center justify-center rounded-lg border-b-4 border-red-100 bg-red-50 font-bold text-red-500 shadow-sm active:translate-y-1 active:scale-95 active:border-b-0 md:h-14"
                >
                    EFFACER
                </button>

                <button
                    onClick={() => handleInput('0')}
                    className="h-12 touch-manipulation rounded-lg border-b-4 border-gray-200 bg-white text-xl font-bold text-gray-700 shadow-sm active:translate-y-1 active:scale-95 active:border-b-0 md:h-14"
                >
                    0
                </button>

                <button
                    onClick={checkCode}
                    disabled={currentGuess.length !== 3 || isSuccess}
                    className={`flex h-12 touch-manipulation items-center justify-center rounded-lg border-b-4 font-bold text-white shadow-sm transition-all active:translate-y-1 active:border-b-0 md:h-14 ${
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
