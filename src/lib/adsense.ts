/** Publisher IDs are public identifiers, but never accept placeholders or script text. */
export function adsenseClient(value: string | undefined) {
  const raw = value?.trim() ?? '';
  if (!/^(?:ca-)?pub-\d{16}$/.test(raw)) return '';
  return raw.startsWith('ca-') ? raw : `ca-${raw}`;
}

export function adsTxt(value: string | undefined) {
  const client = adsenseClient(value);
  return client
    ? `google.com, ${client.slice(3)}, DIRECT, f08c47fec0942fa0\n`
    : '';
}
