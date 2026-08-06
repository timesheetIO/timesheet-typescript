import { createHmac } from 'crypto';

import { verifyWebhookSignature } from '../../webhooks';

const SECRET = 'whsec_test';
const TIMESTAMP = 1_700_000_000;
const BODY = '{"event":"task.create","item":{"id":"task-1"}}';

function sign(secret: string, timestamp: number, body: string): string {
  return `sha256=${createHmac('sha256', secret).update(`${timestamp}.${body}`).digest('hex')}`;
}

describe('verifyWebhookSignature', () => {
  it('accepts a genuine delivery', () => {
    expect(
      verifyWebhookSignature({
        payload: BODY,
        signature: sign(SECRET, TIMESTAMP, BODY),
        timestamp: TIMESTAMP,
        secret: SECRET,
        now: TIMESTAMP,
      }),
    ).toBe(true);
  });

  it('accepts a Buffer payload identically to a string', () => {
    expect(
      verifyWebhookSignature({
        payload: Buffer.from(BODY, 'utf8'),
        signature: sign(SECRET, TIMESTAMP, BODY),
        timestamp: TIMESTAMP,
        secret: SECRET,
        now: TIMESTAMP,
      }),
    ).toBe(true);
  });

  it('accepts the timestamp as a header string', () => {
    expect(
      verifyWebhookSignature({
        payload: BODY,
        signature: sign(SECRET, TIMESTAMP, BODY),
        timestamp: String(TIMESTAMP),
        secret: SECRET,
        now: TIMESTAMP,
      }),
    ).toBe(true);
  });

  it('rejects a tampered body', () => {
    expect(
      verifyWebhookSignature({
        payload: BODY.replace('task-1', 'task-2'),
        signature: sign(SECRET, TIMESTAMP, BODY),
        timestamp: TIMESTAMP,
        secret: SECRET,
        now: TIMESTAMP,
      }),
    ).toBe(false);
  });

  it('rejects the wrong secret', () => {
    expect(
      verifyWebhookSignature({
        payload: BODY,
        signature: sign('whsec_other', TIMESTAMP, BODY),
        timestamp: TIMESTAMP,
        secret: SECRET,
        now: TIMESTAMP,
      }),
    ).toBe(false);
  });

  it('rejects a replayed delivery outside the tolerance window', () => {
    const signature = sign(SECRET, TIMESTAMP, BODY);

    expect(
      verifyWebhookSignature({
        payload: BODY,
        signature,
        timestamp: TIMESTAMP,
        secret: SECRET,
        now: TIMESTAMP + 301,
      }),
    ).toBe(false);

    expect(
      verifyWebhookSignature({
        payload: BODY,
        signature,
        timestamp: TIMESTAMP,
        secret: SECRET,
        now: TIMESTAMP + 299,
      }),
    ).toBe(true);
  });

  it('rejects a moved timestamp, since the timestamp is signed', () => {
    expect(
      verifyWebhookSignature({
        payload: BODY,
        signature: sign(SECRET, TIMESTAMP, BODY),
        timestamp: TIMESTAMP + 1,
        secret: SECRET,
        now: TIMESTAMP + 1,
      }),
    ).toBe(false);
  });

  it('can skip the age check', () => {
    expect(
      verifyWebhookSignature({
        payload: BODY,
        signature: sign(SECRET, TIMESTAMP, BODY),
        timestamp: TIMESTAMP,
        secret: SECRET,
        toleranceSeconds: 0,
        now: TIMESTAMP + 10_000_000,
      }),
    ).toBe(true);
  });

  it('rejects missing or malformed input rather than throwing', () => {
    const base = { payload: BODY, secret: SECRET, timestamp: TIMESTAMP, now: TIMESTAMP };

    expect(verifyWebhookSignature({ ...base, signature: '' })).toBe(false);
    expect(verifyWebhookSignature({ ...base, signature: 'sha256=zz' })).toBe(false);
    expect(
      verifyWebhookSignature({ ...base, signature: sign(SECRET, TIMESTAMP, BODY), secret: '' }),
    ).toBe(false);
    expect(
      verifyWebhookSignature({
        ...base,
        signature: sign(SECRET, TIMESTAMP, BODY),
        timestamp: 'not-a-timestamp',
      }),
    ).toBe(false);
  });

  it('verifies a body the API escaped, which re-serializing would not reproduce', () => {
    // The API emits Gson's HTML escaping, so "R&D" arrives as "R&D". Verifying the
    // raw bytes works; JSON.stringify of the parsed object would produce "R&D" and fail.
    const escaped = '{"event":"task.create","item":{"description":"R\\u0026D"}}';
    const reserialized = JSON.stringify(JSON.parse(escaped));
    const signature = sign(SECRET, TIMESTAMP, escaped);

    expect(reserialized).not.toEqual(escaped);
    expect(
      verifyWebhookSignature({
        payload: escaped,
        signature,
        timestamp: TIMESTAMP,
        secret: SECRET,
        now: TIMESTAMP,
      }),
    ).toBe(true);
    expect(
      verifyWebhookSignature({
        payload: reserialized,
        signature,
        timestamp: TIMESTAMP,
        secret: SECRET,
        now: TIMESTAMP,
      }),
    ).toBe(false);
  });
});
