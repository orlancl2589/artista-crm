'use client'

import { useEffect, useRef, useState } from 'react'
import { Loader } from '@googlemaps/js-api-loader'

export interface VenuePlaceResult {
  venue: string
  venueAddress: string
  city: string
  state: string
  venueLat: number
  venueLng: number
}

interface Props {
  value: string
  onChange: (value: string) => void
  onPlaceSelect: (result: VenuePlaceResult) => void
  placeholder?: string
  style?: React.CSSProperties
}

let loaderPromise: Promise<typeof google> | null = null

function getLoader() {
  if (!loaderPromise) {
    const loader = new Loader({
      apiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? '',
      version: 'weekly',
      libraries: ['places'],
    })
    loaderPromise = loader.load()
  }
  return loaderPromise
}

export default function VenueAutocomplete({ value, onChange, onPlaceSelect, placeholder, style }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    if (!process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY) return
    getLoader().then(() => setReady(true)).catch(() => {})
  }, [])

  useEffect(() => {
    if (!ready || !inputRef.current) return

    const autocomplete = new google.maps.places.Autocomplete(inputRef.current, {
      types: ['establishment', 'geocode'],
      fields: ['name', 'formatted_address', 'geometry', 'address_components'],
    })

    const listener = autocomplete.addListener('place_changed', () => {
      const place = autocomplete.getPlace()
      if (!place.geometry?.location) return

      let city = ''
      let state = ''
      place.address_components?.forEach((c) => {
        if (c.types.includes('locality')) city = c.long_name
        if (c.types.includes('administrative_area_level_1')) state = c.short_name
      })

      const result: VenuePlaceResult = {
        venue: place.name ?? '',
        venueAddress: place.formatted_address ?? '',
        city,
        state,
        venueLat: place.geometry.location.lat(),
        venueLng: place.geometry.location.lng(),
      }

      onPlaceSelect(result)
      onChange(place.name ?? '')
    })

    return () => google.maps.event.removeListener(listener)
  }, [ready, onPlaceSelect, onChange])

  return (
    <div className="relative">
      <input
        ref={inputRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder ?? 'Escribe el nombre del lugar...'}
        style={style}
        autoComplete="off"
      />
      {!process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY && (
        <span
          className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px]"
          style={{ color: 'var(--muted)' }}
        >
          Maps N/D
        </span>
      )}
    </div>
  )
}
