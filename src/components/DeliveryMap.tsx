import { useEffect, useRef, useState, useCallback } from "react";

declare global {
  interface Window { L: any; }
}

interface Props {
  onAddressChange: (address: string) => void;
}

export default function DeliveryMap({ onAddressChange }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const [address, setAddress] = useState("");
  const [geoLoading, setGeoLoading] = useState(false);
  const [mapReady, setMapReady] = useState(false);

  const reverseGeocode = useCallback(async (lat: number, lng: number) => {
    try {
      const r = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&accept-language=ru`,
        { headers: { "Accept-Language": "ru" } }
      );
      const data = await r.json();
      const addr: string = data.display_name || `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
      setAddress(addr);
      onAddressChange(addr);
    } catch {
      const addr = `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
      setAddress(addr);
      onAddressChange(addr);
    }
  }, [onAddressChange]);

  const placeMarker = useCallback((lat: number, lng: number) => {
    if (!mapRef.current) return;
    const L = window.L;
    if (markerRef.current) {
      markerRef.current.setLatLng([lat, lng]);
    } else {
      const icon = L.divIcon({
        className: "",
        html: `<div style="width:28px;height:28px;background:#8B0000;border-radius:50% 50% 50% 0;transform:rotate(-45deg);border:3px solid #fff;box-shadow:0 2px 8px rgba(0,0,0,0.35)"></div>`,
        iconSize: [28, 28],
        iconAnchor: [14, 28],
      });
      markerRef.current = L.marker([lat, lng], { icon }).addTo(mapRef.current);
    }
    reverseGeocode(lat, lng);
  }, [reverseGeocode]);

  const initMap = useCallback(() => {
    if (!containerRef.current || mapRef.current) return;
    const L = window.L;
    const map = L.map(containerRef.current, { zoomControl: true }).setView([55.7558, 37.6173], 11);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '© <a href="https://www.openstreetmap.org">OpenStreetMap</a>'
    }).addTo(map);
    map.on("click", (e: any) => {
      placeMarker(e.latlng.lat, e.latlng.lng);
    });
    mapRef.current = map;
    setMapReady(true);
  }, [placeMarker]);

  useEffect(() => {
    // Подключаем Leaflet CSS
    if (!document.getElementById("leaflet-css")) {
      const link = document.createElement("link");
      link.id = "leaflet-css";
      link.rel = "stylesheet";
      link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
      document.head.appendChild(link);
    }

    if (window.L) {
      initMap();
    } else {
      const script = document.createElement("script");
      script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
      script.id = "leaflet-js";
      script.onload = () => initMap();
      document.head.appendChild(script);
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
        markerRef.current = null;
      }
    };
  }, [initMap]);

  const useMyLocation = () => {
    if (!navigator.geolocation) {
      alert("Геолокация недоступна в вашем браузере");
      return;
    }
    setGeoLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude: lat, longitude: lng } = pos.coords;
        if (mapRef.current) {
          mapRef.current.setView([lat, lng], 16);
          placeMarker(lat, lng);
        }
        setGeoLoading(false);
      },
      () => {
        alert("Не удалось определить местоположение");
        setGeoLoading(false);
      },
      { timeout: 10000 }
    );
  };

  return (
    <div>
      {/* Инструкция */}
      <p style={{ fontSize: 10, letterSpacing: 1, color: "#888", fontFamily: "Montserrat", marginBottom: 8 }}>
        Нажмите на карту, чтобы выбрать адрес доставки
      </p>

      {/* Карта */}
      <div
        ref={containerRef}
        style={{
          height: 210, width: "100%",
          border: "1px solid #D9CFC0",
          marginBottom: 8,
          opacity: mapReady ? 1 : 0.5,
          transition: "opacity 0.3s"
        }}
      />

      {/* Кнопка геолокации */}
      <button
        type="button"
        onClick={useMyLocation}
        disabled={geoLoading}
        style={{
          display: "flex", alignItems: "center", gap: 8,
          border: "1px solid #008000", color: "#008000",
          background: "transparent", padding: "8px 16px",
          fontFamily: "Montserrat", fontSize: 10, letterSpacing: 2,
          textTransform: "uppercase", cursor: "pointer",
          width: "100%", justifyContent: "center", marginBottom: 10,
          transition: "all 0.2s", opacity: geoLoading ? 0.6 : 1
        }}
        onMouseEnter={e => { if (!geoLoading) { (e.currentTarget as HTMLElement).style.background = "#008000"; (e.currentTarget as HTMLElement).style.color = "#fff"; } }}
        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "transparent"; (e.currentTarget as HTMLElement).style.color = "#008000"; }}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="3"/><path d="M12 1v4M12 19v4M1 12h4M19 12h4"/>
        </svg>
        {geoLoading ? "Определяю..." : "Моё местоположение"}
      </button>

      {/* Адрес */}
      {address && (
        <div style={{ backgroundColor: "#F0FFF0", border: "1px solid #008000", padding: "10px 14px" }}>
          <p style={{ fontSize: 9, letterSpacing: 2, textTransform: "uppercase", color: "#008000", margin: "0 0 4px", fontFamily: "Montserrat" }}>
            Выбранный адрес:
          </p>
          <p style={{ fontSize: 12, color: "#1A1A1A", margin: 0, lineHeight: 1.5 }}>{address}</p>
        </div>
      )}
    </div>
  );
}
