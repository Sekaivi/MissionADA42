'use client';

import { CpuChipIcon, UserGroupIcon } from '@heroicons/react/24/outline';
import { ArrowPathIcon, ClockIcon } from '@heroicons/react/24/solid';
import { motion } from 'framer-motion';

import { GameLobby } from '@/app/test/GameLobby';
import { AlphaButton } from '@/components/alpha/AlphaButton';
import AlphaFeedbackPill from '@/components/alpha/AlphaFeedbackPill';
import FeatureCard from '@/components/ui/FeatureCard';
import { SCENARIO } from '@/data/alphaScenario';

interface WelcomeScreenProps {
    showLobby: boolean;
}

export const WelcomeScreen = ({ showLobby }: WelcomeScreenProps) => {
    const handleReplayTutorial = () => {
        localStorage.removeItem('alpha_tuto_completed');
        window.location.reload();
    };

    return (
        <div className="mx-auto flex w-full max-w-2xl flex-col items-center space-y-8 py-8">
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="space-y-4 text-center"
            >
                <AlphaFeedbackPill
                    message={'Escape game interactif multijoueur'}
                    type={'success'}
                />

                <h1 className="from-brand-blue to-brand-emerald bg-gradient-to-r bg-clip-text text-[clamp(1.5rem,8vw,4rem)] leading-none font-black text-transparent">
                    {SCENARIO.name.toUpperCase()}
                </h1>

                <p className="text-muted mx-auto text-start text-sm leading-relaxed md:text-base">
                    {SCENARIO.description}
                </p>
            </motion.div>

            {/* lobby */}
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.6 }}
                className="w-full"
            >
                {showLobby && <GameLobby />}
            </motion.div>

            {/* Pourquoi jouer ? */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.8 }}
                className="grid w-full grid-cols-1 gap-4 md:grid-cols-3"
            >
                <FeatureCard
                    icon={UserGroupIcon}
                    title="Coopération"
                    description="Synchronisez vos actions avec votre équipe en temps réel."
                />
                <FeatureCard
                    icon={CpuChipIcon}
                    title="Piratage"
                    description="Utilisez les modules du téléphone pour contourner les pièges."
                />
                <FeatureCard
                    icon={ClockIcon}
                    title="Chrono"
                    description="Le temps est compté pour sauver l'IUT. Ne perdez pas de temps !"
                />
            </motion.div>

            {showLobby && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1 }}
                >
                    <AlphaButton onClick={handleReplayTutorial} variant={'ghost'}>
                        <ArrowPathIcon className="mr-2 h-3 w-3" />
                        RELANCER LE MODULE D'ENTRAÎNEMENT
                    </AlphaButton>
                </motion.div>
            )}
        </div>
    );
};
