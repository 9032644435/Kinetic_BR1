
import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { HandData } from '../types';

interface OrbVisualizerProps { handData: HandData; }

const OrbVisualizer: React.FC<OrbVisualizerProps> = ({ handData }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const orbRef = useRef<THREE.Group | null>(null);
  const pointsRef = useRef<THREE.Points | null>(null);
  const linesRef = useRef<THREE.LineSegments | null>(null);
  const coreRef = useRef<THREE.Mesh | null>(null);
  const requestRef = useRef<number>();

  const COLORS = {
    DEFAULT: new THREE.Color(0x00f2ff),
    LOVE: new THREE.Color(0xff00cc),
    HUMOR: new THREE.Color(0xffaa00)
  };

  useEffect(() => {
    if (!containerRef.current) return;
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 5;
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const group = new THREE.Group();
    orbRef.current = group;
    scene.add(group);

    const pointsGeometry = new THREE.IcosahedronGeometry(1.5, 4);
    const pointsMaterial = new THREE.PointsMaterial({
      color: COLORS.DEFAULT,
      size: 0.05,
      transparent: true,
      blending: THREE.AdditiveBlending,
      opacity: 0.8
    });
    const points = new THREE.Points(pointsGeometry, pointsMaterial);
    pointsRef.current = points;
    group.add(points);

    const wireGeometry = new THREE.IcosahedronGeometry(1.5, 2);
    const wireMaterial = new THREE.LineBasicMaterial({
      color: COLORS.DEFAULT,
      transparent: true,
      opacity: 0.2,
      blending: THREE.AdditiveBlending
    });
    const wireframe = new THREE.LineSegments(new THREE.EdgesGeometry(wireGeometry), wireMaterial);
    linesRef.current = wireframe;
    group.add(wireframe);

    const coreGeometry = new THREE.SphereGeometry(0.3, 32, 32);
    const coreMaterial = new THREE.MeshBasicMaterial({ color: COLORS.DEFAULT, transparent: true, opacity: 0.6 });
    const core = new THREE.Mesh(coreGeometry, coreMaterial);
    coreRef.current = core;
    group.add(core);

    const handleResize = () => {
      if (!cameraRef.current || !rendererRef.current) return;
      cameraRef.current.aspect = window.innerWidth / window.innerHeight;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      if (rendererRef.current && containerRef.current) containerRef.current.removeChild(rendererRef.current.domElement);
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, []);

  useEffect(() => {
    const animate = () => {
      if (!rendererRef.current || !sceneRef.current || !cameraRef.current || !orbRef.current) return;

      const isGestureActive = handData.activeGesture !== 'NONE';
      const expansion = 1 + (handData.pinchDistance * (isGestureActive ? 2.5 : 2.0));
      const rotationBase = 0.005 + handData.pinchDistance * 0.04;
      // Boost rotation significantly during active twist
      const twistMultiplier = isGestureActive ? 5.0 : 1.0;
      const brightness = 0.3 + handData.pinchDistance * 0.7;

      orbRef.current.scale.lerp(new THREE.Vector3(expansion, expansion, expansion), 0.1);
      orbRef.current.rotation.y += rotationBase * twistMultiplier;
      orbRef.current.rotation.x += rotationBase * 0.5 * twistMultiplier;
      orbRef.current.rotation.z += (isGestureActive ? handData.pinchRotation * 0.1 : 0);

      let targetColor = COLORS.DEFAULT;
      if (handData.activeGesture === 'RIGHT_EXPAND') targetColor = COLORS.LOVE;
      if (handData.activeGesture === 'LEFT_EXPAND') targetColor = COLORS.HUMOR;

      if (pointsRef.current) {
        const mat = pointsRef.current.material as THREE.PointsMaterial;
        mat.color.lerp(targetColor, 0.1);
        mat.opacity = brightness;
        mat.size = 0.03 + (handData.pinchDistance * 0.08 * (isGestureActive ? 1.5 : 1));
      }
      
      if (linesRef.current) {
        const mat = linesRef.current.material as THREE.LineBasicMaterial;
        mat.color.lerp(targetColor, 0.1);
        mat.opacity = brightness * (isGestureActive ? 0.6 : 0.3);
      }

      if (coreRef.current) {
        (coreRef.current.material as THREE.MeshBasicMaterial).color.lerp(targetColor, 0.1);
        const coreScale = 1 + (isGestureActive ? Math.sin(Date.now() * 0.01) * 0.5 : 0);
        coreRef.current.scale.set(coreScale, coreScale, coreScale);
      }

      if (handData.isHandPresent && handData.landmarks[9]) {
        const midHand = handData.landmarks[9];
        const targetX = (midHand.x - 0.5) * -7;
        const targetY = (midHand.y - 0.5) * -5;
        orbRef.current.position.lerp(new THREE.Vector3(targetX, targetY, 0), 0.08);
      } else {
        orbRef.current.position.lerp(new THREE.Vector3(0, 0, 0), 0.08);
      }

      rendererRef.current.render(sceneRef.current, cameraRef.current);
      requestRef.current = requestAnimationFrame(animate);
    };

    requestRef.current = requestAnimationFrame(animate);
    return () => { if (requestRef.current) cancelAnimationFrame(requestRef.current); };
  }, [handData]);

  return <div ref={containerRef} className="fixed inset-0 pointer-events-none z-10" />;
};

export default OrbVisualizer;
