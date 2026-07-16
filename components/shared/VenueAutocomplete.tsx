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

const SCRIPT_ID = 'google-maps-places-script'
const readyCallbacks: (() => void)[] = []
let mapsReady = false

function onMapsReady(cb: () => void) {
  if (mapsReady) { cb(); return }
  readyCallbacks.push(cb)
}

function loadMapsScript(apiKey: string) {
  if (document.getElementById(SCRIPT_ID)) return
  ;(window as Window & { __gMapsInit?: () => void }).__gMapsInit = () => {
    mapsReady = true
    readyCallbacks.forEach((fn) => fn())
    readyCallbacks.length = 0
  }
  const s = document.createElement('script')
  s.id = SCRIPT_ID
  s.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&callback=__gMapsInit`
  s.async = true
  s.defer = true
  document.head.appendChild(s)
}

export default function VenueAutocomplete({ onPlaceSelect }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
    if (!apiKey) return
    onMapsReady(() => setReady(true))
    if (typeof google !== 'undefined' && google.maps?.places) {
      if (!mapsReady) { mapsReady = true }
      setReady(true)
      return
    }
    loadMapsScript(apiKey)
  }, [])

  useEffect(() => {
    if (!ready || !containerRef.current) return
    containerRef.current.innerHTML = ''

    // PlaceAutocompleteElement — API nueva requerida para cuentas post-marzo 2025
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const PlacesLib = google.maps.places as any
    if (!PlacesLib?.PlaceAutocompleteElement) return

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const el: any = new PlacesLib.PlaceAutocompleteElement({ requestedLanguage: 'es-MX' })
    el.style.cssText = 'width:100%;display:block;'
    containerRef.current.appendChild(el)

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    el.addEventListener('gmp-placeselect', async (e: any) => {
      // Places API (New) usa e.placePrediction.toPlace()
      // Places API (legacy) usa e.place directamente
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let place: any
      if (e.placePrediction) {
        place = e.placePrediction.toPlace()
      } else {
        place = e.place
      }
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

      onPlaceSelect({
        venue: place.displayName ?? '',
        venueAddress: place.formattedAddress ?? '',
        city,
        state,
        venueLat: place.location?.lat() ?? 0,
        venueLng: place.location?.lng() ?? 0,
      })
    })
  }, [ready, onPlaceSelect])

  if (!process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY) return null

  return <div ref={containerRef} style={{ width: '100%', minHeight: 38 }} />
}
