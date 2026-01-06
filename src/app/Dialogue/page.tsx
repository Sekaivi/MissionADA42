'use client';
import { useState } from 'react';
import { DialogueBox } from '@/components/dialogueBox';
import { DialogueLine } from '@/types/dialogue';

// Exemple de scénario
const introScript: DialogueLine[] = [
    {
        id: '1',
        speaker: 'IA Centrale',
        text: 'Alerte. Intrusion détectée dans le secteur 7.',
        avatar: '/images/ai-avatar.png',
    },
    {
        id: '2',
        speaker: 'IA Centrale',
        text: 'Veuillez vous identifier immédiatement ou les protocoles de sécurité seront activés.',
        avatar: '/images/ai-avatar.png',
    },
    {
        id: '3',
        speaker: 'Capitaine',
        text: "Bon sang ! Le système ne nous reconnait plus. On doit pirater le terminal !",
        avatar: '/images/captain.png',
        side: 'right'
    }
];

export default function GamePage() {
    const [isDialogueOpen, setIsDialogueOpen] = useState(true);

    const handleDialogueEnd = () => {
        setIsDialogueOpen(false);
        console.log("Dialogue terminé, le jeu commence !");
        // Ici, tu déclenches la logique suivante de ton jeu
    };

    return (
        <main className="min-h-screen bg-black text-white relative">
            {/* Contenu du jeu en arrière-plan */}
            <div className="p-10">
                <h1 className="text-4xl font-bold mb-4">Escape Room: Sector 7</h1>
                <p>Recherche d'indices en cours...</p>
                {/* ... Reste de ton interface de jeu ... */}
            </div>

            {/* Overlay de Dialogue */}
            <DialogueBox
                isOpen={isDialogueOpen}
                script={introScript}
                onComplete={handleDialogueEnd}
            />
        </main>
    );
}