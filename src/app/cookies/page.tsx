import type { Metadata } from 'next';
import { LegalPage, LegalSection } from '@/components/site/LegalPage';
import { canonicalUrl } from '@/lib/site';
import { CookiePreferencesButton } from '@/components/site/CookieConsent';

export const metadata: Metadata = {
  title: 'Cookie Notice',
  description: 'Information about cookies and similar technologies on this website.',
  alternates: canonicalUrl('/cookies') ? { canonical: canonicalUrl('/cookies') } : undefined,
};

export default function CookiesPage() {
  return (
    <LegalPage motion="cookies" eyebrow="Cookie notice" title="A considered approach to browser data." intro="This notice describes the use of cookies and similar technologies in the current website experience. We aim to keep the site functional without unnecessary tracking.">
      <LegalSection title="Current use">
        <p>No analytics, advertising, or cross-site tracking tags were found in the current app. Those trackers are not loaded before consent. The cinematic homepage uses session storage to remember whether its introduction was shown, and the browser Cache API to cache the architecture video. A consent preference is stored in local storage. These functions support site behavior and preference storage; they are not used to build advertising profiles.</p>
      </LegalSection>
      <LegalSection title="Technical request data">
        <p>The hosting and delivery services that make the website available may process technical request information, such as network address, device/browser details, and requested pages, for security, delivery, and troubleshooting. Their use of cookies or logs is governed by their own configurations and notices.</p>
      </LegalSection>
      <LegalSection title="Inquiry delivery">
        <p>If you submit the project form, its data is handled as described in the <a className="quiet-interaction text-[#C5A059] underline underline-offset-4 hover:text-[#F4F4F0]" href="/privacy">Privacy Notice</a>. The form does not require an analytics or advertising cookie.</p>
      </LegalSection>
      <LegalSection title="Managing cookies">
        <p>This site currently has no optional analytics or advertising trackers to enable. The first-visit choice is saved in this browser so the notice does not reappear, but it is not advance consent to future trackers. You can clear site storage through your browser settings to show it again. If optional trackers are introduced, they must remain disabled until they are explained and a fresh choice is obtained.</p>
        <p><CookiePreferencesButton /></p>
      </LegalSection>
    </LegalPage>
  );
}
