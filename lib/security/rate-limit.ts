import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

function createRedis(): Redis | null {
  const url = process.env.UPSTASH_REDIS_REST_URL
  const token = process.env.UPSTASH_REDIS_REST_TOKEN
  if (!url || !token) return null
  return new Redis({ url, token })
}

const redis = createRedis()

function makeLimiter(limiter: ReturnType<typeof Ratelimit.slidingWindow>): Ratelimit | null {
  if (!redis) return null
  return new Ratelimit({ redis, limiter })
}

export const rateLimiters = {
  api: makeLimiter(Ratelimit.slidingWindow(60, '1 m')),
  webhooks: makeLimiter(Ratelimit.slidingWindow(200, '1 m')),
  auth: makeLimiter(Ratelimit.slidingWindow(5, '15 m')),
  agent: makeLimiter(Ratelimit.slidingWindow(100, '1 h')),
}

export async function withRateLimit(
  req: Request,
  limiter: Ratelimit | null,
  identifier?: string
): Promise<Response | null> {
  if (!limiter) return null
  const ip = req.headers.get('x-forwarded-for') ?? 'anonymous'
  const id = identifier ?? ip
  const { success, reset } = await limiter.limit(id)
  if (!success) {
    return Response.json(
      { error: 'Demasiadas solicitudes. Intenta más tarde.' },
      { status: 429, headers: { 'Retry-After': String(Math.ceil((reset - Date.now()) / 1000)) } }
    )
  }
  return null
}
