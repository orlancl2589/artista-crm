import { google } from 'googleapis'
import { encrypt, decrypt } from '@/lib/security/encrypt'
import { prisma } from '@/lib/db/prisma'

const SCOPES = ['https://www.googleapis.com/auth/calendar.events']

function createOAuth2() {
  return new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_CALENDAR_REDIRECT_URI,
  )
}

export function getGoogleAuthUrl(): string {
  const oauth2 = createOAuth2()
  return oauth2.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
    prompt: 'consent', // siempre pedir para obtener refresh_token
  })
}

export async function exchangeCodeForTokens(code: string) {
  const oauth2 = createOAuth2()
  const { tokens } = await oauth2.getToken(code)
  return tokens
}

async function getAuthorizedClient(artistId: string) {
  const artist = await prisma.artist.findUnique({
    where: { id: artistId },
    select: { googleRefreshToken: true, googleCalendarId: true },
  })
  if (!artist?.googleRefreshToken) return null

  const oauth2 = createOAuth2()
  oauth2.setCredentials({ refresh_token: decrypt(artist.googleRefreshToken) })

  // Si el access token expira, googleapis lo refresca automáticamente
  return {
    calendar: google.calendar({ version: 'v3', auth: oauth2 }),
    calendarId: artist.googleCalendarId || 'primary',
  }
}

export interface GCalEventInput {
  title: string
  startDate: Date
  endDate: Date
  timezone: string
  venue?: string | null
  venueAddress?: string | null
  internalNotes?: string | null
  clientName?: string | null
}

export async function createGCalEvent(
  artistId: string,
  event: GCalEventInput,
): Promise<string | null> {
  const client = await getAuthorizedClient(artistId)
  if (!client) return null

  try {
    const res = await client.calendar.events.insert({
      calendarId: client.calendarId,
      requestBody: buildEventBody(event),
    })
    return res.data.id ?? null
  } catch {
    return null
  }
}

export async function updateGCalEvent(
  artistId: string,
  googleEventId: string,
  event: GCalEventInput,
): Promise<void> {
  const client = await getAuthorizedClient(artistId)
  if (!client) return

  try {
    await client.calendar.events.patch({
      calendarId: client.calendarId,
      eventId: googleEventId,
      requestBody: buildEventBody(event),
    })
  } catch {
    // No bloquear la operación principal si GCal falla
  }
}

export async function deleteGCalEvent(
  artistId: string,
  googleEventId: string,
): Promise<void> {
  const client = await getAuthorizedClient(artistId)
  if (!client) return

  try {
    await client.calendar.events.delete({
      calendarId: client.calendarId,
      eventId: googleEventId,
    })
  } catch {
    // Ignorar si el evento ya no existe en GCal
  }
}

export async function saveGoogleTokens(
  artistId: string,
  refreshToken: string,
): Promise<void> {
  await prisma.artist.update({
    where: { id: artistId },
    data: {
      googleRefreshToken: encrypt(refreshToken),
      googleCalendarId: 'primary',
    },
  })
}

export async function revokeGoogleCalendar(artistId: string): Promise<void> {
  const artist = await prisma.artist.findUnique({
    where: { id: artistId },
    select: { googleRefreshToken: true },
  })

  if (artist?.googleRefreshToken) {
    try {
      const oauth2 = createOAuth2()
      oauth2.setCredentials({ refresh_token: decrypt(artist.googleRefreshToken) })
      await oauth2.revokeCredentials()
    } catch {
      // Continuar aunque la revocación en Google falle
    }
  }

  await prisma.artist.update({
    where: { id: artistId },
    data: { googleRefreshToken: null, googleCalendarId: null },
  })
}

function buildEventBody(event: GCalEventInput) {
  const location = [event.venue, event.venueAddress].filter(Boolean).join(' — ')
  const description = [
    event.clientName ? `Cliente: ${event.clientName}` : null,
    event.internalNotes,
  ]
    .filter(Boolean)
    .join('\n')

  return {
    summary: event.title,
    location: location || undefined,
    description: description || undefined,
    start: { dateTime: event.startDate.toISOString(), timeZone: event.timezone },
    end: { dateTime: event.endDate.toISOString(), timeZone: event.timezone },
  }
}