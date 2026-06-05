import { useEffect, useMemo, useRef, useState } from "react";
import Globe from "react-globe.gl";

const CITIES = [
  { lat: 40.7128, lng: -74.006 },
  { lat: 51.5072, lng: -0.1276 },
  { lat: 48.8566, lng: 2.3522 },
  { lat: 35.6762, lng: 139.6503 },
  { lat: 1.3521, lng: 103.8198 },
  { lat: 25.2048, lng: 55.2708 },
  { lat: -33.8688, lng: 151.2093 },
  { lat: 37.7749, lng: -122.4194 },
  { lat: 52.52, lng: 13.405 },
  { lat: 55.7558, lng: 37.6173 },
];

function makeArcs() {
  return Array.from({ length: 18 }, (_, i) => {
    const start = CITIES[i % CITIES.length];
    const end = CITIES[(i * 3 + 4) % CITIES.length];


    return {
      startLat: start.lat,
      startLng: start.lng,
      endLat: end.lat,
      endLng: end.lng,
      color: [
        "rgba(0, 217, 255, 0.2)",
        "rgba(255, 255, 255, 0.95)",
        "rgba(96, 248, 255, 0.2)",
      ],
      dashInitialGap: Math.random() * 2.5,
    };
  })
}

function useWindowSize() {
  const [size, setSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  })

  useEffect(() => {
    const onResize = () => {
      setSize({
        width: window.innerWidth,
        height: window.innerHeight,
      })
    }

    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [])

  return size;
}

export default function GlobeHero() {
  const globeRef = useRef<any>(null);
  const { width, height } = useWindowSize();

  const arcs = useMemo(() => makeArcs(), []);

  useEffect(() => {
    const globe = globeRef.current;

    if (!globe) return;

    const controls = globe.controls();

    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.35;
    controls.enableZoom = false;
    controls.enablePan = false;
    controls.enableRotate = false;

    globe.pointOfView(
      {
        lat: 30,
        lng: 35,
        altitude: 1.9,
      },
      0
    );
  }, []);

  return (
    <div className="absolute   pointer-events-none">
      <div className="absolute left-1/2 -translate-x-1/2 top-[110vh] scale-[2.7]">
        <Globe
          ref={globeRef}
          width={width}
          height={height }
          backgroundColor="rgba(0,0,0,0)"
          rendererConfig={{
            alpha: true,
            antialias: false,
            powerPreference: "default",
          }}
          globeImageUrl="//unpkg.com/three-globe/example/img/earth-night.jpg"
          bumpImageUrl="//unpkg.com/three-globe/example/img/earth-topology.png"
          onGlobeReady={() => {
            const globe = globeRef.current;
            if (!globe) return;

            const material = globe.globeMaterial();

            material.bumpScale = 12;
            material.shininess = 3;
            material.needsUpdate = true;
          }}
          showAtmosphere={true}
          atmosphereColor="#4cc9ff"
          atmosphereAltitude={0.22}
          arcsData={arcs}
          arcStartLat="startLat"
          arcStartLng="startLng"
          arcEndLat="endLat"
          arcEndLng="endLng"
          arcColor="color"
          arcAltitude={0.22} // Высота дуги над поверхностью глобуса
          arcStroke={0.3} // Толщина линии
          arcDashLength={1} // длина светящегося кусочка
          arcDashGap={1.6} // расстояние между ними
          arcDashAnimateTime={1600} 
          arcsTransitionDuration={0}
          animateIn={false} // стартовая анимация появления глобуса
          arcDashInitialGap="dashInitialGap"
        />
      </div>
    </div>
  );
}