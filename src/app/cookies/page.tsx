import type { Metadata } from 'next';
import { LegalPage, LegalSection } from '@/components/site/LegalPage';
import { canonicalUrl } from '@/lib/site';

export const metadata: Metadata = {
  title: 'Cookie Notice',
  description: 'Information about cookies and similar technologies on this website.',
  alternates: canonicalUrl('/cookies') ? { canonical: canonicalUrl('/cookies') } : undefined,
};

export default function CookiesPage() {
  return (
    <LegalPage motion="cookies" eyebrow="Cookie notice" title="A considered approach to browser data." intro="This notice describes the use of cookies and similar technologies in the current website experience. We aim to keep the site functional without unnecessary tracking.">
      <LegalSection title="Current use">
        <p>The current website implementation does not intentionally set analytics or advertising cookies, and does not use browser storage to build advertising profiles. The cinematic homepage uses browser-based image loading and animation; those functions do not require an advertising cookie.</p>
      </LegalSection>
      <LegalSection title="Technical request data">
        <p>The hosting and delivery services that make the website available may process technical request information, such as network address, device/browser details, and requested pages, for security, delivery, and troubleshooting. Their use of cookies or logs is governed by their own configurations and notices.</p>
      </LegalSection>
      <LegalSection title="Inquiry delivery">
        <p>If you submit the project form, its data is handled as described in the <a className="quiet-interaction text-[#C5A059] underline underline-offset-4 hover:text-[#F4F4F0]" href="/privacy">Privacy Notice</a>. The form does not require an analytics or advertising cookie.</p>
      </LegalSection>
      <LegalSection title="Managing cookies">
        <p>You can review or clear cookies through your browser settings. Blocking all cookies may affect features on some websites. If this site adds optional cookies or similar tracking in the future, this notice will be updated and any required choices will be presented.</p>
      </LegalSection>
    </LegalPage>
  );
}
