'use client';
import { useRouter } from 'next/navigation';

import { Variants, motion } from 'framer-motion';

import AnimatedBackground from '@/components/ui/AnimatedBackground';
import CTAButton from '@/components/ui/CTAButton';
import CircularTimer from '@/components/ui/CircularTimer';
import FeatureCard from '@/components/ui/FeatureCard';
import InfoCard from '@/components/ui/InfoCard';

export default function Home() {
    const router = useRouter();
    const startDebug = () => {
        if (typeof window === 'undefined') return;

        if (!localStorage.getItem('debugStartTime')) {
            localStorage.setItem('debugStartTime', Date.now().toString());
        }
        router.push('/Debug');
    };

    const containerVariants: Variants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.2, delayChildren: 0.3 },
        },
    };

    const itemVariants: Variants = {
        hidden: { opacity: 0, y: 30 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] },
        },
    };

    const features = [
        { icon: '🧩', title: 'Énigmes captivantes', desc: 'Défis qui stimulent la réflexion' },
        { icon: '⏱️', title: 'Contre la montre', desc: 'Moins de 60 minutes pour réussir' },
        { icon: '🤝', title: 'Mode coopératif', desc: 'Joue avec tes amis en temps réel' },
    ];

    return (
        <main className="relative min-h-screen w-full overflow-x-hidden">
            <div className="fixed inset-0 z-0">
                <AnimatedBackground />
            </div>

            <motion.div
                initial="hidden"
                animate="visible"
                variants={containerVariants}
                className="relative z-10 flex min-h-screen flex-col items-center justify-center px-4 py-12"
            >
                <div className="w-full max-w-4xl">
                    <motion.div
                        variants={itemVariants}
                        className="bg-background/80 relative overflow-hidden rounded-2xl border border-purple-500/20 shadow-2xl backdrop-blur-xl"
                    >
                        <div className="relative p-8 md:p-12">
                            {/* <CircularTimer> */}
                            <CircularTimer />
                            <motion.div
                                variants={itemVariants}
                                className="mb-6 flex justify-center"
                            >
                                <div className="relative">
                                    <div className="absolute inset-0 rounded-full bg-blue-500/20 blur-xl"></div>
                                    <div className="relative flex h-20 w-20 items-center justify-center rounded-full border border-blue-500/30 bg-blue-500/20 backdrop-blur-sm">
                                        <svg
                                            className="h-10 w-10 text-blue-600 dark:text-blue-400"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                                            />
                                        </svg>
                                    </div>
                                </div>
                            </motion.div>

                            <motion.h1
                                variants={itemVariants}
                                className="text-foreground mb-4 text-center text-4xl leading-tight font-bold md:text-6xl"
                            >
                                Échappe-toi.
                                <br />
                                Pense vite. Agis mieux.
                            </motion.h1>

                            <motion.p
                                variants={itemVariants}
                                className="text-foreground/70 mx-auto mb-8 max-w-2xl text-center text-lg md:text-xl"
                            >
                                Un escape game en ligne immersif. Résous les énigmes, débloque des
                                chapitres et coopère en temps réel.
                            </motion.p>

                            {/* Feature Card */}
                            <motion.div
                                variants={itemVariants}
                                className="mb-10 grid grid-cols-1 gap-4 md:grid-cols-3"
                            >
                                {features.map((feature, i) => (
                                    <FeatureCard
                                        key={i}
                                        icon={feature.icon}
                                        title={feature.title}
                                        description={feature.desc}
                                    />
                                ))}
                            </motion.div>

                            {/* CTA Button */}
                            <motion.div
                                variants={itemVariants}
                                className="flex flex-col items-center justify-center gap-4 sm:flex-row"
                            >
                                <CTAButton
                                    href="/tutorial"
                                    variant="primary"
                                    icon={
                                        <svg
                                            className="h-5 w-5"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                                            />
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                            />
                                        </svg>
                                    }
                                >
                                    Commencer le Tutoriel
                                </CTAButton>

                                <CTAButton
                                    href="/Debug"
                                    variant="secondary"
                                    onClick={startDebug}
                                    icon={
                                        <svg
                                            className="h-5 w-5"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
                                            />
                                        </svg>
                                    }
                                >
                                    Mode Débogage
                                </CTAButton>
                            </motion.div>
                        </div>
                    </motion.div>

                    {/* Info Cards */}
                    <motion.div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-1">
                        <InfoCard
                            title="Pourquoi Mission Ada42 ?"
                            description="Plonge dans une aventure inspirée par Ada Lovelace, pionnière de la programmation. Résous des énigmes tout en découvrant son héritage."
                            accentColor="purple"
                            icon={
                                <svg
                                    className="h-5 w-5"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M11 17a2 2 0 104 0v-5a2 2 0 10-4 0v5zm-7 4a9 9 0 1118 0H4z"
                                    />
                                </svg>
                            }
                        />
                    </motion.div>

                    <motion.div
                        variants={itemVariants}
                        className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2"
                    >
                        <InfoCard
                            title="Comment jouer ?"
                            description="Résous les énigmes dans l'ordre, débloque les chapitres suivants et bats le chrono avant la fin du temps imparti."
                            accentColor="purple"
                            icon={
                                <svg
                                    className="h-5 w-5"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                    />
                                </svg>
                            }
                        />
                        <InfoCard
                            title="Niveau de difficulté"
                            description="Du débutant à l'expert, les énigmes s'adaptent progressivement pour te challenger à chaque étape."
                            accentColor="blue"
                            icon={
                                <svg
                                    className="h-5 w-5"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
                                    />
                                </svg>
                            }
                        />
                    </motion.div>
                </div>
            </motion.div>
        </main>
    );
}
