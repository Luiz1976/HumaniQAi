export function storageKeyForUser(userId: string): string {
  return `humaniq:avatar:${userId}`;
}

export function getAvatar(userId: string): string | null {
  if (typeof window === 'undefined') return null;
  try {
    const key = storageKeyForUser(userId);
    const val = window.localStorage.getItem(key);
    return val && val.length > 0 ? val : null;
  } catch {
    return null;
  }
}

export function saveAvatar(userId: string, avatar: string): boolean {
  if (typeof window === 'undefined') return false;
  if (typeof avatar !== 'string') return false;
  const isImageData = avatar.startsWith('data:image/');
  const isHttpUrl = avatar.startsWith('http://') || avatar.startsWith('https://');
  if (!isImageData && !isHttpUrl) return false;
  try {
    const key = storageKeyForUser(userId);
    window.localStorage.setItem(key, avatar);
    return true;
  } catch {
    return false;
  }
}

export function clearAvatar(userId: string): void {
  if (typeof window === 'undefined') return;
  try {
    const key = storageKeyForUser(userId);
    window.localStorage.removeItem(key);
  } catch {}
}
