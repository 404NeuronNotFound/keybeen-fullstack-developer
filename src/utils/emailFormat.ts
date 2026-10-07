/** Local syntax check only; this does not verify mailbox delivery. */
export function isEmailFormatValid(email: string): boolean {
  const address = email.trim();
  return address.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(address);
}
