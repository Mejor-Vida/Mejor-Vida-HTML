/**
 * Publish a Page photo post + first comment via Meta Graph API.
 * Uses FACEBOOK_PAGE_ID and FACEBOOK_PAGE_ACCESS_TOKEN (never log those values).
 */

const GRAPH = "https://graph.facebook.com/v21.0";

function pageCreds() {
  const pageId = String(process.env.FACEBOOK_PAGE_ID || "").trim();
  const token = String(
    process.env.FACEBOOK_PAGE_ACCESS_TOKEN || process.env.META_LEADGEN_PAGE_ACCESS_TOKEN || ""
  ).trim();
  if (!pageId || !token) {
    throw new Error("Missing FACEBOOK_PAGE_ID or FACEBOOK_PAGE_ACCESS_TOKEN");
  }
  return { pageId, token };
}

function facebookPublishReady() {
  try {
    pageCreds();
    return true;
  } catch (_) {
    return false;
  }
}

async function graphForm(url, fields) {
  const body = new URLSearchParams();
  for (const [k, v] of Object.entries(fields)) {
    if (v == null || v === "") continue;
    body.set(k, String(v));
  }
  const r = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });
  const text = await r.text();
  let json = {};
  try {
    json = text ? JSON.parse(text) : {};
  } catch (_) {
    json = { raw: text.slice(0, 400) };
  }
  if (!r.ok) {
    const msg = (json.error && json.error.message) || text.slice(0, 400);
    throw new Error(`Facebook Graph ${r.status}: ${msg}`);
  }
  return json;
}

function graphPostId(result) {
  return (result && (result.post_id || result.id)) || "";
}

async function publishPhotoPost({ message, imageUrl }) {
  const { pageId, token } = pageCreds();
  if (!String(message || "").trim()) throw new Error("Facebook caption is empty");
  if (!String(imageUrl || "").trim()) throw new Error("Facebook image_url is required");
  const json = await graphForm(`${GRAPH}/${pageId}/photos`, {
    message,
    url: imageUrl,
    access_token: token,
  });
  const postId = graphPostId(json);
  if (!postId) throw new Error("Facebook photo publish returned no post id");
  return { ...json, post_id: postId };
}

async function publishComment(postId, message) {
  const { token } = pageCreds();
  if (!String(postId || "").trim()) throw new Error("Facebook comment needs post_id");
  if (!String(message || "").trim()) throw new Error("Facebook comment is empty");
  const json = await graphForm(`${GRAPH}/${postId}/comments`, {
    message,
    access_token: token,
  });
  return json;
}

module.exports = {
  facebookPublishReady,
  publishPhotoPost,
  publishComment,
  graphPostId,
};
