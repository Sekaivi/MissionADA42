'use client';
import CameraGame from '@/components/Tutorial/CameraGame';

export default function Home() {
    return <CameraGame onSuccess={() => console.log('success')} />;
}
