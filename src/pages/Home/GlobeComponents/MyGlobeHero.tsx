import { useEffect, useRef } from "react";
import * as THREE from "three";
import { createGlobeAtmosphereMaterial, createManyArcs, degreeToRad } from "./GlobeUtils";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

export default function ThreePlanet() {
  const containerRef = useRef<HTMLDivElement | null>(null)

  

  useEffect(() => {
    const container = containerRef.current

    if(!container) return

    const scene = new THREE.Scene()

    const camera = new THREE.PerspectiveCamera(
      45,
      container.clientWidth / container.clientHeight,
      0.1,
      1000
    )
    camera.position.set(0, 0.35, 7)
    camera.lookAt(0, 0, 0)

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
    })

    renderer.setSize(container.clientWidth, container.clientHeight)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    container.appendChild(renderer.domElement)

    const controls = new OrbitControls(camera, renderer.domElement);

    controls.target.set(0, -2, 0);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;

    controls.enableZoom = false; 
    controls.enablePan = false;
    controls.enableRotate = true;

    controls.rotateSpeed = 0.4;

    controls.minPolarAngle = Math.PI * 0.35;
    controls.maxPolarAngle = Math.PI * 0.65;

    controls.update();

    const initialCameraPosition = camera.position.clone();
    const initialControlsTarget = controls.target.clone();

    // let isUserInteracting = false;
    // let shouldAutoRotate = true;
    let returnTimeout: number | null = null;

    let isReturning = false;
    let returnProgress = 0;

    const returnStartPosition = new THREE.Vector3();
    const returnStartTarget = new THREE.Vector3();

    const returnDuration = 1.2;

    controls.addEventListener("start", () => {
    // isUserInteracting = true;
    // shouldAutoRotate = false;
    isReturning = false;

    if (returnTimeout !== null) {
      window.clearTimeout(returnTimeout);
      returnTimeout = null;
    }
  });

  controls.addEventListener("end", () => {
    // isUserInteracting = false;

    returnTimeout = window.setTimeout(() => {
      returnStartPosition.copy(camera.position);
      returnStartTarget.copy(controls.target);

      returnProgress = 0;
      isReturning = true;
    }, 2000);
  });

    const textureLoader = new THREE.TextureLoader();

    const earthTexture = textureLoader.load("/textures/earth-night.jpg");
    const bumpTexture = textureLoader.load("/textures/earth-bump.png");
    const cloudsTexture = textureLoader.load("/textures/earth-clouds.png");

    const planetGeometry = new THREE.SphereGeometry(2, 64, 64);
    const planetMaterial = new THREE.MeshStandardMaterial({
      map: earthTexture,
      bumpMap: bumpTexture,
      bumpScale: 0.08,
      roughness: 0.9,
    });

    // Планета
    const planet = new THREE.Mesh(planetGeometry, planetMaterial);
    planet.position.y = -2
    planet.rotation.x += degreeToRad(20)
    scene.add(planet);

    // Облака
    const cloudsGeometry = new THREE.SphereGeometry(2.03, 64, 64);
    const cloudsMaterial = new THREE.MeshStandardMaterial({
      map: cloudsTexture,
      transparent: true,
      opacity: 0.35,
      depthWrite: false,
    });

    const clouds = new THREE.Mesh(cloudsGeometry, cloudsMaterial);
    clouds.position.y = -2
    clouds.rotation.x += degreeToRad(20)
    scene.add(clouds);

    //Атмосферное свечение
    const atmosphereGeometry = new THREE.SphereGeometry(2 * (1 + 0.22), 96, 96);
    const atmosphereMaterial = createGlobeAtmosphereMaterial({
      color: "#4cc9ff",
      coefficient: 0.1,
      power: 3.5,
    });

    const atmosphere = new THREE.Mesh(atmosphereGeometry, atmosphereMaterial);

    atmosphere.position.y = -2
    atmosphere.rotation.x += degreeToRad(20)
    scene.add(atmosphere);

    // Арки типо информация
    const arcs = createManyArcs(35);
    arcs.forEach((arc) => {
      arc.position.y = -2
      arc.rotation.x += degreeToRad(20);

      scene.add(arc);
    });


    // Свет
    const ambientLight = new THREE.AmbientLight("#ffffff", 0.25);
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight("#ffffff", 2);
    sunLight.position.set(5, 3, 5);
    scene.add(sunLight);

    // Ресайз контейнера
    const handleResize = () => {
      const width = container.clientWidth;
      const height = container.clientHeight;

      camera.aspect = width / height;
      camera.updateProjectionMatrix();

      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    };

    window.addEventListener("resize", handleResize);

    // Анимация
    let animationId: number

    const animate = () => {
      planet.rotation.y += 0.002;
      clouds.rotation.y += 0.0025;

      arcs.forEach((arc) => {
        arc.rotation.y += 0.002;

        arc.userData.dashTranslate += arc.userData.speed * 0.01;

        const material = arc.material as THREE.ShaderMaterial;
        material.uniforms.dashTranslate.value = arc.userData.dashTranslate;
      })

      if (isReturning) {
      returnProgress += 1 / 60 / returnDuration;

      const t = Math.min(returnProgress, 1);

      const easedT = 1 - Math.pow(1 - t, 3);

      camera.position.lerpVectors(
        returnStartPosition,
        initialCameraPosition,
        easedT
      );

      controls.target.lerpVectors(
        returnStartTarget,
        initialControlsTarget,
        easedT
      );

      controls.update();

      if (t >= 1) {
        isReturning = false;
        // shouldAutoRotate = true;
      }
    } else {
      controls.update();
    }

      renderer.render(scene, camera);
      animationId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("resize", handleResize);

      planetGeometry.dispose();
      planetMaterial.dispose();

      cloudsGeometry.dispose();
      cloudsMaterial.dispose();

      atmosphereGeometry.dispose();
      atmosphereMaterial.dispose();

      earthTexture.dispose();
      bumpTexture.dispose();
      cloudsTexture.dispose();

      if (returnTimeout !== null) {
        window.clearTimeout(returnTimeout);
      }

      controls.dispose();
      renderer.dispose();

      if (renderer.domElement.parentNode) {
        renderer.domElement.parentNode.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="w-full h-screen overflow-hidden absolute top-20"
    />
  )
}