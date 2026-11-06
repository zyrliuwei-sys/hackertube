export function analyticsAllowed({
  consent,
  consentRequired = false,
  dnt,
  gpc,
}: {
  consent?: string | null;
  consentRequired?: boolean;
  dnt?: string | null;
  gpc?: string | null;
}) {
  return (
    dnt !== '1' &&
    gpc !== '1' &&
    consent !== 'rejected' &&
    (!consentRequired || consent === 'accepted')
  );
}
