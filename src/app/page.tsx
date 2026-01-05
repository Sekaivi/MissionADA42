'use client';
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Button from "@/app/components/ui/Button";

export default function Home() {
    const router = useRouter();
    const [isLeaving, setIsLeaving] = useState(false);
    const handleStart = () => {
        console.log("Button clicked");
        setIsLeaving(true);
        setTimeout(() => {
            router.push('/Home');
        }, 500);
    };

    return (
        <AnimatePresence>
            {!isLeaving && (
                <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -50 }}
                    transition={{ duration: 0.5 }}
                    className="flex flex-col min-h-screen items-center justify-center font-sans bg-(--background)"
                >
                    <div className="max-w-3xl p-6 text-center">

                        <h1 className="h1-main">Bienvenue dans Mission Ada42 !</h1>
                        <Button onClick={handleStart}>
                            Commencer l'aventure
                        </Button>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
