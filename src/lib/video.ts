/**
 * Normalises whatever YouTube link gets pasted into NEXT_PUBLIC_TUTORIAL_VIDEO_URL
 * (share link, watch link, bare id) into an embeddable one. Returns null for
 * anything unrecognised so the page renders without a broken player.
 *
 * youtube-nocookie.com, not youtube.com: the cookie banner promises no
 * advertising trackers, and the regular embed domain sets them.
 */
export function youtubeEmbedUrl(raw?: string | null): string | null {
  const value = raw?.trim();
  if (!value) return null;

  let id = value;
  try {
    const url = new URL(value);
    if (url.hostname.endsWith("youtu.be")) id = url.pathname.slice(1);
    else if (url.pathname.startsWith("/embed/")) id = url.pathname.slice("/embed/".length);
    else id = url.searchParams.get("v") ?? "";
  } catch {
    // Not a URL — treat the whole string as a bare video id.
  }

  id = id.split("/")[0]?.split("?")[0] ?? "";
  if (!/^[\w-]{6,24}$/.test(id)) return null;
  return `https://www.youtube-nocookie.com/embed/${id}`;
}
