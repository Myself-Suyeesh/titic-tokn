const SECURE_AUTOCOMPLETE = new Set([
  'current-password',
  'new-password',
  'one-time-code',
]);

/**
 * True for fields whose content must never be read: password inputs and
 * payment or one-time-code fields.
 */
export function isSecureField(el: Element): boolean {
  if (el instanceof HTMLInputElement && el.type === 'password') return true;
  const tokens = (el.getAttribute('autocomplete') ?? '').toLowerCase().split(/\s+/);
  return tokens.some((t) => t.startsWith('cc-') || SECURE_AUTOCOMPLETE.has(t));
}
