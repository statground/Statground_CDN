/**
 * scripts/common/net.js
 * - 공통 네트워크 유틸
 */

async function __sgLoadText(url) {
  try {
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) throw new Error(String(res.status));
    return await res.text();
  } catch (e) {
    console.warn("[Statground] Failed to load:", url, e);
    return null;
  }
}
