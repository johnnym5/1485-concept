import type { Metadata } from 'next';
import { LegalPage, LegalSection } from '@/components/site/LegalPage';
import { canonicalUrl } from '@/lib/site';

export const metadata: Metadata = {
  title: 'Website Terms',
  description: 'Terms for using the 14.85 Concept Limited website.',
  alternates: canonicalUrl('/terms') ? { canonical: canonicalUrl('/terms') } : undefined,
};

export default function TermsPage() {
  return (
    <LegalPage motion="terms" eyebrow="Website terms" title="A clear basis for using this site." intro="These terms apply to your use of the 14.85 Concept Limited website. By using the site, you agree to use it lawfully and in a way that does not disrupt its operation or infringe another person’s rights.">
      <LegalSection title="Website information">
        <p>The website presents general information about the practice and its design and engineering coordination services. It is provided for information and discussion. Content is not a project proposal, fee quotation, technical specification, or professional advice for a particular site.</p>
      </LegalSection>
      <LegalSection title="Project inquiries">
        <p>Submitting the inquiry form starts a conversation only. It does not create a client, consultant, construction, or other professional relationship, and does not reserve capacity or accept a project. Any appointment, scope, fees, programme, deliverables, and responsibilities must be set out in a separate written agreement.</p>
      </LegalSection>
      <LegalSection title="Intellectual property">
        <p>Unless a page states otherwise, the site’s text, visual identity, graphics, and other materials are owned by or used with permission by 14.85 Concept Limited. You may view and share links to the site for personal or business evaluation. You may not reproduce, adapt, publish, or commercially use site materials without prior written permission or another applicable legal basis.</p>
      </LegalSection>
      <LegalSection title="Acceptable use and availability">
        <p>Do not attempt to gain unauthorised access, interfere with the site, introduce malicious code, or use the inquiry form to submit unlawful, deceptive, or harmful material. We may update, suspend, or remove site content as the practice and its services develop. We do not promise uninterrupted availability or that every item of information is complete for every purpose.</p>
      </LegalSection>
      <LegalSection title="External services and changes">
        <p>Links to third-party websites are provided for convenience. Their content and practices are controlled by those providers and are subject to their own terms. These terms may be updated from time to time; the date above indicates the latest published revision.</p>
      </LegalSection>
      <LegalSection title="Contact">
        <p>For a question about these terms, use the <a className="quiet-interaction text-[#C5A059] underline underline-offset-4 hover:text-[#F4F4F0]" href="/contact">project contact form</a> and identify your question. A separate written project agreement will govern any commissioned work.</p>
      </LegalSection>
    </LegalPage>
  );
}
