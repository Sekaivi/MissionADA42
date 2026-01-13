'use client';

import { useEffect, useState } from 'react';

import Image from 'next/image';

import { ArrowPathIcon } from '@heroicons/react/24/solid';

import { AlphaButton } from '@/components/alpha/AlphaButton';
import { AlphaCard } from '@/components/alpha/AlphaCard';
import { AlphaError } from '@/components/alpha/AlphaError';
import AlphaFeedbackPill from '@/components/alpha/AlphaFeedbackPill';
import { AlphaGrid } from '@/components/alpha/AlphaGrid';
import { AlphaHeader } from '@/components/alpha/AlphaHeader';
import { AlphaInfoRow } from '@/components/alpha/AlphaInfoRow';
import { AlphaVideoContainer } from '@/components/alpha/AlphaVideoContainer';
import { FacingMode, useCamera } from '@/hooks/useCamera';

export default function AlphaCameraOnly() {
    const [facingMode, setFacingMode] = useState<FacingMode>('environment');

    const { videoRef, error } = useCamera(facingMode);

    // states pour le debug technique
    const [videoInfo, setVideoInfo] = useState<{
        width: number;
        height: number;
        label: string;
        frameRate?: number;
    } | null>(null);
    const [snapshot, setSnapshot] = useState<string | null>(null);

    const toggleCamera = () => {
        setFacingMode((prev) => (prev === 'environment' ? 'user' : 'environment'));
        // reset des infos le temps que la nouvelle cam charge
        setVideoInfo(null);
    };

    // extraire les metadata du flux
    useEffect(() => {
        const video = videoRef.current;
        if (!video) return;

        const updateInfo = () => {
            // check si le stream est actif
            const stream = video.srcObject as MediaStream;
            // sécurité si le stream est en cours de changement
            if (!stream || !stream.active) return;

            const track = stream.getVideoTracks()[0];
            const settings = track?.getSettings();

            if (video.videoWidth > 0) {
                setVideoInfo({
                    width: video.videoWidth,
                    height: video.videoHeight,
                    label: track?.label || 'Caméra générique',
                    frameRate: settings?.frameRate,
                });
            }
        };

        // on écoute le chargement, et on poll toutes les secondes pour détecter les changements (rotation, etc)
        video.addEventListener('loadedmetadata', updateInfo);
        // délai pour laisser le temps au switch de se faire
        const interval = setInterval(updateInfo, 1000);

        return () => {
            video.removeEventListener('loadedmetadata', updateInfo);
            clearInterval(interval);
        };
    }, [videoRef, facingMode]);

    const takeSnapshot = () => {
        if (!videoRef.current) return;
        const canvas = document.createElement('canvas');
        canvas.width = videoRef.current.videoWidth;
        canvas.height = videoRef.current.videoHeight;

        const ctx = canvas.getContext('2d');

        // si on est en mode selfie, on peut vouloir que le screenshot soit aussi inversé
        if (facingMode === 'user') {
            ctx?.translate(canvas.width, 0);
            ctx?.scale(-1, 1);
        }

        ctx?.drawImage(videoRef.current, 0, 0);
        setSnapshot(canvas.toDataURL('image/png'));
    };

    return (
        <>
            <AlphaHeader title="Camera" subtitle="Test d'accès aux flux vidéo" />

            <AlphaError message={error} />

            <AlphaGrid>
                {/* col 1 : visuel */}
                <AlphaCard
                    title="Flux Vidéo Brut"
                    action={
                        <div className="flex gap-2">
                            {/* switch caméra */}
                            <AlphaButton onClick={toggleCamera} variant="primary">
                                <ArrowPathIcon className="h-5 w-5" />
                            </AlphaButton>

                            <AlphaButton onClick={takeSnapshot} variant="secondary">
                                Screenshot
                            </AlphaButton>
                        </div>
                    }
                >
                    <div className="space-y-4">
                        <AlphaVideoContainer
                            label={facingMode === 'user' ? 'FRONT CAM' : 'BACK CAM'}
                            videoRef={videoRef}
                            // active l'effet miroir CSS si on est en mode selfie
                            isMirrored={facingMode === 'user'}
                        />
                    </div>
                </AlphaCard>

                {/* col 2 : data */}
                <div className="space-y-6">
                    <AlphaCard title="Métadonnées du Stream">
                        {!videoInfo ? (
                            <AlphaFeedbackPill
                                message={'Synchronisation matériel...'}
                                type={'info'}
                                isLoading
                            />
                        ) : (
                            <div className="flex flex-col">
                                <AlphaInfoRow label="Mode" value={facingMode.toUpperCase()} />
                                <AlphaInfoRow label="Statut" value="ACTIF" active />
                                <AlphaInfoRow
                                    label="Résolution"
                                    value={`${videoInfo.width} x ${videoInfo.height} px`}
                                />
                                <AlphaInfoRow
                                    label="Ratio"
                                    value={(videoInfo.width / videoInfo.height).toFixed(2)}
                                />
                                <AlphaInfoRow
                                    label="Frame Rate"
                                    value={
                                        videoInfo.frameRate
                                            ? `${videoInfo.frameRate} fps`
                                            : undefined
                                    }
                                />
                                <AlphaInfoRow label={'Hardware ID'} value={videoInfo.label} />
                            </div>
                        )}
                    </AlphaCard>

                    {snapshot && videoInfo && (
                        <AlphaCard title="Dernière Capture">
                            <Image
                                src={snapshot}
                                alt="Snapshot"
                                width={videoInfo.width}
                                height={videoInfo.height}
                                className="h-auto w-full"
                                unoptimized
                            />
                        </AlphaCard>
                    )}
                </div>
            </AlphaGrid>
        </>
    );
}
