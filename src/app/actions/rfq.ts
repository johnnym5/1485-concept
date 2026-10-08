'use server';

import { headers } from 'next/headers';
import nodemailer from 'nodemailer';
import { z } from 'zod';

export interface RfqActionState {
  status: 'idle' | 'success' | 'error';
  message: string;
}

const rfqSchema = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.string().trim().min(3).max(254).email(),
  projectType: z.enum(['residential', 'commercial', 'hospitality', 'mixed-use', 'other']),
  location: z.string().trim().min(2).max(120),
  scope: z.string().trim().min(10).max(4000),
  budget: z.enum(['under-50m', '50m-150m', '150m-500m', 'over-500m', 'not-sure']),
  acceptTerms: z.literal('yes'),
});

const failure: RfqActionState = {
  status: 'error',
  message: 'We could not submit your request. Please check your details and try again later.',
};
const success: RfqActionState = {
  status: 'success',
  message: 'Your project inquiry has been received. We will respond within two business days.',
};

const RATE_WINDOW_MS = 15 * 60 * 1000;
const RATE_LIMIT = 4;
const globalRateLimit = globalThis as typeof globalThis & {
  __rfqRateLimit?: Map<string, { count: number; resetAt: number }>;
};
const attempts = (globalRateLimit.__rfqRateLimit ??= new Map());

function isRateLimited(address: string, now: number) {
  for (const [key, record] of attempts) {
    if (record.resetAt <= now) attempts.delete(key);
  }
  if (attempts.size >= 5000 && !attempts.has(address)) {
    const oldestAddress = attempts.keys().next().value;
    if (oldestAddress !== undefined) attempts.delete(oldestAddress);
  }

  const record = attempts.get(address);
  if (record && record.resetAt > now) {
    if (record.count >= RATE_LIMIT) return true;
    record.count += 1;
    return false;
  }

  attempts.set(address, { count: 1, resetAt: now + RATE_WINDOW_MS });
  return false;
}

async function getClientAddress() {
  const requestHeaders = await headers();
  const forwardedFor = requestHeaders.get('x-forwarded-for')?.split(',')[0]?.trim();
  return requestHeaders.get('x-real-ip')?.trim() || forwardedFor || 'unknown';
}

export async function submitRfq(
  _previousState: RfqActionState,
  formData: FormData,
): Promise<RfqActionState> {
  if (isRateLimited(await getClientAddress(), Date.now())) return failure;

  // Honeypot: respond generically without forwarding a bot submission.
  if (String(formData.get('companyWebsite') ?? '').trim()) return failure;

  const parsed = rfqSchema.safeParse({
    name: formData.get('name'),
    email: formData.get('email'),
    projectType: formData.get('projectType'),
    location: formData.get('location'),
    scope: formData.get('scope'),
    budget: formData.get('budget'),
    acceptTerms: formData.get('acceptTerms'),
  });
  if (!parsed.success) return failure;

  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT);
  const user = process.env.SMTP_USER;
  const password = process.env.SMTP_PASSWORD;
  const from = process.env.RFQ_FROM_EMAIL;
  const to = process.env.RFQ_TO_EMAIL;
  if (!host || !Number.isInteger(port) || port < 1 || port > 65535 || !user || !password || !from || !to) return failure;

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
      from: { name: '14.85 Concept Limited — Website Inquiry', address: from },
      to,
      replyTo: parsed.data.email,
      subject: 'New project inquiry from the 14.85 website',
      text: [
        'New project inquiry',
        '',
        `Name: ${parsed.data.name}`,
        `Email: ${parsed.data.email}`,
        `Project type: ${parsed.data.projectType}`,
        `Location: ${parsed.data.location}`,
        `Estimated budget: ${parsed.data.budget}`,
        `Website terms accepted: yes (${new Date().toISOString()})`,
        '',
        'Project scope:',
        parsed.data.scope,
      ].join('\n'),
    });
    return success;
  } catch {
    return failure;
  } finally {
    transporter.close();
  }
}
