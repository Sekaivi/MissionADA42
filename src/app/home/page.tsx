'use client';
import { useRouter } from 'next/navigation';

import AnimatedBackground from '@/components/ui/AnimatedBackground';
import CTAButton from '@/components/ui/CTAButton';
import Card from '@/components/ui/Card';
import CircularTimer from '@/components/ui/CircularTimer';
import FeatureCard from '@/components/ui/FeatureCard';
import InfoCard from '@/components/ui/InfoCard';

export default function Homepage() {
    const router = useRouter();

    const startDebug = () => {
        if (typeof window === 'undefined') return;
        localStorage.setItem('debugStartTime', Date.now().toString());
        router.push('/debug');
    };

    const features = [
        { icon: '🧩', title: 'Énigmes', desc: 'Défis stimulants' },
        { icon: '⏱️', title: 'Chrono', desc: 'Moins de 60 min' },
        { icon: '🤝', title: 'Coop', desc: 'Joue entre amis' },
    ];

    return (
        <main className="relative flex min-h-screen w-full flex-col items-center justify-center overflow-x-hidden px-4 py-12">
            <div className="fixed inset-0 z-0">
                <AnimatedBackground />
            </div>

            <div className="relative z-10 flex w-full max-w-4xl flex-col gap-8">
                <Card className="border border-purple-500/20 bg-white/80 text-center shadow-2xl">
                    <div className="flex flex-col items-center">
                        <CircularTimer />
                        <div className="relative mt-4 mb-6">
                            <div className="absolute inset-0 rounded-full bg-blue-500/20 blur-xl"></div>
                            <div className="relative flex h-20 w-20 items-center justify-center rounded-full border border-blue-500/30 bg-blue-500/20 backdrop-blur-sm">
                                <span className="text-4xl">🕵️‍♂️</span>
                            </div>
                        </div>
                        <h1 className="mb-4 text-4xl font-black tracking-tight text-gray-900 md:text-6xl">
                            Échappe-toi.
                            <br />
                            <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                                Pense vite. Agis mieux.
                            </span>
                        </h1>
                        <p className="mb-10 max-w-2xl text-lg text-gray-600 md:text-xl">
                            Un escape game en ligne immersif. Résous les énigmes, débloque des
                            chapitres et coopère en temps réel.
                        </p>
                        <div className="mb-10 grid w-full grid-cols-1 gap-4 md:grid-cols-3">
                            {features.map((f, i) => (
                                <FeatureCard
                                    key={i}
                                    icon={f.icon}
                                    title={f.title}
                                    description={f.desc}
                                />
                            ))}
                        </div>
                        <div className="flex w-full flex-col justify-center gap-4 sm:flex-row">
                            <CTAButton href="/tutorial" variant="secondary">
                                Tester le Tutoriel
                            </CTAButton>
                            <CTAButton href="/debug" variant="primary" onClick={startDebug}>
                                Commencer la Mission
                            </CTAButton>
                        </div>
                    </div>
                </Card>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
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
