import React, { useEffect, useRef } from 'react';

export function RadarMap({ hospitalCoord, matches, activeDispatch }) {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef({});
  const polylineRef = useRef(null);
  const vehicleMarkerRef = useRef(null);

  useEffect(() => {
    if (mapInstanceRef.current) return;

    const L = window.L;
    if (!L) return;

    const map = L.map(mapRef.current, { zoomControl: false }).setView(hospitalCoord, 13);
    mapInstanceRef.current = map;

    // Dark Leaflet tiles (CartoDB Dark Matter)
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
      subdomains: 'abcd',
      maxZoom: 19
    }).addTo(map);

    // Hospital Marker with pulsing halo
    const hospitalIcon = L.divIcon({ className: 'hospital-icon', iconSize: [26, 26] });
    L.marker(hospitalCoord, { icon: hospitalIcon })
      .addTo(map)
      .bindTooltip('<b style="color:#ef4444">SF General Emergency Hospital</b><br><span style="font-size:11px;color:#94a3b8">Trauma Center Dispatch Hub</span>', { permanent: false });

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [hospitalCoord]);

  // Update donor markers when matches change
  useEffect(() => {
    const map = mapInstanceRef.current;
    const L = window.L;
    if (!map || !L) return;

    // Clear old markers
    Object.values(markersRef.current).forEach(m => map.removeLayer(m));
    markersRef.current = {};

    matches.forEach(d => {
      const isSelected = activeDispatch && activeDispatch.donorId === d.id;
      const iconClass = isSelected ? 'active-donor-icon' : 'donor-icon';
      const size = isSelected ? [24, 24] : [18, 18];

      const icon = L.divIcon({ className: iconClass, iconSize: size });
      const marker = L.marker([d.lat, d.lng], { icon })
        .addTo(map)
        .bindTooltip(`<b>${d.name} (${d.bloodType})</b><br>Match Score: <span style="color:#38bdf8;font-weight:bold">${d.aiScore}%</span>`, { direction: 'top' });

      markersRef.current[d.id] = marker;
    });
  }, [matches, activeDispatch]);

  // Update active dispatch vector polyline and moving vehicle/drone marker
  useEffect(() => {
    const map = mapInstanceRef.current;
    const L = window.L;
    if (!map || !L) return;

    if (polylineRef.current) {
      map.removeLayer(polylineRef.current);
      polylineRef.current = null;
    }

    if (vehicleMarkerRef.current) {
      map.removeLayer(vehicleMarkerRef.current);
      vehicleMarkerRef.current = null;
    }

    if (activeDispatch) {
      const coords = [
        [activeDispatch.currentLat, activeDispatch.currentLng],
        [activeDispatch.targetLat, activeDispatch.targetLng]
      ];

      polylineRef.current = L.polyline(coords, {
        color: '#0284c7',
        weight: 3,
        dashArray: '8, 8',
        opacity: 0.85
      }).addTo(map);

      // Render active drone/transport icon on current position
      const vehicleIcon = L.divIcon({ className: 'drone-icon', iconSize: [22, 22] });
      vehicleMarkerRef.current = L.marker([activeDispatch.currentLat, activeDispatch.currentLng], { icon: vehicleIcon })
        .addTo(map)
        .bindTooltip(`<b>${activeDispatch.transportType}</b><br>ETA: <span style="color:#38bdf8;font-weight:bold">${activeDispatch.etaMinutes} min</span>`, { direction: 'top' });

      // Pan smoothly to dispatch location
      map.panTo([activeDispatch.currentLat, activeDispatch.currentLng], { animate: true });
    }
  }, [activeDispatch]);

  return <div ref={mapRef} className="absolute inset-0 w-full h-full z-0" aria-label="Interactive emergency blood logistics radar map" />;
}
