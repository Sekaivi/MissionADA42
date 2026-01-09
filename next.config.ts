import type { NextConfig } from 'next';

const FRONT_BASE_URI = process.env.NEXT_PUBLIC_FRONT_BASE_URI || '';

const nextConfig: NextConfig = {
    basePath: FRONT_BASE_URI,
    assetPrefix: FRONT_BASE_URI,
    output: 'export',
    trailingSlash: true,
    reactStrictMode: true,
    images: { unoptimized: true },
};

export default nextConfig;
