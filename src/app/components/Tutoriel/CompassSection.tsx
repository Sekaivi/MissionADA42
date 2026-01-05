'use client';
import React, { useEffect, useState } from "react";

export default function CompassSection() {
    const [direction, setDirection] = useState(0);

    useEffect(() => {
        const handler = (e: DeviceOrientationEvent) => {
            if (e.alpha !== null) {
                setDirection(e.alpha);
            }
        };
        window.addEventListener("deviceorientation", handler);
        return () => window.removeEventListener("deviceorientation", handler);
    }, []);

    return (
        <div className="mb-8 w-full flex flex-col items-center">
            <h2 className="text-xl font-semibold mb-4 text-black w-full text-left">🧭 Boussole</h2>

            <div className="relative w-48 h-48 flex items-center justify-center mb-6">
                {/* CERCLE */}
                <div className="absolute w-full h-full rounded-full border-4 border-gray-300"></div>

                {/* GRADUATIONS */}
                {[...Array(36)].map((_, i) => (
                    <div
                        key={i}
                        className="absolute w-1 h-3 bg-gray-400"
                        style={{
                            transform: `rotate(${i * 10}deg) translateY(-90px)`
                        }}
                    ></div>
                ))}

                {/* AIGUILLE ROUGE */}
                <div
                    className="absolute w-1 h-20 bg-red-600 rounded"
                    style={{
                        transform: `rotate(${direction}deg) translateY(-40px)`,
                        transformOrigin: "bottom center",
                        transition: "transform 0.1s cubic-bezier(0.4, 0, 0.2, 1)"
                    }}
                ></div>

                {/* CENTRE */}
                <div className="w-4 h-4 bg-black rounded-full absolute"></div>
            </div>

            <p className="text-center text-black font-semibold">
                Direction : {direction.toFixed(1)}°
            </p>
        </div>
    );
}