const TOKEN_COOKIE = "lms_access_token";
const ONE_WEEK_SECONDS = 60 * 60 * 24 * 7;

function isClient() {
  return typeof document !== "undefined";
}

function readCookie(name: string): string | null {
  if (!isClient()) return null;

  const encodedName = `${encodeURIComponent(name)}=`;
  const parts = document.cookie.split("; ");

  for (const part of parts) {
    if (part.startsWith(encodedName)) {
      return decodeURIComponent(part.slice(encodedName.length));
    }
  }

  return null;
}

function writeCookie(name: string, value: string, maxAgeSeconds = ONE_WEEK_SECONDS) {
  if (!isClient()) return;

  document.cookie = `${encodeURIComponent(name)}=${encodeURIComponent(
    value,
  )}; Path=/; Max-Age=${maxAgeSeconds}; SameSite=Lax`;
}

function clearCookie(name: string) {
  if (!isClient()) return;
  document.cookie = `${encodeURIComponent(name)}=; Path=/; Max-Age=0; SameSite=Lax`;
}

export function getAuthToken(): string | null {
  return readCookie(TOKEN_COOKIE);
}

export function setAuthToken(token: string): void {
  writeCookie(TOKEN_COOKIE, token);
}

export function clearAuthToken(): void {
  clearCookie(TOKEN_COOKIE);
}
