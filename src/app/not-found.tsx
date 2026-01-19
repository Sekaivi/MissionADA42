'use client';

import React, { useEffect, useState } from 'react';

import { useRouter } from 'next/navigation';

import { HomeIcon } from '@heroicons/react/24/solid';
import { motion, steps } from 'framer-motion';

import ClientLayout from '@/app/ClientLayout';
import { AlphaButton } from '@/components/alpha/AlphaButton';
import { AlphaCard } from '@/components/alpha/AlphaCard';
import { DialogueBox } from '@/components/dialogueBox';
import { CHARACTERS } from '@/data/characters';
import { DialogueLine } from '@/types/dialogue';
import { say } from '@/utils/dialogueUtils';

const NOT_FOUND_SCRIPT: DialogueLine[] = [
    say(CHARACTERS.system, 'ERROR 404 : Resource introuvable.'),
    say(CHARACTERS.paj, "Oh le boulet ! On dirait qu'on s'est perdu ?"),
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
        <ClientLayout variant={'dark'}>
            <div className="flex min-h-screen items-center justify-center">
                <DialogueBox
                    isOpen={isDialogueOpen}
                    script={NOT_FOUND_SCRIPT}
                    onComplete={() => setIsDialogueOpen(false)}
                />
                <motion.div
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
                    <AlphaCard title="SYSTEM FAILURE" contentClassName={'!space-y-8'}>
                        <div className="relative mx-auto w-max select-none">
                            <h1 className="text-brand-error text-7xl font-black opacity-90 mix-blend-normal">
                                404
                            </h1>

                            <motion.h1
                                className="text-brand-blue absolute top-0 left-0 text-7xl font-black opacity-60 mix-blend-screen blur-[1px]"
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
                                className="text-brand-orange absolute top-0 left-0 text-7xl font-black opacity-60 mix-blend-screen blur-[1px]"
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

                        <div className="border-brand-error space-y-4 border-l-4 p-4 text-left">
                            <p className="text-foreground font-mono text-lg font-bold uppercase">
                                &gt; ERROR: PAGE_NOT_FOUND
                            </p>
                            <p className="text-muted font-mono text-xs">
                                Le chemin d'accès spécifié est introuvable.
                                <br />
                                Vérifiez l'URL ou revenez au système principal.
                            </p>
                        </div>

                        <AlphaButton onClick={() => router.push('/')} variant="danger" fullWidth>
                            <HomeIcon className="mr-2 h-4 w-4" />
                            REBOOT SYSTEM
                        </AlphaButton>
                    </AlphaCard>
                </motion.div>
            </div>
        </ClientLayout>
    );
}
