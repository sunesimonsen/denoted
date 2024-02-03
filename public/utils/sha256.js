export async function sha256(text) {
  const msgUint8 = new TextEncoder().encode(text); // encode as (utf-8) Uint8Array
  const hashBuffer = await crypto.subtle.digest("SHA-256", msgUint8); // hash the message
  const base64 = btoa(String.fromCharCode(...new Uint8Array(hashBuffer)));
  const base64UriEncoded = base64
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
  return base64UriEncoded;
}
