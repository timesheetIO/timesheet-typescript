import { createHmac, timingSafeEqual } from 'crypto';

/**
 * Header names carried by every webhook delivery.
 */
export const WebhookHeaders = {
  ID: 'x-webhook-id',
  EVENT: 'x-webhook-event',
  TIMESTAMP: 'x-webhook-timestamp',
  SIGNATURE: 'x-webhook-signature',
  VERSION: 'x-webhook-version',
} as const;

export interface VerifyWebhookSignatureOptions {
  /**
   * The request body exactly as received, before any JSON parsing.
   *
   * Re-serializing a parsed body will not reproduce the signed bytes: the API escapes
   * `<`, `>`, `&` and `=` as unicode sequences, which `JSON.stringify` does not, so a
   * payload containing any of them would fail verification. Read the raw body.
   */
  payload: string | Buffer;
  /** The `X-Webhook-Signature` header, in the form `sha256=<hex>`. */
  signature: string;
  /** The `X-Webhook-Timestamp` header, a unix timestamp in seconds. */
  timestamp: string | number;
  /** The secret returned once by `webhooks.create()`. */
  secret: string;
  /**
   * Maximum accepted age of the delivery in seconds, to bound replay of a captured
   * request. Defaults to 300. Pass 0 to skip the age check.
   */
  toleranceSeconds?: number;
  /** Current unix time in seconds. Intended for tests. */
  now?: number;
}

/**
 * Verifies the signature on an incoming webhook delivery.
 *
 * The signed material is `"{timestamp}.{body}"`, so the timestamp cannot be altered
 * without invalidating the signature, which is what makes the age check meaningful.
 *
 * @example
 * ```typescript
 * app.post('/hooks/timesheet', express.raw({ type: 'application/json' }), (req, res) => {
 *   const valid = verifyWebhookSignature({
 *     payload: req.body,
 *     signature: req.header('x-webhook-signature') ?? '',
 *     timestamp: req.header('x-webhook-timestamp') ?? '',
 *     secret: process.env.TIMESHEET_WEBHOOK_SECRET!,
 *   });
 *   if (!valid) return res.status(400).send('invalid signature');
 *   const event = JSON.parse(req.body.toString('utf8'));
 *   res.sendStatus(200);
 * });
 * ```
 *
 * @returns true when the delivery is authentic and within the tolerance window.
 */
export function verifyWebhookSignature(options: VerifyWebhookSignatureOptions): boolean {
  const { payload, signature, timestamp, secret, toleranceSeconds = 300 } = options;

  if (!signature || !secret) {
    return false;
  }

  const sentAt = typeof timestamp === 'number' ? timestamp : Number.parseInt(timestamp, 10);
  if (!Number.isFinite(sentAt)) {
    return false;
  }

  if (toleranceSeconds > 0) {
    const now = options.now ?? Math.floor(Date.now() / 1000);
    if (Math.abs(now - sentAt) > toleranceSeconds) {
      return false;
    }
  }

  const body = typeof payload === 'string' ? Buffer.from(payload, 'utf8') : payload;
  const signed = Buffer.concat([Buffer.from(`${sentAt}.`, 'utf8'), body]);
  const expected = `sha256=${createHmac('sha256', secret).update(signed).digest('hex')}`;

  const provided = Buffer.from(signature, 'utf8');
  const computed = Buffer.from(expected, 'utf8');
  if (provided.length !== computed.length) {
    return false;
  }
  return timingSafeEqual(provided, computed);
}
