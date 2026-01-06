'use client';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

// Imports UI
import AnimatedBackground from '@/components/ui/AnimatedBackground';
import Card from '@/components/ui/Card';          // Le composant Mère
import InfoCard from '@/components/ui/InfoCard';  // Le composant Fille
import CircularTimer from '@/components/ui/CircularTimer';
import FeatureCard from '@/components/ui/FeatureCard';
import CTAButton from '@/components/ui/CTAButton';

export default function Home() {
    const router = useRouter();

    const startDebug = () => {
        if (typeof window === 'undefined') return;
        localStorage.setItem('debugStartTime', Date.now().toString());
        router.push('/Debug');
    };

    const features = [
        { icon: '🧩', title: 'Énigmes', desc: 'Défis stimulants' },
        { icon: '⏱️', title: 'Chrono', desc: 'Moins de 60 min' },
        { icon: '🌐', title: 'En ligne', desc: 'Accessible partout' },

    ];

    return (
        <main className="relative min-h-screen w-full overflow-x-hidden flex flex-col items-center justify-center px-4 py-12">
            <div className="fixed inset-0 z-0">
                <AnimatedBackground />
            </div>

            <div className="relative z-10 w-full max-w-4xl flex flex-col gap-8">



                <Card className="bg-white/80 border border-purple-500/20 text-center">


                    <div className="flex flex-col items-center">
                        <CircularTimer />

                        <div className="mb-6 mt-4 relative">
                            <div className="absolute inset-0 rounded-full bg-blue-500/20 blur-xl"></div>
                            <div className="relative flex h-20 w-20 items-center justify-center rounded-full border border-blue-500/30 bg-blue-500/20 backdrop-blur-sm">
                                <span className="text-4xl">🕵️‍♂️</span>
                            </div>
                        </div>

                        <h1 className="text-4xl md:text-6xl font-black text-gray-900 mb-4 tracking-tight">
                            Échappe-toi.<br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-600">
                                Pense vite. Agis mieux.
                            </span>
                        </h1>

                        <p className="text-gray-600 text-lg md:text-xl max-w-2xl mb-10">
                            Un escape game en ligne immersif. Résous les énigmes, débloque des chapitres et coopère en temps réel.
                        </p>


                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full mb-10">
                            {features.map((f, i) => (
                                <FeatureCard key={i} icon={f.icon} title={f.title} description={f.desc} />
                            ))}
                        </div>


                        <div className="flex flex-col sm:flex-row gap-4 justify-center w-full">
                            <CTAButton href="/tutorial" variant="primary">
                                Commencer la Mission
                            </CTAButton>
                            <CTAButton href="/Debug" variant="secondary" onClick={startDebug}>
                                Mode Débogage
                            </CTAButton>
                        </div>
                    </div>
                </Card>



                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <InfoCard
                        title="Pourquoi Mission Ada42 ?"
                        description="Plonge dans une aventure inspirée par Ada Lovelace, pionnière de la programmation."
                        icon={<span>📜</span>}
                    />
                    <InfoCard
                        title="Comment jouer ?"
                        description="Il suffit d'un navigateur, d'une webcam et d'un esprit logique acéré."
                        icon={<span>🎮</span>}
                    />
                </div>

            </div>
        </main>
    );
}