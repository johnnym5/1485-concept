import LoadingBuffer from '@/components/canvas/LoadingBuffer';
import HomeSections from '@/components/site/HomeSections';
import { canonicalUrl } from '@/lib/site';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: { absolute: '14.85 Concepts | Architecture & Construction in Abuja, Nigeria' },
  description: 'Abuja-based 14.85 Concepts brings architectural design, construction, interiors, project management and property development together for clients in Nigeria and internationally.',
  alternates: canonicalUrl('/') ? { canonical: canonicalUrl('/') } : undefined,
};

export default function Home() {
  return (
    <main className="min-h-screen bg-[#080808]">
      <LoadingBuffer>
        <HomeSections />
      </LoadingBuffer>
    </main>
  );
}
