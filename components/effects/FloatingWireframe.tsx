'use client';
import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';

export default function FloatingWireframe() {
  const containerRef = useRef<HTMLDivElement>(null);
  const cleanupRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Scene
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, container.clientWidth / container.clientHeight, 0.1, 100);
    camera.position.z = 6;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    container.appendChild(renderer.domElement);

    // Postprocessing — Bloom
    const composer = new EffectComposer(renderer);
    composer.addPass(new RenderPass(scene, camera));

    const isMobile = window.innerWidth < 768;
    if (!isMobile) {
      const bloomPass = new UnrealBloomPass(
        new THREE.Vector2(container.clientWidth, container.clientHeight),
        1.2, // strength
        0.6, // radius
        0.1  // threshold
      );
      composer.addPass(bloomPass);
    }

    // Main icosahedron
    const icoGeom = new THREE.IcosahedronGeometry(2, 1);
    const icoMat = new THREE.MeshBasicMaterial({
      color: 0x2563EB,
      wireframe: true,
      transparent: true,
      opacity: 0.6,
    });
    const ico = new THREE.Mesh(icoGeom, icoMat);
    scene.add(ico);

    // Orbiting torus knots
    const knots: THREE.Mesh[] = [];
    const knotColors = [0x2563EB, 0xC9A96E, 0x4F8BFF];
    const knotRadii = [3.2, 3.8, 4.3];

    for (let i = 0; i < 3; i++) {
      const kGeom = new THREE.TorusKnotGeometry(0.3, 0.08, 64, 8, 2, 3);
      const kMat = new THREE.MeshBasicMaterial({
        color: knotColors[i],
        wireframe: true,
        transparent: true,
        opacity: 0.4,
      });
      const knot = new THREE.Mesh(kGeom, kMat);
      knots.push(knot);
      scene.add(knot);
    }

    // Mouse tracking
    let mouseX = 0, mouseY = 0;
    const handleMouseMove = (e: MouseEvent) => {
      mouseX = (e.clientX / window.innerWidth) * 2 - 1;
      mouseY = -(e.clientY / window.innerHeight) * 2 + 1;
    };
    window.addEventListener('mousemove', handleMouseMove);

    // Timer
    const timer = new THREE.Timer();

    // Animation
    renderer.setAnimationLoop(() => {
      timer.update();
      const elapsed = timer.getElapsed();

      // Main icosahedron — slow rotation + float
      ico.rotation.x = elapsed * 0.15;
      ico.rotation.y = elapsed * 0.2;
      ico.position.y = Math.sin(elapsed * 0.5) * 0.3;

      // Mouse parallax on camera
      camera.position.x += (mouseX * 0.8 - camera.position.x) * 0.02;
      camera.position.y += (mouseY * 0.5 - camera.position.y) * 0.02;
      camera.lookAt(0, 0, 0);

      // Orbit the knots
      knots.forEach((knot, i) => {
        const angle = elapsed * (0.3 + i * 0.1) + (i * Math.PI * 2) / 3;
        const r = knotRadii[i];
        knot.position.x = Math.cos(angle) * r;
        knot.position.z = Math.sin(angle) * r;
        knot.position.y = Math.sin(elapsed * 0.4 + i) * 0.5;
        knot.rotation.x = elapsed * 0.3;
        knot.rotation.y = elapsed * 0.5;
      });

      composer.render();
    });

    // Resize handler
    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
      composer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    // Cleanup
    cleanupRef.current = () => {
      renderer.setAnimationLoop(null);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      icoGeom.dispose();
      icoMat.dispose();
      knots.forEach((k) => {
        (k.geometry as THREE.BufferGeometry).dispose();
        (k.material as THREE.Material).dispose();
      });
      renderer.dispose();
      composer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };

    return () => {
      if (cleanupRef.current) cleanupRef.current();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      style={{
        position: 'relative',
        width: '100%',
        height: 420,
        overflow: 'hidden',
      }}
    >
      {/* Gradient fade top & bottom for seamless blending */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 80,
          background: 'linear-gradient(180deg, #000 0%, transparent 100%)',
          zIndex: 1,
          pointerEvents: 'none',
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: 80,
          background: 'linear-gradient(0deg, #000 0%, transparent 100%)',
          zIndex: 1,
          pointerEvents: 'none',
        }}
      />
    </div>
  );
}
