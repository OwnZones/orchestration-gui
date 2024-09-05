export function getAuthorizationHeader() {
  if (process.env.LIVE_CREDENTIALS) {
    return `Basic ${Buffer.from(process.env.LIVE_CREDENTIALS).toString(
      'base64'
    )}`;
  }
  return '';
}
