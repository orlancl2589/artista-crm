import { createHmac, timingSafeEqual } from 'crypto'

export function validateWhatsAppWebhook(
  payload: string,
  signature: string,
  secret: string
): boolean {
  const expected = createHmac('sha256', secret).update(payload).digest('hex')
  const expectedBuf = Buffer.from(`sha256=${expected}`)
  const receivedBuf = Buffer.from(signature)
  if (expectedBuf.length !== receivedBuf.length) return false
  return timingSafeEqual(expectedBuf, receivedBuf)
}

export function validateMetaWebhook(
  payload: string,
  signature: string,
  secret: string
): boolean {
  const expected = createHmac('sha256', secret).update(payload).digest('hex')
  const expectedBuf = Buffer.from(`sha256=${expected}`)
  const receivedBuf = Buffer.from(signature.replace('sha256=', ''))
  const fullExpected = Buffer.from(`sha256=${expected}`)
  const fullReceived = Buffer.from(signature)
  if (fullExpected.length !== fullReceived.length) return false
  return timingSafeEqual(expectedBuf, receivedBuf)
}
