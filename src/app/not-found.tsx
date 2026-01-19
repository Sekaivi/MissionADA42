'use client';

import React, { useEffect, useState } from 'react';

import { useRouter } from 'next/navigation';

import { HomeIcon } from '@heroicons/react/24/solid';
import { motion, steps } from 'framer-motion';

import { AlphaButton } from '@/components/alpha/AlphaButton';
import { AlphaCard } from '@/components/alpha/AlphaCard';
import { DialogueBox } from '@/components/dialogueBox';
import { CHARACTERS } from '@/data/characters';
import { DialogueLine } from '@/types/dialogue';
import { say } from '@/utils/dialogueUtils';

const NOT_FOUND_SCRIPT: DialogueLine[] = [
    say(CHARACTERS.system, 'ERROR 404: Resource Not Found.'),
    say(CHARACTERS.unknown, 'PTDRRRRR Chehhhh'),
    say(CHARACTERS.paj, "Oh le boulet ! On dirait qu'on s'est perdus"),
    say(CHARACTERS.paj, 'Allez, on retourne à la base.'),
];

export default function NotFound() {
    const [isDialogueOpen, setIsDialogueOpen] = useState(false);
    const router = useRouter();

    useEffect(() => {
        const timer = setTimeout(() => setIsDialogueOpen(true), 1000);
        return () => clearTimeout(timer);
    }, []);

    return (
        <div className="bg-background text-foreground relative flex min-h-screen items-center justify-center overflow-hidden p-4">
            <div className="pointer-events-none absolute inset-0 z-0 opacity-20">
                <div className="h-full w-full bg-[repeating-linear-gradient(0deg,transparent,transparent_2px,var(--color-border)_3px)]" />
                <motion.div
                    className="via-surface-highlight/10 absolute inset-0 bg-gradient-to-b from-transparent to-transparent"
                    animate={{ top: ['-100%', '100%'] }}
                    transition={{ duration: 5, repeat: Infinity, ease: 'linear' }}
                />
            </div>
            <div className="relative z-50">
                <DialogueBox
                    isOpen={isDialogueOpen}
                    script={NOT_FOUND_SCRIPT}
                    onComplete={() => setIsDialogueOpen(false)}
                />
            </div>
            <motion.div
                className="relative z-10 w-full max-w-md"
                initial={{ opacity: 0 }}
                animate={{
                    opacity: [0, 1, 1, 0.8, 1],
                    x: [0, -10, 10, -5, 5, 0],
                    y: [0, 5, -5, 0],
                    skewX: [0, 10, -10, 0],
                    filter: [
                        'hue-rotate(0deg)',
                        'hue-rotate(90deg) contrast(150%)',
                        'hue-rotate(0deg)',
                    ],
                }}
                transition={{
                    duration: 0.5,
                    ease: steps(5),
                    times: [0, 0.2, 0.4, 0.6, 0.8, 1],
                }}
            >
                <AlphaCard title="SYSTEM FAILURE">
                    <div className="flex flex-col items-center gap-8 py-8 text-center">
                        <div className="relative select-none">
                            <h1 className="text-brand-error text-8xl font-black tracking-widest opacity-90 mix-blend-normal">
                                404
                            </h1>

                            <motion.h1
                                className="text-brand-blue absolute top-0 left-0 text-8xl font-black tracking-widest opacity-60 mix-blend-screen blur-[1px]"
                                animate={{ x: [-2, 2, -1, 0] }}
                                transition={{
                                    repeat: Infinity,
                                    duration: 0.2,
                                    repeatType: 'reverse',
                                }}
                            >
                                404
                            </motion.h1>

                            <motion.h1
                                className="text-brand-orange absolute top-0 left-0 text-8xl font-black tracking-widest opacity-60 mix-blend-screen blur-[1px]"
                                animate={{ x: [2, -2, 1, 0] }}
                                transition={{
                                    repeat: Infinity,
                                    duration: 0.3,
                                    repeatType: 'reverse',
                                }}
                            >
                                404
                            </motion.h1>
                        </div>

                        <div className="border-brand-error bg-surface space-y-4 border-l-4 p-4 text-left shadow-sm">
                            <p className="text-foreground font-mono text-lg font-bold tracking-wider uppercase">
                                &gt; ERROR: PAGE_NOT_FOUND
                            </p>
                            <p className="text-muted font-mono text-xs">
                                Le chemin d'accès spécifié est introuvable.
                                <br />
                                Vérifiez l'URL ou revenez au système principal.
                            </p>
                        </div>

                        <AlphaButton
                            onClick={() => router.push('/')}
                            variant="danger"
                            fullWidth
                            className="group relative overflow-hidden"
                        >
                            <span className="relative z-10 flex items-center justify-center gap-2">
                                <HomeIcon className="h-4 w-4" />
                                REBOOT SYSTEM
                            </span>
                        </AlphaButton>
                    </div>
                </AlphaCard>
            </motion.div>
        </div>
    );
}
