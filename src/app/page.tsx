import LoadingBuffer from '@/components/canvas/LoadingBuffer';
import HomeSections from '@/components/site/HomeSections';
import { canonicalUrl } from '@/lib/site';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: { absolute: '14.85 Concept Limited — Architecture & Engineering' },
  description: 'Explore architectural design and coordinated engineering for commercial, residential, hospitality, and mixed-use projects.',
  alternates: canonicalUrl('/') ? { canonical: canonicalUrl('/') } : undefined,
};

export default function Home() {
  return (
    <main className="min-h-screen bg-[#080808]">
      <LoadingBuffer />
      <HomeSections />
    </main>
  );
}
