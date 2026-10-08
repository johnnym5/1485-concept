import type { Metadata } from 'next';
import { LegalPage, LegalSection } from '@/components/site/LegalPage';
import { canonicalUrl } from '@/lib/site';

export const metadata: Metadata = {
  title: 'Service Providers and Subprocessors',
  description: 'Service providers involved in delivering the 14.85 Concept Limited website.',
  alternates: canonicalUrl('/subprocessors') ? { canonical: canonicalUrl('/subprocessors') } : undefined,
};

export default function SubprocessorsPage() {
  return (
    <LegalPage motion="subprocessors" eyebrow="Service providers" title="Who helps deliver this site." intro="This page will identify service providers that process personal information for the website. Production provider names and processing locations have not yet been confirmed, so the inventory below is explicitly pending verification.">
      <LegalSection title="Current inventory">
        <p><strong className="text-[#F4F4F0]">Website hosting and content delivery:</strong> pending confirmation of the production host and CDN.</p>
        <p><strong className="text-[#F4F4F0]">Inquiry and privacy-request email:</strong> SMTP provider pending confirmation. The application sends inquiry details to the configured recipient and may use a separately configured privacy recipient.</p>
      </LegalSection>
      <LegalSection title="Before launch">
        <p>The production operator must replace these pending entries with each provider’s legal name, service, processing location, and relevant privacy or data-processing terms. This page must be reviewed whenever a provider changes.</p>
      </LegalSection>
    </LegalPage>
  );
}
