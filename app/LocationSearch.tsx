'use client';
import { useRef, useState, useEffect, useId } from 'react';
import type { LocationMatch } from '@/lib/sites/locations';
export default function LocationSearch({ label, value, onChange, onPick, focus, city, disabled = false }: { label: string; value: string; onChange: (value: string) => void; onPick: (location: LocationMatch) => void; focus?: Pick<LocationMatch, 'latitude' | 'longitude'>; city?: string; disabled?: boolean }) {
  const inputId = useId();
  const [matches, setMatches] = useState<LocationMatch[]>([]);
  const [busy, setBusy] = useState(false), [message, setMessage] = useState('');
  const controller = useRef<AbortController | null>(null);
  useEffect(() => () => controller.current?.abort(), []);
  async function search() {
    controller.current?.abort(); const current = new AbortController(); controller.current = current;
    setBusy(true); setMatches([]); setMessage('');
    try {
      const params = new URLSearchParams({ q: city ? `${value.trim()} ${city}` : value.trim() });
      if (focus) { params.set('lat', String(focus.latitude)); params.set('lon', String(focus.longitude)); }
      const response = await fetch(`/api/locations?${params}`, { signal: current.signal });
      const data = await response.json();
      if (current.signal.aborted) return;
      if (!response.ok) throw new Error(data.error);
      setMatches(data.locations); setMessage(data.locations.length ? 'Choose a result to fill in the location.' : 'No locations found. Add a street, city or postal code, then search again. You can also use the map.');
    } catch (error) { if (!current.signal.aborted) setMessage(error instanceof Error ? error.message : 'Search failed. Try again.'); }
    finally { if (!current.signal.aborted) setBusy(false); }
  }
  return <div className="location-search"><label htmlFor={inputId}>{label}</label><span className="search-controls"><input id={inputId} name={label} value={value} maxLength={140} autoComplete="off" placeholder={city ? `Address or neighborhood in ${city}…` : 'For example, Toronto…'} onChange={e => { controller.current?.abort(); setBusy(false); setMatches([]); setMessage(''); onChange(e.target.value); }} onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); if (!disabled && !busy && value.trim().length >= 2) void search(); } }} disabled={disabled}/><button type="button" disabled={disabled || busy || value.trim().length < 2} onClick={search}>{busy ? 'Searching…' : 'Find location'}</button></span><p className="hint" role="status">{message}</p>{matches.length > 0 && <ul className="location-matches" aria-label={`${label} results`}>{matches.map(match => <li key={match.id}><button type="button" onClick={() => { controller.current?.abort(); setMatches([]); setMessage(''); onPick(match); }}><strong>{match.name}</strong><span>{match.label}</span></button></li>)}</ul>}</div>;
}
