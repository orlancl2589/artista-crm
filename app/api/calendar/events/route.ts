import { NextRequest } from 'next/server'
import { requireArtist } from '@/lib/auth/require-artist'
import { listGCalEvents } from '@/lib/integrations/google-calendar'
import { handleApiError } from '@/lib/utils/api-error'

// GET /api/calendar/events?month=YYYY-MM
export async function GET(req: NextRequest) {
  try {
    const artist = await requireArtist()

    const month = req.nextUrl.searchParams.get('month')
    if (!month || !/^\d{4}-\d{2}$/.test(month)) {
      return Response.json({ data: [] })
    }

    const [y, m] = month.split('-').map(Number) as [number, number]
    const from = new Date(y, m - 1, 1)
    const to = new Date(y, m, 1)

    const events = await listGCalEvents(artist.id, from, to)
    return Response.json({ data: events })
  } catch (err) {
    return handleApiError(err)
  }
}