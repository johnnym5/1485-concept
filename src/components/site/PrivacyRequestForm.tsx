'use client';

import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { submitPrivacyRequest, type PrivacyActionState } from '@/app/actions/privacy';

const initialState: PrivacyActionState = { status: 'idle', message: '' };

function SubmitButton() {
  const { pending } = useFormStatus();
  return <button type="submit" disabled={pending} className="min-h-11 border border-[#C5A059] bg-[#C5A059] px-5 text-[10px] uppercase tracking-[0.15em] text-[#080808] hover:bg-transparent hover:text-[#C5A059] disabled:opacity-60">{pending ? 'Sending…' : 'Send privacy request'}</button>;
}

export function PrivacyRequestForm() {
  const [state, formAction] = useActionState(submitPrivacyRequest, initialState);
  return (
    <form action={formAction} className="space-y-4" id="privacy-request">
      <div className="absolute -left-[10000px] top-auto h-px w-px overflow-hidden" aria-hidden="true">
        <label htmlFor="privacy-company-website">Company website</label>
        <input id="privacy-company-website" name="companyWebsite" type="text" tabIndex={-1} autoComplete="off" />
      </div>
      <label className="block text-xs text-white/75">Name
        <input name="name" autoComplete="name" required minLength={2} maxLength={100} className="mt-2 min-h-11 w-full border border-white/20 bg-white/[0.04] px-3 text-sm text-white outline-none focus:border-[#C5A059]" />
      </label>
      <label className="block text-xs text-white/75">Email address
        <input name="email" type="email" autoComplete="email" required maxLength={254} className="mt-2 min-h-11 w-full border border-white/20 bg-white/[0.04] px-3 text-sm text-white outline-none focus:border-[#C5A059]" />
      </label>
      <label className="block text-xs text-white/75">Request type
        <select name="requestType" required defaultValue="" className="mt-2 min-h-11 w-full border border-white/20 bg-[#10202D] px-3 text-sm text-white outline-none focus:border-[#C5A059]">
          <option value="" disabled>Select a request</option>
          <option value="access">Access my information</option>
          <option value="export">Export a copy of my information</option>
          <option value="correction">Correct my information</option>
          <option value="deletion">Delete my information</option>
          <option value="objection">Object or ask a privacy question</option>
        </select>
      </label>
      <label className="block text-xs text-white/75">Details (optional)
        <textarea name="details" maxLength={2000} rows={4} className="mt-2 w-full resize-y border border-white/20 bg-white/[0.04] px-3 py-2 text-sm text-white outline-none focus:border-[#C5A059]" />
      </label>
      <p className="text-xs leading-6 text-white/55">Please do not include passwords, identity documents, or sensitive personal details here. We may need to verify your identity before acting on a request.</p>
      <SubmitButton />
      <p aria-live="polite" className={`text-xs leading-6 ${state.status === 'error' ? 'text-red-300' : 'text-[#C5A059]'}`}>{state.message}</p>
    </form>
  );
}
