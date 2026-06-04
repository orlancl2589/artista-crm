import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

const redis = Redis.fromEnv()

export const rateLimiters = {
  api: new Ratelimit({ redis, limiter: Ratelimit.slidingWindow(60, '1 m') }),
  webhooks: new Ratelimit({ redis, limiter: Ratelimit.slidingWindow(200, '1 m') }),
  auth: new Ratelimit({ redis, limiter: Ratelimit.slidingWindow(5, '15 m') }),
  agent: new Ratelimit({ redis, limiter: Ratelimit.slidingWindow(100, '1 h') }),
}

export async function withRateLimit(
  req: Request,
  limiter: Ratelimit,
  identifier?: string
): Promise<Response | null> {
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
