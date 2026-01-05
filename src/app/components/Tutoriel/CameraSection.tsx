'use client';
import React, { useRef } from "react";

export default function CameraSection() {
    const videoRef = useRef<HTMLVideoElement>(null);

    const startCamera = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
            }
        } catch (err) {
            alert("Permission caméra refusée ou pas de caméra détectée.");
        }
    };

    return (
        <div className="mb-8 w-full">
            <h2 className="text-xl font-semibold mb-2 text-black">📷 Caméra</h2>
            <button
                onClick={startCamera}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition mb-3"
            >
                Activer la caméra
            </button>
            <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-56 bg-black rounded-lg object-cover"
            />
        </div>
    );
}