import {
    FRAME_METADATA,
    SITE_URL
} from '@/config';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    metadataBase: SITE_URL ? new URL(SITE_URL) : undefined,
    title: 'Neged Hat Game [BETA]',
    other: FRAME_METADATA,
    openGraph: {
        images: '/opengraph-image.png',
    },
    
};

export default function Home() {
    return (
        <div style={{ minHeight: '100dvh', display: 'flex', background: '#0052FF', margin: '0' }}>
            <h1
                style={{
                    margin: 'auto',
                    fontFamily: 'Inter, "Material Icons, serif',
                    fontSize: '80px',
                    textAlign: 'center',
                    color: 'white',
                }}
            >
                <a href="https://warpcast.com/~/channel/neged">Go to Farcaster!</a>
            </h1>
        </div>
    );
}
