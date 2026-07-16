'use client'

import { useEffect, useRef, useState } from 'react'

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

    // loading=async es requerido para que PlaceAutocompleteElement dispare eventos
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;(window as any).__gMapsInit = resolve
    const s = document.createElement('script')
    s.id = SCRIPT_ID
    s.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&loading=async&callback=__gMapsInit`
    document.head.appendChild(s)
  })

  return mapsApiPromise
}

export default function VenueAutocomplete({ onPlaceSelect }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
    if (!apiKey) return
    loadMapsApi(apiKey).then(() => setReady(true))
  }, [])

  useEffect(() => {
    if (!ready || !containerRef.current) return

    let cancelled = false
    const container = containerRef.current

    async function setup() {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { PlaceAutocompleteElement } = await (google.maps as any).importLibrary('places') as any
      if (cancelled || !container) return

      container.innerHTML = ''
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const el: any = new PlaceAutocompleteElement({ requestedLanguage: 'es-MX' })
      el.style.cssText = 'width:100%;display:block;'
      container.appendChild(el)

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      el.addEventListener('gmp-placeselect', async (e: any) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const place: any = e.place ?? e.placePrediction?.toPlace()
        if (!place) return

        try {
          await place.fetchFields({
            fields: ['displayName', 'formattedAddress', 'location', 'addressComponents'],
          })
        } catch {
          return
        }

        let city = ''
        let state = ''
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        place.addressComponents?.forEach((c: any) => {
          if (c.types.includes('locality')) city = c.longText ?? ''
          if (c.types.includes('administrative_area_level_1')) state = c.shortText ?? ''
        })

        if (!cancelled) {
          onPlaceSelect({
            venue: place.displayName ?? '',
            venueAddress: place.formattedAddress ?? '',
            city,
            state,
            venueLat: place.location?.lat() ?? 0,
            venueLng: place.location?.lng() ?? 0,
          })
        }
      })
    }

    setup().catch(console.error)

    return () => { cancelled = true }
  }, [ready, onPlaceSelect])

  if (!process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY) return null

  return <div ref={containerRef} style={{ width: '100%', minHeight: 38 }} />
}