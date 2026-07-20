import { requireArtist } from '@/lib/auth/require-artist'
import { handleApiError } from '@/lib/utils/api-error'
import { decrypt } from '@/lib/security/encrypt'
import { google } from 'googleapis'

function createOAuth2() {
  return new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_CALENDAR_REDIRECT_URI,
  )
}

// GET /api/calendar/debug — temporary diagnostic endpoint
export async function GET() {
  try {
    const artist = await requireArtist()

    const info: Record<string, unknown> = {
      hasRefreshToken: !!artist.googleRefreshToken,
      calendarId: artist.googleCalendarId,
      googleClientId: process.env.GOOGLE_CLIENT_ID ? '✓ set' : '✗ MISSING',
      googleClientSecret: process.env.GOOGLE_CLIENT_SECRET ? '✓ set' : '✗ MISSING',
      redirectUri: process.env.GOOGLE_CALENDAR_REDIRECT_URI ?? 'MISSING',
      encryptionKey: process.env.ENCRYPTION_KEY ? '✓ set' : '✗ MISSING',
    }

    if (!artist.googleRefreshToken) {
      return Response.json({ ...info, error: 'No refresh token in DB' })
    }

    let refreshToken: string
    try {
      refreshToken = decrypt(artist.googleRefreshToken)
      info.decryptOk = true
    } catch (err) {
      return Response.json({ ...info, error: 'decrypt failed', detail: String(err) })
    }

    const oauth2 = createOAuth2()
    oauth2.setCredentials({ refresh_token: refreshToken })

    // Try listing calendars first
    try {
      const calApi = google.calendar({ version: 'v3', auth: oauth2 })
      const cals = await calApi.calendarList.list()
      info.calendars = cals.data.items?.map(c => ({ id: c.id, summary: c.summary, primary: c.primary }))
    } catch (err) {
      return Response.json({ ...info, error: 'calendarList failed', detail: String(err) })
    }

    // Try listing events in primary for current month
    try {
      const calApi = google.calendar({ version: 'v3', auth: oauth2 })
      const now = new Date()
      const from = new Date(now.getFullYear(), now.getMonth(), 1)
      const to = new Date(now.getFullYear(), now.getMonth() + 1, 1)
      const res = await calApi.events.list({
        calendarId: artist.googleCalendarId || 'primary',
        timeMin: from.toISOString(),
        timeMax: to.toISOString(),
        singleEvents: true,
        orderBy: 'startTime',
        maxResults: 10,
      })
      info.eventCount = res.data.items?.length ?? 0
      info.events = res.data.items?.map(e => ({
        id: e.id,
        summary: e.summary,
        start: e.start?.dateTime ?? e.start?.date,
      }))
    } catch (err) {
      return Response.json({ ...info, error: 'events.list failed', detail: String(err) })
    }

    return Response.json(info)
  } catch (err) {
    return handleApiError(err)
  }
}