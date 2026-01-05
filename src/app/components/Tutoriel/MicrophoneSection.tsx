'use client';
import React, { useState } from "react";

export default function MicrophoneSection() {
    const [micLevel, setMicLevel] = useState(0);

    const startMicrophone = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const audioCtx = new window.AudioContext();
            const analyser = audioCtx.createAnalyser();
            const micSource = audioCtx.createMediaStreamSource(stream);

            micSource.connect(analyser);
            analyser.fftSize = 256;
            const buffer = new Uint8Array(analyser.frequencyBinCount);

            const updateMic = () => {
                analyser.getByteFrequencyData(buffer);
                const volume = buffer.reduce((a, b) => a + b) / buffer.length;
                setMicLevel(volume);
                requestAnimationFrame(updateMic);
            };

            updateMic();
        } catch (err) {
            alert("Permission micro refusée.");
        }
    };

    return (
        <div className="mb-8 w-full">
            <h2 className="text-xl font-semibold mb-2 text-black">🎤 Microphone</h2>
            <button
                onClick={startMicrophone}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition mb-3"
            >
                Activer le micro
            </button>

            {/* Vumètre */}
            <div className="w-full h-4 bg-gray-200 rounded-full overflow-hidden">
                <div
                    className="h-full bg-green-500 transition-all duration-75 ease-out"
                    // J'ai ajouté un Math.min pour éviter que ça dépasse le cadre
                    style={{ width: `${Math.min(micLevel * 2, 100)}%` }}
                ></div>
            </div>
        </div>
    );
}