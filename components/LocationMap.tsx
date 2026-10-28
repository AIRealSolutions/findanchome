'use client';

import 'leaflet/dist/leaflet.css';
import { useEffect, useRef } from 'react';
import type { LatLng } from '@/lib/field';

// Southeastern NC, for an empty map.
const DEFAULT_CENTER: LatLng = { lat: 34.2257, lng: -77.9447 };

/**
 * A map with one pin. Drag the pin, or tap the map, to move it (when `onMove` is given). Uses OpenStreetMap tiles,
 * with satellite imagery from Esri for seeing the actual roof.
 */
export default function LocationMap({ point, onMove, height = 280, photos = [] }: {
  point: LatLng | null;
  onMove?: (p: LatLng) => void;
  height?: number;
  /** Where individual photos were taken, shown as small dots. */
  photos?: LatLng[];
}) {
  const el = useRef<HTMLDivElement>(null);
  const map = useRef<import('leaflet').Map | null>(null);
  const marker = useRef<import('leaflet').Marker | null>(null);
  const dots = useRef<import('leaflet').LayerGroup | null>(null);
  const moveRef = useRef(onMove);
  useEffect(() => {
    moveRef.current = onMove;
  }, [onMove]);

  // Create the map once.
  useEffect(() => {
    let cancelled = false;
    import('leaflet').then((L) => {
      if (cancelled || !el.current || map.current) return;
      const start = point ?? DEFAULT_CENTER;
      const m = L.map(el.current, { zoomControl: true }).setView([start.lat, start.lng], point ? 18 : 10);
      const streets = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19, attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(m);
      const satellite = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        maxZoom: 19, attribution: 'Imagery &copy; Esri',
      });
      L.control.layers({ Map: streets, Satellite: satellite }, undefined, { position: 'topright' }).addTo(m);
      const icon = L.divIcon({
        className: '',
        html: '<div style="width:22px;height:22px;border-radius:50% 50% 50% 0;background:#dc2626;border:3px solid #fff;box-shadow:0 1px 4px rgba(0,0,0,.5);transform:rotate(-45deg)"></div>',
        iconSize: [22, 22], iconAnchor: [11, 22],
      });
      const mk = L.marker([start.lat, start.lng], { icon, draggable: !!moveRef.current, opacity: point ? 1 : 0 }).addTo(m);
      mk.on('dragend', () => {
        const p = mk.getLatLng();
        moveRef.current?.({ lat: p.lat, lng: p.lng });
      });
      m.on('click', (e: import('leaflet').LeafletMouseEvent) => {
        if (!moveRef.current) return;
        mk.setLatLng(e.latlng).setOpacity(1);
        moveRef.current({ lat: e.latlng.lat, lng: e.latlng.lng });
      });
      dots.current = L.layerGroup().addTo(m);
      map.current = m;
      marker.current = mk;
    });
    return () => {
      cancelled = true;
      map.current?.remove();
      map.current = null;
      marker.current = null;
    };
    // The map is created once; later point changes are applied below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Follow the point when it changes from outside (photo GPS, "use my location").
  useEffect(() => {
    if (!map.current || !marker.current || !point) return;
    const cur = marker.current.getLatLng();
    if (Math.abs(cur.lat - point.lat) > 1e-7 || Math.abs(cur.lng - point.lng) > 1e-7 || marker.current.options.opacity === 0) {
      marker.current.setLatLng([point.lat, point.lng]).setOpacity(1);
      map.current.setView([point.lat, point.lng], Math.max(map.current.getZoom(), 17));
    }
  }, [point]);

  useEffect(() => {
    import('leaflet').then((L) => {
      if (!dots.current) return;
      dots.current.clearLayers();
      photos.forEach((p) => L.circleMarker([p.lat, p.lng], { radius: 5, color: '#fff', weight: 2, fillColor: '#2563eb', fillOpacity: 1 }).addTo(dots.current!));
    });
  }, [photos]);

  return <div ref={el} style={{ height }} className="w-full rounded-lg border border-gray-200 z-0" role="application" aria-label="Map of the property location" />;
}
