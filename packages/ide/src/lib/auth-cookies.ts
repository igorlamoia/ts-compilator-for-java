const USER_ID_COOKIE = "lms_user_id";
const ORG_ID_COOKIE = "lms_org_id";
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

export function getAuthCookies() {
  return {
    userId: readCookie(USER_ID_COOKIE),
    organizationId: readCookie(ORG_ID_COOKIE),
  };
}

export function setAuthCookies(userId: string, organizationId: string) {
  writeCookie(USER_ID_COOKIE, userId);
  writeCookie(ORG_ID_COOKIE, organizationId);
}

export function clearAuthCookies() {
  clearCookie(USER_ID_COOKIE);
  clearCookie(ORG_ID_COOKIE);
}
