'use client';
import { useEffect, useRef } from 'react';
import type { Map as LeafletMap } from 'leaflet';
import type { Cell, Site } from '@/lib/sites/schema';
import 'leaflet/dist/leaflet.css';

export default function SiteMap({ sites, cells, selected }: { sites: Site[]; cells: Cell[]; selected: string }) {
  const container = useRef<HTMLDivElement>(null);
  useEffect(() => {
    let cancelled = false;
    let map: LeafletMap | undefined;
    import('leaflet').then(L => {
      if (cancelled || !container.current) return;
      map = L.map(container.current, { scrollWheelZoom: false });
      L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>', maxZoom: 19 }).addTo(map);
      const lo = Math.min(...cells.map(c => c.affinity)), hi = Math.max(...cells.map(c => c.affinity));
      cells.slice(0, 4000).forEach(c => {
        const t = hi === lo ? .5 : (c.affinity - lo) / (hi - lo);
        L.circleMarker([c.latitude, c.longitude], { radius: 5, stroke: false, fillColor: t > .66 ? '#294c34' : t > .33 ? '#8caa50' : '#d7dfb5', fillOpacity: .7 }).addTo(map!).bindTooltip(`Qloo point · raw affinity ${c.affinity.toFixed(3)}`);
      });
      sites.forEach((site, i) => {
        const label = document.createElement('span');
        label.textContent = `${String.fromCharCode(65 + i)} · ${site.name.replace(/^[A-C] · /, '')}`;
        L.circleMarker([site.latitude, site.longitude], { radius: site.id === selected ? 13 : 9, color: '#ffffff', weight: 3, fillColor: '#9d462b', fillOpacity: 1 }).addTo(map!).bindTooltip(label, { permanent: true, direction: 'top', offset: [0, -12] });
      });
      const bounds = L.latLngBounds(sites.map(s => [s.latitude, s.longitude] as [number, number]));
      map.fitBounds(bounds.pad(.35), { maxZoom: 15 });
    });
    return () => { cancelled = true; map?.remove(); };
  }, [sites, cells, selected]);
  return <div className="leaflet-map" ref={container} role="region" aria-label="Candidate locations and returned taste evidence. Use the comparison cards for the same data." />;
}
