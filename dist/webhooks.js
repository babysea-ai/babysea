// src/webhooks.ts
var DEFAULT_TOLERANCE_SECONDS = 300;
async function verifyWebhook(rawBody, signature, secret, toleranceSeconds = DEFAULT_TOLERANCE_SECONDS) {
  if (!signature) {
    throw new Error("Missing X-BabySea-Signature header");
  }
  if (!secret) {
    throw new Error("Missing webhook secret");
  }
  const parts = signature.split(",");
  const timestampPart = parts.find((p) => p.startsWith("t="));
  const signaturePart = parts.find((p) => p.startsWith("v1="));
  if (!timestampPart || !signaturePart) {
    throw new Error(
      "Invalid signature format. Expected: t=<timestamp>,v1=<hex>"
    );
  }
  const timestamp = timestampPart.slice(2);
  const expectedHex = signaturePart.slice(3);
  if (!timestamp || !expectedHex) {
    throw new Error("Invalid signature: empty timestamp or digest");
  }
  const timestampNum = parseInt(timestamp, 10);
  if (isNaN(timestampNum)) {
    throw new Error("Invalid signature: non-numeric timestamp");
  }
  const now = Math.floor(Date.now() / 1e3);
  const age = Math.abs(now - timestampNum);
  if (age > toleranceSeconds) {
    throw new Error(
      `Webhook timestamp too old: ${age}s (max ${toleranceSeconds}s)`
    );
  }
  const signedContent = `${timestamp}.${rawBody}`;
  const computedHex = await hmacSha256Hex(secret, signedContent);
  if (!timingSafeEqual(computedHex, expectedHex)) {
    throw new Error("Invalid webhook signature");
  }
  return JSON.parse(rawBody);
}
async function hmacSha256Hex(key, message) {
  const encoder = new TextEncoder();
  const keyData = encoder.encode(key);
  const msgData = encoder.encode(message);
  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    keyData,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signature = await crypto.subtle.sign("HMAC", cryptoKey, msgData);
  return Array.from(new Uint8Array(signature)).map((b) => b.toString(16).padStart(2, "0")).join("");
}
function timingSafeEqual(a, b) {
  if (a.length !== b.length) {
    return false;
  }
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return result === 0;
}

export { verifyWebhook };
//# sourceMappingURL=webhooks.js.map
//# sourceMappingURL=webhooks.js.map