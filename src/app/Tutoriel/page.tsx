'use client';
import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";



import CameraSection from "@/app/components/Tutoriel/CameraSection";
import MicrophoneSection from "@/app/components/Tutoriel/MicrophoneSection";
import CompassSection from "@/app/components/Tutoriel/CompassSection";
import Button from "@/app/components/ui/Button";

export default function Tutoriel() {
    const router = useRouter();
    const handleStart = () => {
        console.log("Button clicked");
        router.push('/Home');
    };
    return (
        <main className="flex min-h-screen flex-col items-center  font-sans">

            <div className="w-full max-w-2xl bg-white/60 backdrop-blur-xl shadow-xl rounded-2xl p-6 border border-white/50">

                <h1 className="text-3xl font-bold text-black mb-6 text-center">
                    Tests des Capteurs
                </h1>


                <CameraSection />
                <hr className="border-gray-200 mb-6" />

                <MicrophoneSection />
                <hr className="border-gray-200 mb-6" />

                <CompassSection />

                <div className="mt-8 border-t border-gray-100 pt-6">

                    <Button onClick={handleStart}>
                        Retour à l'accueil
                    </Button>

                </div>

            </div>
        </main>
    );
}