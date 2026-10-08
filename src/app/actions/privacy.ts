'use server';

import { headers } from 'next/headers';
import nodemailer from 'nodemailer';
import { z } from 'zod';

export interface PrivacyActionState {
  status: 'idle' | 'success' | 'error';
  message: string;
}

const requestSchema = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.string().trim().email().max(254),
  requestType: z.enum(['access', 'export', 'correction', 'deletion', 'objection']),
  details: z.string().trim().max(2000),
});

const genericError: PrivacyActionState = {
  status: 'error',
  message: 'We could not send your request. Please try again later or use the contact page.',
};

const globalPrivacyLimits = globalThis as typeof globalThis & {
  __privacyRequestLimits?: Map<string, { count: number; resetAt: number }>;
};
const limits = (globalPrivacyLimits.__privacyRequestLimits ??= new Map());

async function requestAddress() {
  const requestHeaders = await headers();
  return requestHeaders.get('x-real-ip')?.trim()
    || requestHeaders.get('x-forwarded-for')?.split(',')[0]?.trim()
    || 'unknown';
}

export async function submitPrivacyRequest(
  _previousState: PrivacyActionState,
  formData: FormData,
): Promise<PrivacyActionState> {
  const address = await requestAddress();
  const now = Date.now();
  for (const [key, value] of limits) if (value.resetAt <= now) limits.delete(key);
  const existing = limits.get(address);
  if (existing && existing.count >= 3) return genericError;
  limits.set(address, existing ? { ...existing, count: existing.count + 1 } : { count: 1, resetAt: now + 60 * 60 * 1000 });
  if (String(formData.get('companyWebsite') ?? '').trim()) return genericError;

  const parsed = requestSchema.safeParse({
    name: formData.get('name'),
    email: formData.get('email'),
    requestType: formData.get('requestType'),
    details: formData.get('details') ?? '',
  });
  if (!parsed.success) return genericError;

  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT);
  const user = process.env.SMTP_USER;
  const password = process.env.SMTP_PASSWORD;
  const from = process.env.RFQ_FROM_EMAIL;
  const to = process.env.PRIVACY_TO_EMAIL || process.env.RFQ_TO_EMAIL;
  if (!host || !Number.isInteger(port) || port < 1 || port > 65535 || !user || !password || !from || !to) return genericError;

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure: process.env.SMTP_SECURE === 'true' || port === 465,
    auth: { user, pass: password },
    connectionTimeout: 5000,
    greetingTimeout: 5000,
    socketTimeout: 8000,
  });
  try {
    await transporter.sendMail({
      from: { name: '14.85 Concept Limited — Privacy Request', address: from },
      to,
      replyTo: parsed.data.email,
      subject: `Privacy request: ${parsed.data.requestType}`,
      text: [
        'Website privacy rights request',
        '',
        `Name: ${parsed.data.name}`,
        `Email: ${parsed.data.email}`,
        `Request: ${parsed.data.requestType}`,
        `Submitted: ${new Date().toISOString()}`,
        '',
        'Details:',
        parsed.data.details || '(none provided)',
        '',
        'Please verify the requester’s identity before disclosing, correcting, or deleting personal information.',
      ].join('\n'),
    });
    return { status: 'success', message: 'Your privacy request has been sent. We will review it under applicable data protection requirements.' };
  } catch {
    return genericError;
  } finally {
    transporter.close();
  }
}
