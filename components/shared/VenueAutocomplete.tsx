'use client'

import { useState, useEffect, useRef, useCallback } from 'react'

export interface VenuePlaceResult {
  venue: string
  venueAddress: string
  city: string
  state: string
  venueLat: number
  venueLng: number
}

interface Props {
  onPlaceSelect: (result: VenuePlaceResult) => void
}

const SCRIPT_ID = 'google-maps-script'
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let mapsApiPromise: Promise<void> | null = null

function loadMapsApi(apiKey: string): Promise<void> {
  if (mapsApiPromise) return mapsApiPromise
  mapsApiPromise = new Promise<void>((resolve) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if (typeof google !== 'undefined' && (google.maps as any)?.importLibrary) {
      resolve()
      return
    }
    if (document.getElementById(SCRIPT_ID)) {
      const poll = setInterval(() => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        if (typeof google !== 'undefined' && (google.maps as any)?.importLibrary) {
          clearInterval(poll)
          resolve()
        }
      }, 100)
      return
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;(window as any).__gMapsInit = resolve
    const s = document.createElement('script')
    s.id = SCRIPT_ID
    s.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&loading=async&callback=__gMapsInit`
    document.head.appendChild(s)
  })
  return mapsApiPromise
}

interface Suggestion {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  placePrediction: any
  label: string
  secondary: string
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '8px 12px',
  borderRadius: 'var(--radius)',
  background: 'var(--bg3)',
  border: '1px solid var(--border)',
  color: 'var(--text)',
  fontSize: '13px',
  outline: 'none',
}

export default function VenueAutocomplete({ onPlaceSelect }: Props) {
  const [ready, setReady] = useState(false)
  const [inputValue, setInputValue] = useState('')
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])
  const [open, setOpen] = useState(false)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sessionTokenRef = useRef<any>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
    if (!apiKey) return
    loadMapsApi(apiKey).then(() => setReady(true))
  }, [])

  const fetchSuggestions = useCallback(async (input: string) => {
    if (!ready || input.length < 3) { setSuggestions([]); setOpen(false); return }
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { AutocompleteSuggestion, AutocompleteSessionToken } = await (google.maps as any).importLibrary('places') as any
      if (!sessionTokenRef.current) sessionTokenRef.current = new AutocompleteSessionToken()

      const { suggestions: results } = await AutocompleteSuggestion.fetchAutocompleteSuggestions({
        input,
        sessionToken: sessionTokenRef.current,
        language: 'es-MX',
        region: 'mx',
      })
      setSuggestions(results.map((r: { placePrediction: { mainText: { text: string }, secondaryText: { text: string } } }) => ({
        placePrediction: r.placePrediction,
        label: r.placePrediction.mainText?.text ?? input,
        secondary: r.placePrediction.secondaryText?.text ?? '',
      })))
      setOpen(true)
    } catch {
      setSuggestions([])
    }
  }, [ready])

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value
    setInputValue(val)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => fetchSuggestions(val), 300)
  }

  async function handleSelect(s: Suggestion) {
    setOpen(false)
    setInputValue(`${s.label}${s.secondary ? `, ${s.secondary}` : ''}`)
    setSuggestions([])

    try {
      const place = s.placePrediction.toPlace()
      await place.fetchFields({
        fields: ['displayName', 'formattedAddress', 'location', 'addressComponents'],
        sessionToken: sessionTokenRef.current,
      })
      sessionTokenRef.current = null  // reset para próxima búsqueda

      let city = ''
      let state = ''
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      place.addressComponents?.forEach((c: any) => {
        if (c.types.includes('locality')) city = c.longText ?? ''
        if (c.types.includes('administrative_area_level_1')) state = c.shortText ?? ''
      })

      onPlaceSelect({
        venue: place.displayName ?? s.label,
        venueAddress: place.formattedAddress ?? '',
        city,
        state,
        venueLat: place.location?.lat() ?? 0,
        venueLng: place.location?.lng() ?? 0,
      })
    } catch {
      // silencioso — el usuario puede reintentar
    }
  }

  if (!process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY) return null

  return (
    <div style={{ position: 'relative', width: '100%' }}>
      <input
        type="text"
        value={inputValue}
        onChange={handleChange}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        placeholder="Busca el venue en Google Maps..."
        disabled={!ready}
        style={inputStyle}
      />
      {open && suggestions.length > 0 && (
        <ul
          style={{
            position: 'absolute',
            top: 'calc(100% + 2px)',
            left: 0,
            right: 0,
            zIndex: 9999,
            margin: 0,
            padding: 0,
            listStyle: 'none',
            background: 'var(--bg2)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius)',
            boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
            maxHeight: 280,
            overflowY: 'auto',
          }}
        >
          {suggestions.map((s, i) => (
            <li
              key={i}
              onMouseDown={(e) => { e.preventDefault(); handleSelect(s) }}
              style={{
                padding: '8px 12px',
                cursor: 'pointer',
                borderBottom: i < suggestions.length - 1 ? '1px solid var(--border)' : 'none',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--bg3)' }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent' }}
            >
              <div style={{ fontSize: '13px', color: 'var(--text)', fontWeight: 500 }}>{s.label}</div>
              {s.secondary && (
                <div style={{ fontSize: '11px', color: 'var(--muted)', marginTop: 2 }}>{s.secondary}</div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}