'use client';

import { useEffect, useState } from 'react';

const STORAGE_KEY = '1485-cookie-consent-v1';

export function CookieConsent() {
  const [choice, setChoice] = useState<'accepted' | 'rejected' | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let hasSavedChoice = false;
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (saved === 'accepted' || saved === 'rejected') {
        hasSavedChoice = true;
        setChoice(saved);
      }
    } catch {
      // If storage is unavailable, still show the notice after the delay.
    }
    const timer = hasSavedChoice ? undefined : window.setTimeout(() => setVisible(true), 10_000);
    const reopen = () => {
      setChoice(null);
      setVisible(true);
    };
    window.addEventListener('1485-cookie-preferences', reopen);
    return () => {
      if (timer !== undefined) window.clearTimeout(timer);
      window.removeEventListener('1485-cookie-preferences', reopen);
    };
  }, []);

  function save(value: 'accepted' | 'rejected') {
    setChoice(value);
    setVisible(false);
    try {
      window.localStorage.setItem(STORAGE_KEY, value);
    } catch {
      // The choice still applies for the current visit if persistence is blocked.
    }
  }

  if (!visible || choice) return null;

  return (
    <div className="privacy-consent-overlay fixed inset-0 z-[110] flex items-end justify-center bg-black/75 px-3 pb-4 pt-3 backdrop-blur-[2px] sm:px-6 sm:pb-6">
      <aside role="dialog" aria-modal="true" aria-labelledby="privacy-choice-title" aria-describedby="privacy-choice-description" className="privacy-consent-card w-full max-w-[19rem] rounded-xl border border-white/20 bg-[#111820]/75 p-3.5 shadow-2xl backdrop-blur-2xl sm:max-w-[20rem] sm:p-4">
        <p id="privacy-choice-title" className="text-xs font-medium text-[#F4F4F0]">Your privacy choices</p>
        <p id="privacy-choice-description" className="mt-1.5 text-[10px] leading-4 text-white/70">No analytics or ad trackers run on this site. Your choice is saved in this browser. If that changes, we’ll explain what’s being added and ask again first.</p>
        <a href="/cookies" className="mt-1.5 inline-block text-[10px] text-[#C5A059] underline underline-offset-4">Cookie notice</a>
        <div className="mt-3 flex gap-1.5">
          <button type="button" onClick={() => save('rejected')} className="min-h-8 flex-1 rounded-md border border-white/30 px-2 text-[8px] uppercase tracking-[0.08em] text-[#F4F4F0] hover:border-[#C5A059]">Reject optional</button>
          <button type="button" onClick={() => save('accepted')} className="min-h-8 flex-1 rounded-md border border-[#C5A059] bg-[#C5A059] px-2 text-[8px] uppercase tracking-[0.08em] text-[#080808] hover:bg-transparent hover:text-[#C5A059]">Accept optional</button>
        </div>
      </aside>
    </div>
  );
}

export function CookiePreferencesButton() {
  return <button type="button" onClick={() => window.dispatchEvent(new Event('1485-cookie-preferences'))} className="text-left text-[#C5A059] underline underline-offset-4">Change cookie preferences</button>;
}
