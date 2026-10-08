import type { Metadata } from 'next';
import { LegalPage, LegalSection } from '@/components/site/LegalPage';
import { canonicalUrl } from '@/lib/site';
import { PrivacyRequestForm } from '@/components/site/PrivacyRequestForm';

export const metadata: Metadata = {
  title: 'Privacy Notice',
  description: 'How 14.85 Concept Limited handles information submitted through this website.',
  alternates: canonicalUrl('/privacy') ? { canonical: canonicalUrl('/privacy') } : undefined,
};

export default function PrivacyPage() {
  return (
    <LegalPage motion="privacy" eyebrow="Privacy notice" title="Privacy, handled with care." intro="This notice explains what information this website receives when you submit a project inquiry, why it is used, and the choices available to you. It describes the current inquiry form and should be read alongside any notices provided by the service providers involved in delivering your message.">
      <LegalSection title="Information you provide">
        <p>The project inquiry form asks for your name, email address, project type, project location, estimated budget range, and a description of your project scope. Please avoid including sensitive personal information or information that you are not authorised to share.</p>
      </LegalSection>
      <LegalSection title="Who is responsible">
        <p>14.85 Concept Limited is responsible for the inquiry information submitted through this website. A privacy contact email and business correspondence address have not yet been confirmed for publication; those contact details must be added before launch.</p>
      </LegalSection>
      <LegalSection title="How it is used">
        <p>We use these details to receive, assess, and respond to your inquiry, and to continue the conversation if you choose to proceed. 14.85 Concept Limited does not use inquiry details to train AI models, and this app has no AI service or model-training integration. The form is validated on the server. A submission is treated as received only after the configured mail service accepts it.</p>
      </LegalSection>
      <LegalSection title="Who receives it">
        <p>When inquiry delivery is configured, the details are sent to the inquiry recipient designated by 14.85 Concept Limited using its mail service provider. The mail provider processes the message to deliver and store it according to its own terms and privacy information. We do not sell inquiry details. The production hosting, CDN, and email-provider identities and relevant processing locations have not yet been confirmed for publication; this disclosure must be completed before launch.</p>
      </LegalSection>
      <LegalSection title="Retention and security">
        <p>Inquiry details may remain in the recipient mailbox and the mail provider’s systems for as long as needed to handle the inquiry and related records. A specific retention period and deletion schedule have not yet been set and must be confirmed before launch. The website has no user account or database from which it can automatically export or erase mailbox records. Requests are therefore reviewed and fulfilled manually, including checking provider-side retention and backups. The responsible operator should apply appropriate access and security controls to the receiving mailbox and provider account.</p>
      </LegalSection>
      <LegalSection title="Your choices and rights">
        <p>You may ask to access or export, correct, or delete personal information you submitted, or raise an objection or other privacy concern using the request form below. Requests are routed to the configured privacy recipient (or, if none is configured, the inquiry recipient) for manual review. We may verify identity before providing a copy or making a change. Requests are handled under applicable data protection requirements. You may also contact the Nigeria Data Protection Commission for information about your rights and complaint process.</p>
        <p><a className="quiet-interaction text-[#C5A059] underline underline-offset-4 hover:text-[#F4F4F0]" href="https://ndpc.gov.ng/" target="_blank" rel="noreferrer">Nigeria Data Protection Commission ↗</a></p>
      </LegalSection>
      <LegalSection title="Submit a privacy request">
        <PrivacyRequestForm />
      </LegalSection>
      <LegalSection title="Business processing agreements">
        <p>This website currently receives project inquiries as a business contact. It does not offer a customer account or hosted data-processing service. A business data-processing addendum for any separately commissioned project has not yet been published; contact us before sharing personal data under a business engagement so the parties can document their roles, instructions, security measures, and subprocessors. Provider names and business contact details remain pending confirmation.</p>
      </LegalSection>
      <LegalSection title="AI and marketing">
        <p>The inquiry form is not connected to an AI assistant or marketing mailing list. We do not use submitted inquiries for AI model training and do not send marketing emails through this form. If that changes, the relevant disclosures and choices will be updated first.</p>
      </LegalSection>
      <LegalSection title="Updates">
        <p>This notice may change when website features, inquiry handling, or service providers change. The date above identifies the latest published revision. Please review it periodically before submitting information.</p>
      </LegalSection>
    </LegalPage>
  );
}
