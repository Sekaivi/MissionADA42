'use client';
import React, { useEffect, useState } from 'react';

import { motion } from 'framer-motion';

import Button from '@/components/ui/Button';

// On définit les types pour éviter 'any'
interface WebkitWindow extends Window {
    webkitAudioContext: typeof AudioContext;
}

export default function MicroGame({ onSuccess }: { onSuccess: () => void }) {
    const [level, setLevel] = useState(0);
    const [isFinished, setIsFinished] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let audioContext: AudioContext | null = null;
        let stream: MediaStream | null = null;
        let script: ScriptProcessorNode | null = null;
        let mic: MediaStreamAudioSourceNode | null = null;

        const initMicro = async () => {
            try {
                stream = await navigator.mediaDevices.getUserMedia({ audio: true });

                // Gestion compatible Safari/Chrome sans 'any'
                const AudioContextClass =
                    window.AudioContext || (window as unknown as WebkitWindow).webkitAudioContext;
                audioContext = new AudioContextClass();

                mic = audioContext.createMediaStreamSource(stream);
                script = audioContext.createScriptProcessor(2048, 1, 1);

                mic.connect(script);
                script.connect(audioContext.destination);

                script.onaudioprocess = (e) => {
                    const input = e.inputBuffer.getChannelData(0);
                    let sum = 0.0;
                    for (let i = 0; i < input.length; ++i) sum += input[i] * input[i];
                    const vol = Math.sqrt(sum / input.length) * 100;

                    setLevel(vol * 3);

                    // On vérifie directement ici sans dépendre de l'état externe 'isFinished'
                    // pour éviter les problèmes de closure
                    if (vol * 3 > 60) {
                        // On nettoie tout immédiatement
                        if (stream) stream.getTracks().forEach((track) => track.stop());
                        if (script) script.disconnect();
                        if (mic) mic.disconnect();

                        setIsFinished(true);
                    }
                };
            } catch (err) {
                console.error(err);
                setError('Micro inaccessible.');
            }
        };

        // On lance l'initialisation uniquement si ce n'est pas déjà fini
        if (!isFinished) {
            initMicro();
        }

        // Cleanup function stricte
        return () => {
            if (stream) stream.getTracks().forEach((track) => track.stop());
            if (audioContext && audioContext.state !== 'closed') audioContext.close();
            if (script) script.disconnect();
            if (mic) mic.disconnect();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // Tableau vide : ne s'exécute qu'une fois au montage

    return (
        <div className="flex w-full flex-col items-center">
            <h2 className="mb-4 text-xl font-bold text-purple-600">ÉTAPE 2/5 : VOCAL</h2>

            {error ? (
                <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-center">
                    <p className="mb-2 font-bold text-red-600">{error}</p>
                    <Button onClick={() => window.location.reload()}>RÉESSAYER</Button>
                </div>
            ) : (
                <>
                    <p className="mb-6 text-center text-gray-600">
                        {isFinished ? 'Analyse terminée.' : 'Parlez fort pour activer le système.'}
                    </p>

                    <div className="relative mb-6 flex h-32 w-32 items-center justify-center">
                        {!isFinished && (
                            <>
                                <motion.div
                                    animate={{ scale: 1 + level / 50 }}
                                    className="absolute h-24 w-24 rounded-full bg-purple-500/30"
                                />
                                <motion.div
                                    animate={{ scale: 1 + level / 80 }}
                                    className="absolute h-16 w-16 rounded-full bg-purple-500/60"
                                />
                            </>
                        )}
                        <div className="z-10 text-3xl">{isFinished ? '✅' : '🎤'}</div>
                    </div>

                    {isFinished && (
                        <div className="animate-bounce">
                            <Button onClick={onSuccess}>VOIX RECONNUE ➜</Button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
