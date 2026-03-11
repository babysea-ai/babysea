import { y as WebhookPayload } from './types-D5UqzwWJ.cjs';

/**
 * Verify a BabySea webhook signature and return the parsed payload.
 *
 * @param rawBody - The raw request body as a string.
 * @param signature - The `X-BabySea-Signature` header value.
 * @param secret - Your webhook signing secret.
 * @param toleranceSeconds - Max age in seconds (default: 300 = 5 min).
 * @returns The parsed and verified webhook payload.
 * @throws {Error} If the signature is invalid, missing, or the timestamp is outside tolerance.
 */
declare function verifyWebhook(rawBody: string, signature: string, secret: string, toleranceSeconds?: number): Promise<WebhookPayload>;

export { verifyWebhook };
