'use client';

import { useFormState, useFormStatus } from 'react-dom';
import { submitRfq, type RfqActionState } from '@/app/actions/rfq';

const initialState: RfqActionState = { status: 'idle', message: '' };

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="quiet-interaction inline-flex min-h-9 w-full items-center justify-center rounded-lg border border-[#C5A059] bg-[#C5A059] px-4 text-[9px] font-medium uppercase tracking-[0.14em] text-[#080808] hover:bg-transparent hover:text-[#C5A059] disabled:cursor-wait disabled:opacity-60 sm:min-h-14 sm:rounded-sm sm:px-6 sm:text-xs sm:tracking-[0.18em]"
    >
      {pending ? 'Sending request…' : 'Discuss your project'}
    </button>
  );
}

export default function RfqForm({ animated = false }: { animated?: boolean }) {
  const [state, formAction] = useFormState(submitRfq, initialState);
  const reveal = animated ? { 'data-rfq-reveal': true } : {};

  return (
    <form action={formAction} className="space-y-1.5 sm:space-y-5">
      <div className="absolute -left-[10000px] top-auto h-px w-px overflow-hidden" aria-hidden="true">
        <label htmlFor={animated ? 'companyWebsite-journey' : 'companyWebsite-contact'}>Company website</label>
        <input id={animated ? 'companyWebsite-journey' : 'companyWebsite-contact'} name="companyWebsite" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      <div className="rfq-field-pair">
        <label {...reveal} className="block text-[10px] leading-4 tracking-wide text-[#F4F4F0]/85 sm:text-sm sm:leading-normal">
          Name
          <input
            name="name"
            type="text"
            autoComplete="name"
            required
            minLength={2}
            maxLength={100}
            className="quiet-interaction mt-0.5 min-h-8 w-full rounded-lg border border-white/20 bg-white/[0.055] px-2.5 text-xs text-[#F4F4F0] outline-none placeholder:text-white/40 focus:border-[#C5A059] sm:mt-2 sm:min-h-12 sm:rounded-xl sm:px-3.5 sm:text-base"
            placeholder="Your name"
          />
        </label>

        <label {...reveal} className="block text-[10px] leading-4 tracking-wide text-[#F4F4F0]/85 sm:text-sm sm:leading-normal">
          Email
          <input
            name="email"
            type="email"
            autoComplete="email"
            required
            maxLength={254}
            className="quiet-interaction mt-0.5 min-h-8 w-full rounded-lg border border-white/20 bg-white/[0.055] px-2.5 text-xs text-[#F4F4F0] outline-none placeholder:text-white/40 focus:border-[#C5A059] sm:mt-2 sm:min-h-12 sm:rounded-xl sm:px-3.5 sm:text-base"
            placeholder="you@company.com"
          />
        </label>
      </div>

      <div className="rfq-field-pair">
        <label {...reveal} className="block text-[10px] leading-4 tracking-wide text-[#F4F4F0]/85 sm:text-sm sm:leading-normal">
          Project type
          <select
            name="projectType"
            required
            defaultValue=""
            className="quiet-interaction mt-0.5 min-h-8 w-full rounded-lg border border-white/20 bg-[#10202D] px-2.5 text-xs text-[#F4F4F0] outline-none focus:border-[#C5A059] sm:mt-2 sm:min-h-12 sm:rounded-xl sm:px-3.5 sm:text-base"
          >
            <option value="" disabled>Select a project type</option>
            <option value="residential">Residential</option>
            <option value="commercial">Commercial</option>
            <option value="hospitality">Hospitality</option>
            <option value="mixed-use">Mixed-use</option>
            <option value="other">Other</option>
          </select>
        </label>

        <label {...reveal} className="block text-[10px] leading-4 tracking-wide text-[#F4F4F0]/85 sm:text-sm sm:leading-normal">
          Project location
          <input
            name="location"
            type="text"
            autoComplete="address-level2"
            required
            minLength={2}
            maxLength={120}
            className="quiet-interaction mt-0.5 min-h-8 w-full rounded-lg border border-white/20 bg-white/[0.055] px-2.5 text-xs text-[#F4F4F0] outline-none placeholder:text-white/40 focus:border-[#C5A059] sm:mt-2 sm:min-h-12 sm:rounded-xl sm:px-3.5 sm:text-base"
            placeholder="City and state"
          />
        </label>
      </div>

      <label {...reveal} className="block text-[10px] leading-4 tracking-wide text-[#F4F4F0]/85 sm:text-sm sm:leading-normal">
        Project scope
        <textarea
          name="scope"
          required
          minLength={10}
          maxLength={4000}
          rows={2}
          className="quiet-interaction mt-0.5 min-h-12 w-full resize-none rounded-lg border border-white/20 bg-white/[0.055] px-2.5 py-1.5 text-xs text-[#F4F4F0] outline-none placeholder:text-white/40 focus:border-[#C5A059] sm:mt-2 sm:min-h-28 sm:resize-y sm:rounded-xl sm:px-3.5 sm:py-3 sm:text-base"
          placeholder="Share the project stage, what you are planning, and the support you need."
        />
      </label>

      <label {...reveal} className="block text-[10px] leading-4 tracking-wide text-[#F4F4F0]/85 sm:text-sm sm:leading-normal">
        Estimated budget
        <select
          name="budget"
          required
          defaultValue=""
          className="quiet-interaction mt-0.5 min-h-8 w-full rounded-lg border border-white/20 bg-[#10202D] px-2.5 text-xs text-[#F4F4F0] outline-none focus:border-[#C5A059] sm:mt-2 sm:min-h-12 sm:rounded-xl sm:px-3.5 sm:text-base"
        >
          <option value="" disabled>Select a range</option>
          <option value="under-50m">Under ₦50 million</option>
          <option value="50m-150m">₦50 million–₦150 million</option>
          <option value="150m-500m">₦150 million–₦500 million</option>
          <option value="over-500m">Over ₦500 million</option>
          <option value="not-sure">Not sure yet</option>
        </select>
      </label>

      <div {...reveal} className="pt-0.5 sm:pt-1"><SubmitButton /></div>
      <p aria-live="polite" className={`text-[10px] leading-4 sm:text-sm sm:leading-6 ${!state.message && state.status === 'idle' ? 'hidden sm:block' : ''} ${state.status === 'success' ? 'text-[#C5A059]' : 'text-[#F4F4F0]/70'}`}>
        {state.message || 'We aim to respond within two business days.'}
      </p>
    </form>
  );
}
