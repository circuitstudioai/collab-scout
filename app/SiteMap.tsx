'use client';
import { useEffect, useRef } from 'react';
import type { Map as LeafletMap } from 'leaflet';
import type { Cell, Site } from '@/lib/sites/schema';
import 'leaflet/dist/leaflet.css';

export default function SiteMap({ sites, cells, selected, center, onSelect, placing = false, onPlace }: { sites: Site[]; cells: Cell[]; selected: string; onSelect?: (id:string)=>void; center?: { latitude: number; longitude: number }; placing?: boolean; onPlace?: (latitude: number, longitude: number) => void }) {
  const container = useRef<HTMLDivElement>(null);
  const selection = useRef(onSelect);
  useEffect(() => { selection.current = onSelect; }, [onSelect]);
  const placement = useRef({ placing, onPlace });
  useEffect(() => { placement.current = { placing, onPlace }; }, [placing, onPlace]);
  useEffect(() => {
    let cancelled = false;
    let map: LeafletMap | undefined;
    import('leaflet').then(L => {
      if (cancelled || !container.current) return;
      map = L.map(container.current, { scrollWheelZoom: false });
      map.on('click', event => {
        if (!placement.current.placing) return;
        const point = event.latlng.wrap();
        placement.current.onPlace?.(point.lat, point.lng);
      });
      L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>', maxZoom: 19 }).addTo(map);
      const lo = Math.min(...cells.map(c => c.affinity)), hi = Math.max(...cells.map(c => c.affinity));
      const visibleCells = cells.length > 4000 ? Array.from({length:4000}, (_,i)=>cells[Math.floor(i*cells.length/4000)]) : cells;
      visibleCells.forEach(c => {
        const t = hi === lo ? .5 : (c.affinity - lo) / (hi - lo);
        L.circleMarker([c.latitude, c.longitude], { radius: 5, stroke: false, fillColor: t > .66 ? '#294c34' : t > .33 ? '#8caa50' : '#d7dfb5', fillOpacity: .7 }).addTo(map!).bindTooltip(`Map point · Qloo taste score ${c.affinity.toFixed(3)}`);
      });
      sites.forEach((site, i) => {
        const label = document.createElement('span');
        label.textContent = `${String.fromCharCode(65 + i)} · ${site.name.replace(/^[A-C] · /, '')}`;
        const marker = L.circleMarker([site.latitude, site.longitude], { radius: site.id === selected ? 13 : 9, color: '#ffffff', weight: 3, fillColor: '#9d462b', fillOpacity: 1 }).addTo(map!).on('click',()=>selection.current?.(site.id)).bindTooltip(label, { permanent: true, direction: 'top', offset: [0, -12] });
        marker.on('add', () => {
          const element = marker.getElement();
          if (!element || !selection.current) return;
          element.setAttribute('data-site-id', site.id);
          element.setAttribute('role', 'button');
          element.setAttribute('tabindex', '0');
          element.setAttribute('aria-label', `Select ${site.name}`);
          element.setAttribute('aria-pressed', String(site.id === selected));
          element.addEventListener('keydown', event => {
            const key = (event as KeyboardEvent).key;
            if (key === 'Enter' || key === ' ') { event.preventDefault(); selection.current?.(site.id); }
          });
        });
      });
      if (sites.length) {
        const bounds = L.latLngBounds(sites.map(s => [s.latitude, s.longitude] as [number, number]));
        map.fitBounds(bounds.pad(.35), { maxZoom: 15 });
      } else if (center) map.setView([center.latitude, center.longitude], 12);
      else map.setView([25, 0], 2);
    });
    return () => { cancelled = true; map?.remove(); };
  }, [sites, cells, selected, center]);
  return <div className={`leaflet-map${placing ? ' placing' : ''}`} ref={container} role="region" aria-label="Locations and nearby taste scores. You can also enter coordinates in the form. The comparison cards below contain the same scores." />;
}
