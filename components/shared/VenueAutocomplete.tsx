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
  value: string
  onChange: (value: string) => void
  onPlaceSelect: (result: VenuePlaceResult) => void
  placeholder?: string
  style?: React.CSSProperties
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

export default function VenueAutocomplete({ value, onChange, onPlaceSelect, placeholder, style }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
    if (!apiKey) return
    onMapsReady(() => setReady(true))
    // Si ya está cargado (otra instancia del componente lo inició antes)
    if (typeof google !== 'undefined' && google.maps?.places) {
      mapsReady = true
      setReady(true)
      return
    }
    loadMapsScript(apiKey)
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
    <input
      ref={inputRef}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder ?? 'Escribe el nombre del lugar...'}
      style={style}
      autoComplete="off"
    />
  )
}
