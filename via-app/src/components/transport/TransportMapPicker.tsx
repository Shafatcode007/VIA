"use client";

import { useEffect, useRef } from "react";
import "leaflet/dist/leaflet.css";

export interface MapPoint {
  lat: number;
  lon: number;
}

interface TransportMapPickerProps {
  pickup: MapPoint | null;
  drop: MapPoint | null;
  selecting: "pickup" | "drop";
  onSelect: (which: "pickup" | "drop", point: MapPoint) => void;
  focus: MapPoint | null;
}

/**
 * Leaflet + OpenStreetMap picker (SSR-safe via dynamic import).
 * circleMarkers avoid bundler icon-asset issues.
 */
export function TransportMapPicker({
  pickup,
  drop,
  selecting,
  onSelect,
  focus,
}: TransportMapPickerProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<any>(null);
  const markersRef = useRef<Record<string, any>>({});
  const onSelectRef = useRef(onSelect);
  const selectingRef = useRef(selecting);

  useEffect(() => {
    onSelectRef.current = onSelect;
    selectingRef.current = selecting;
  }, [onSelect, selecting]);

  useEffect(() => {
    let cancelled = false;
    import("leaflet").then((L) => {
      if (cancelled || !containerRef.current || mapRef.current) return;
      const map = L.map(containerRef.current).setView([23.7925, 90.4078], 13);
      L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap contributors",
      }).addTo(map);
      map.on("click", (event: any) => {
        onSelectRef.current(selectingRef.current, { lat: event.latlng.lat, lon: event.latlng.lng });
      });
      mapRef.current = map;
    });
    return () => {
      cancelled = true;
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!mapRef.current) return;
    import("leaflet").then((L) => {
      const layers: Array<["pickup" | "drop", MapPoint | null, string]> = [
        ["pickup", pickup, "#4DBE55"],
        ["drop", drop, "#E23A55"],
      ];
      layers.forEach(([which, point, color]) => {
        if (markersRef.current[which]) {
          markersRef.current[which].remove();
          delete markersRef.current[which];
        }
        if (point && mapRef.current) {
          markersRef.current[which] = L.circleMarker([point.lat, point.lon], {
            radius: 9,
            color,
            fillColor: color,
            fillOpacity: 0.7,
          }).addTo(mapRef.current);
        }
      });
    });
  }, [pickup, drop]);

  // Focus/recenter map when focus point changes
  useEffect(() => {
    if (focus && mapRef.current) {
      mapRef.current.setView([focus.lat, focus.lon], 15, { animate: true });
    }
  }, [focus]);

  return <div ref={containerRef} className="z-0 h-80 w-full rounded-xl" />;
}