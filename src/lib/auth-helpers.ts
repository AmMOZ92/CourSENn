import { UserProfile } from '../types';

export const OWNER_EMAIL = 'falldiagne28@gmail.com';
export const OWNER_PHONE_RAW = '0607463625';

/**
 * Normalise a phone number by stripping spaces, dots, dashes, and international prefixes (+212 or 00212).
 * e.g. "+212 6 07 46 36 25" -> "0607463625"
 * e.g. "0607463625" -> "0607463625"
 */
export function normalizePhoneNumber(phone?: string | null): string {
  if (!phone) return '';
  let cleaned = phone.replace(/[\s\.\-\(\)]/g, '');
  if (cleaned.startsWith('+212')) {
    cleaned = '0' + cleaned.slice(4);
  } else if (cleaned.startsWith('00212')) {
    cleaned = '0' + cleaned.slice(5);
  } else if (cleaned.startsWith('212')) {
    cleaned = '0' + cleaned.slice(3);
  }
  return cleaned;
}

/**
 * Checks whether the specified user profile is the verified platform owner/admin.
 * Strict match on email 'falldiagne28@gmail.com' OR phone '0607463625' (or admin role).
 */
export function isPlatformOwner(user?: UserProfile | null): boolean {
  if (!user) return false;

  const emailMatch = user.email?.trim().toLowerCase() === OWNER_EMAIL.toLowerCase();
  const phoneNormalized = normalizePhoneNumber(user.telephone);
  const ownerPhoneNormalized = normalizePhoneNumber(OWN_PHONE_MATCH);
  const phoneMatch = Boolean(phoneNormalized && (phoneNormalized === ownerPhoneNormalized || phoneNormalized === '0607463625'));

  return emailMatch || phoneMatch;
}

const OWN_PHONE_MATCH = '0607463625';
