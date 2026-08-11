"use client";

import React, { useEffect, useRef } from "react";
import * as THREE from "three";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader.js";

export default function CameraCanvas() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const w = container.clientWidth || 500;
    const h = container.clientHeight || 450;

    // 1. Scene
    const scene = new THREE.Scene();

    // 2. Camera setup - Positioned for large borderless 3D impact
    const camera = new THREE.PerspectiveCamera(45, w / h, 1, 2000);
    camera.position.set(0, 0, 175);
    camera.lookAt(0, 0, 0);

    // 3. Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(w, h);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    container.appendChild(renderer.domElement);

    // 4. Studio Lighting setup
    const ambientLight = new THREE.AmbientLight(0xffffff, 2.2);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xfff5e6, 2.5);
    keyLight.position.set(150, 200, 150);
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0xeab308, 1.8);
    fillLight.position.set(-150, 50, -100);
    scene.add(fillLight);

    const rimLight = new THREE.PointLight(0xeab308, 3.5, 400);
    rimLight.position.set(0, 0, -150);
    scene.add(rimLight);

    const modelGroup = new THREE.Group();
    scene.add(modelGroup);

    // Texture
    const textureLoader = new THREE.TextureLoader();
    const texture = textureLoader.load("/camera3d/10124_SLR_Camera_V1_Diffuse.jpg");
    texture.colorSpace = THREE.SRGBColorSpace;

    // Material
    const material = new THREE.MeshStandardMaterial({
      map: texture,
      roughness: 0.3,
      metalness: 0.5,
    });

    // 5. Load OBJ & Shift Y upwards into the glowing halo center
    const objLoader = new OBJLoader();
    objLoader.load(
      "/camera3d/10124_SLR_Camera_SG_V1_Iteration2.obj",
      (obj: any) => {
        // Step A: Apply upright rotation FIRST
        obj.rotation.x = -Math.PI / 2;
        obj.rotation.y = 0;
        obj.rotation.z = Math.PI / 10;
        obj.updateMatrixWorld(true);

        // Step B: Calculate post-rotation Bounding Box & Center
        const box = new THREE.Box3().setFromObject(obj);
        const center = box.getCenter(new THREE.Vector3());
        const size = box.getSize(new THREE.Vector3());

        // Step C: Shift mesh geometry by exact center vector
        obj.position.sub(center);

        // Step D: Shift Y slightly upwards (+22px) so it centers right inside the gold halo glow!
        obj.position.y += 22;

        // Step E: Scale factor for large borderless impact
        const maxDim = Math.max(size.x, size.y, size.z);
        if (maxDim > 0) {
          const targetSize = w < 480 ? 115 : w < 768 ? 140 : 165;
          const scaleFactor = targetSize / maxDim;
          obj.scale.set(scaleFactor, scaleFactor, scaleFactor);
        }

        obj.traverse((child: any) => {
          if (child.isMesh) {
            child.material = material;
            if (child.geometry) child.geometry.computeVertexNormals();
          }
        });

        modelGroup.add(obj);
      },
      undefined,
      (err: any) => {
        console.error("OBJ load error", err);
      }
    );

    const onResize = () => {
      if (!containerRef.current) return;
      const nw = containerRef.current.clientWidth;
      const nh = containerRef.current.clientHeight;
      camera.aspect = nw / nh;
      camera.updateProjectionMatrix();
      renderer.setSize(nw, nh);
    };

    window.addEventListener("resize", onResize);

    // 6. Continuous Ultra-slow Auto-Spin Animation Loop (Tốc độ 0.002 từ tốn, siêu mượt)
    let animId: number;
    const renderLoop = () => {
      animId = requestAnimationFrame(renderLoop);

      // Continuous ultra-slow 360-degree auto rotation (speed = 0.002)
      modelGroup.rotation.y += 0.002;
      modelGroup.rotation.x = 0; // Lock vertical tilt
      modelGroup.position.y = Math.sin(Date.now() * 0.001) * 3; // Floating smoothly in halo center

      renderer.render(scene, camera);
    };
    renderLoop();

    return () => {
      window.removeEventListener("resize", onResize);
      cancelAnimationFrame(animId);
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  return <div ref={containerRef} style={{ width: "100%", height: "100%", minHeight: "220px" }} />;
}
