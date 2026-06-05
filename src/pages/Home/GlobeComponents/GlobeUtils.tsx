import * as THREE from "three";


export function createGlobeAtmosphereMaterial({
  color = "#4cc9ff",
  coefficient = 0.1,
  power = 3.5,
} = {}) {
  return new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    side: THREE.BackSide,
    blending: THREE.AdditiveBlending,

    uniforms: {
      glowColor: {
        value: new THREE.Color(color),
      },
      coefficient: {
        value: coefficient,
      },
      power: {
        value: power,
      },
    },

    vertexShader: `
      varying vec3 vVertexWorldPosition;
      varying vec3 vVertexNormal;

      void main() {
        vVertexNormal = normalize(normalMatrix * normal);

        vec4 worldPosition = modelMatrix * vec4(position, 1.0);
        vVertexWorldPosition = worldPosition.xyz;

        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,

    fragmentShader: `
      uniform vec3 glowColor;
      uniform float coefficient;
      uniform float power;

      varying vec3 vVertexNormal;
      varying vec3 vVertexWorldPosition;

      void main() {
        vec3 worldCameraToVertex = vVertexWorldPosition - cameraPosition;
        vec3 viewCameraToVertex = normalize(
          vec3(viewMatrix * vec4(worldCameraToVertex, 0.0))
        );

        float intensity = pow(
          coefficient + dot(vVertexNormal, viewCameraToVertex),
          power
        );

        gl_FragColor = vec4(glowColor, intensity);
      }
    `,
  });
}

export function degreeToRad(deg: number){
    return deg * Math.PI / 180;
}

const CITIES = {
  newYork: { lat: 40.7128, lng: -74.006 },
  london: { lat: 51.5072, lng: -0.1276 },
  paris: { lat: 48.8566, lng: 2.3522 },
  tokyo: { lat: 35.6762, lng: 139.6503 },
  singapore: { lat: 1.3521, lng: 103.8198 },
  dubai: { lat: 25.2048, lng: 55.2708 },
  sydney: { lat: -33.8688, lng: 151.2093 },
  sanFrancisco: { lat: 37.7749, lng: -122.4194 },
  berlin: { lat: 52.52, lng: 13.405 },
  moscow: { lat: 55.7558, lng: 37.6173 },
  mexicoCity: { lat: 19.4326, lng: -99.1332 },
  saoPaulo: { lat: -23.5505, lng: -46.6333 },
  delhi: { lat: 28.6139, lng: 77.209 },
  shanghai: { lat: 31.2304, lng: 121.4737 },
  istanbul: { lat: 41.0082, lng: 28.9784 },
};

const ROUTES = [
  [CITIES.newYork, CITIES.london],
  [CITIES.london, CITIES.dubai],
  [CITIES.dubai, CITIES.singapore],
  [CITIES.singapore, CITIES.tokyo],
  [CITIES.tokyo, CITIES.sanFrancisco],
  [CITIES.sanFrancisco, CITIES.newYork],

  [CITIES.paris, CITIES.istanbul],
  [CITIES.istanbul, CITIES.delhi],
  [CITIES.delhi, CITIES.shanghai],
  [CITIES.shanghai, CITIES.tokyo],

  [CITIES.berlin, CITIES.moscow],
  [CITIES.moscow, CITIES.dubai],
  [CITIES.sydney, CITIES.singapore],
  [CITIES.mexicoCity, CITIES.newYork],
  [CITIES.saoPaulo, CITIES.paris],
] as const;

export function createManyArcs(count = 40): THREE.Mesh<THREE.TubeGeometry, THREE.ShaderMaterial>[] {
  const arcs: THREE.Mesh<THREE.TubeGeometry, THREE.ShaderMaterial>[] = [];

  for (let i = 0; i < count; i++) {
    const [start, end] = ROUTES[i % ROUTES.length];

    const arc = createArc(
      start.lat,
      start.lng,
      end.lat,
      end.lng,
      2
    );

    arc.userData.progress = -Math.random() * 1.2;
    arc.userData.trailRatio = 0.45 + Math.random() * 0.25;
    arc.userData.speed = 0.25 + Math.random() * 0.2;

    arcs.push(arc);
  }

  return arcs;
}

export function latLngToVector3(lat: number, lng: number, radius: number) {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lng + 180) * (Math.PI / 180);

  const x = -radius * Math.sin(phi) * Math.cos(theta);
  const z = radius * Math.sin(phi) * Math.sin(theta);
  const y = radius * Math.cos(phi);

  return new THREE.Vector3(x, y, z);
}

export function createArc(
  startLat: number,
  startLng: number,
  endLat: number,
  endLng: number,
  radius = 2.08
): THREE.Mesh<THREE.TubeGeometry, THREE.ShaderMaterial> {
  const start = latLngToVector3(startLat, startLng, radius);
  const end = latLngToVector3(endLat, endLng, radius);

  const mid = start.clone().add(end).multiplyScalar(0.5);
  mid.normalize().multiplyScalar(radius + 0.75);

  const curve = new THREE.QuadraticBezierCurve3(start, mid, end);

  const tubularSegments = 120;
  const radialSegments = 6;

  const geometry = new THREE.TubeGeometry(
    curve,
    tubularSegments,
    0.005, // толщина
    radialSegments,
    false
  );

  geometry.setAttribute(
    "relDistance",
    createRelDistanceAttribute(tubularSegments, radialSegments, true)
  );

  const material = createDashedArcMaterial();

  const arc = new THREE.Mesh(geometry, material);

  arc.userData = {
    speed: 0.35 + Math.random() * 0.25,
    dashTranslate: Math.random() * 2,
    dashSize: 0.75 + Math.random() * 0.2,
    gapSize: 2.4 + Math.random() * 1.2,
  };

  material.uniforms.dashSize.value = arc.userData.dashSize;
  material.uniforms.gapSize.value = arc.userData.gapSize;
  material.uniforms.dashTranslate.value = arc.userData.dashTranslate;

  return arc;
}

export function createDashedArcMaterial() {
  return new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,

    uniforms: {
      color: { value: new THREE.Color("#60f8ff") },

      dashSize: { value: 0.85 },
      gapSize: { value: 1.4 },
      dashTranslate: { value: 0 },
      opacity: { value: 0.9 },
      edgeFade: { value: 0.08 },
    },

    vertexShader: `
      attribute float relDistance;
      varying float vRelDistance;

      void main() {
        vRelDistance = relDistance;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,

    fragmentShader: `
      uniform vec3 color;
      uniform float dashSize;
      uniform float gapSize;
      uniform float dashTranslate;
      uniform float opacity;
      uniform float edgeFade;

      varying float vRelDistance;

      void main() {
        float totalSize = dashSize + gapSize;

        float linePos = mod(vRelDistance + dashTranslate, totalSize);

        if (linePos > dashSize) {
          discard;
        }

        float fadeHead = 1.0 - smoothstep(dashSize - edgeFade, dashSize, linePos);
        float fadeTail = smoothstep(0.0, edgeFade, linePos);

        float alpha = opacity * fadeHead * fadeTail;

        if (alpha < 0.01) {
          discard;
        }

        gl_FragColor = vec4(color, alpha);
      }
    `,
  });
}

function createRelDistanceAttribute(
  tubularSegments: number,
  radialSegments: number,
  invert = true
) {
  const values: number[] = [];

  for (let i = 0; i <= tubularSegments; i++) {
    const t = i / tubularSegments;
    const relDistance = invert ? 1 - t : t;

    for (let j = 0; j <= radialSegments; j++) {
      values.push(relDistance);
    }
  }

  return new THREE.Float32BufferAttribute(values, 1);
}
