'use client';

import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

const vertexShader = `
uniform float time;
varying vec2 vUv;
varying vec3 vPosition;
uniform vec2 pixels;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}
`;

const fragmentShader = `
uniform float time;
uniform float progress;
uniform sampler2D uDataTexture;
uniform sampler2D uTexture;
uniform vec4 resolution;
varying vec2 vUv;
varying vec3 vPosition;

void main() {
  vec2 newUV = (vUv - vec2(0.5)) * resolution.zw + vec2(0.5);
  vec4 color = texture2D(uTexture, newUV);
  vec4 offset = texture2D(uDataTexture, vUv);
  gl_FragColor = texture2D(uTexture, newUV - 0.02 * offset.rg);
}
`;

function clamp(number, min, max) {
  return Math.max(min, Math.min(number, max));
}

export default function Scene({ title = "DAVINCI WALE BHAIYA" }) {
  const containerRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let width = container.offsetWidth || window.innerWidth;
    let height = container.offsetHeight || window.innerHeight;

    // Parameters from index2.html
    const settings = {
      grid: 607,
      mouse: 0.11,
      strength: 0.36,
      relaxation: 0.96,
    };

    const scene = new THREE.Scene();

    const frustumSize = 1;
    const camera = new THREE.OrthographicCamera(
      frustumSize / -2,
      frustumSize / 2,
      frustumSize / 2,
      frustumSize / -2,
      -1000,
      1000
    );
    camera.position.set(0, 0, 2);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(width, height);
    renderer.setClearColor(0x000000, 1);
    if ('outputColorSpace' in renderer) {
      renderer.outputColorSpace = THREE.SRGBColorSpace;
    }

    container.appendChild(renderer.domElement);

    // Grid data setup
    const size = settings.grid;
    const totalPixels = size * size;
    const data = new Float32Array(4 * totalPixels);

    for (let i = 0; i < totalPixels; i++) {
      const r = Math.random() * 255 - 125;
      const r1 = Math.random() * 255 - 125;
      const stride = i * 4;
      data[stride] = r;
      data[stride + 1] = r1;
      data[stride + 2] = r;
      data[stride + 3] = 1.0;
    }

    const dataTexture = new THREE.DataTexture(
      data,
      size,
      size,
      THREE.RGBAFormat,
      THREE.FloatType
    );
    dataTexture.magFilter = THREE.NearestFilter;
    dataTexture.minFilter = THREE.NearestFilter;
    dataTexture.needsUpdate = true;

    // Load main artwork image
    const textureLoader = new THREE.TextureLoader();
    let imageAspect = 1.0 / 1.5; // default 4672 / 7008
    const texture = textureLoader.load('/hero/2.jpg', (tex) => {
      if (tex.image && tex.image.naturalWidth && tex.image.naturalHeight) {
        imageAspect = tex.image.naturalHeight / tex.image.naturalWidth;
        updateResolution();
      }
    });
    if ('colorSpace' in texture) {
      texture.colorSpace = THREE.SRGBColorSpace;
    }

    const material = new THREE.ShaderMaterial({
      side: THREE.DoubleSide,
      uniforms: {
        time: { value: 0 },
        resolution: { value: new THREE.Vector4() },
        uTexture: { value: texture },
        uDataTexture: { value: dataTexture },
      },
      vertexShader,
      fragmentShader,
    });

    const geometry = new THREE.PlaneGeometry(1, 1, 1, 1);
    const plane = new THREE.Mesh(geometry, material);
    scene.add(plane);

    function updateResolution() {
      if (!container) return;
      width = container.offsetWidth || window.innerWidth;
      height = container.offsetHeight || window.innerHeight;
      renderer.setSize(width, height);

      let a1, a2;
      if (height / width > imageAspect) {
        a1 = (width / height) * imageAspect;
        a2 = 1;
      } else {
        a1 = 1;
        a2 = (height / width) / imageAspect;
      }

      material.uniforms.resolution.value.set(width, height, a1, a2);
      camera.updateProjectionMatrix();
    }

    updateResolution();

    const mouse = {
      x: 0.5,
      y: 0.5,
      prevX: 0.5,
      prevY: 0.5,
      vX: 0,
      vY: 0,
      hasMoved: false,
    };

    const handlePointerMove = (clientX, clientY) => {
      const rect = container.getBoundingClientRect();
      const currentX = (clientX - rect.left) / rect.width;
      const currentY = (clientY - rect.top) / rect.height;

      if (!mouse.hasMoved) {
        mouse.prevX = currentX;
        mouse.prevY = currentY;
        mouse.hasMoved = true;
      }

      mouse.x = Math.max(0, Math.min(1, currentX));
      mouse.y = Math.max(0, Math.min(1, currentY));

      mouse.vX = mouse.x - mouse.prevX;
      mouse.vY = mouse.y - mouse.prevY;

      mouse.prevX = mouse.x;
      mouse.prevY = mouse.y;
    };

    const onMouseMove = (e) => handlePointerMove(e.clientX, e.clientY);
    const onTouchMove = (e) => {
      if (e.touches && e.touches[0]) {
        handlePointerMove(e.touches[0].clientX, e.touches[0].clientY);
      }
    };

    window.addEventListener('mousemove', onMouseMove, { passive: true });
    window.addEventListener('touchmove', onTouchMove, { passive: true });
    window.addEventListener('resize', updateResolution);

    function updateDataTexture() {
      const texData = dataTexture.image.data;
      const relaxation = settings.relaxation;

      // Decay existing distortion
      for (let i = 0; i < texData.length; i += 4) {
        texData[i] *= relaxation;
        texData[i + 1] *= relaxation;
      }

      const gridMouseX = size * mouse.x;
      const gridMouseY = size * (1 - mouse.y);
      const maxDist = size * settings.mouse;
      const aspect = height / width;
      const maxDistSq = maxDist * maxDist;

      // Bounded region calculation for smooth 60fps performance
      const minI = Math.max(0, Math.floor(gridMouseX - maxDist * Math.sqrt(aspect)));
      const maxI = Math.min(size, Math.ceil(gridMouseX + maxDist * Math.sqrt(aspect)));
      const minJ = Math.max(0, Math.floor(gridMouseY - maxDist));
      const maxJ = Math.min(size, Math.ceil(gridMouseY + maxDist));

      for (let i = minI; i < maxI; i++) {
        for (let j = minJ; j < maxJ; j++) {
          const distance = ((gridMouseX - i) ** 2) / aspect + (gridMouseY - j) ** 2;
          if (distance < maxDistSq) {
            const index = 4 * (i + size * j);
            let power = maxDist / Math.sqrt(distance);
            power = clamp(power, 0, 10);

            texData[index] += settings.strength * 100 * mouse.vX * power;
            texData[index + 1] -= settings.strength * 100 * mouse.vY * power;
          }
        }
      }

      mouse.vX *= 0.9;
      mouse.vY *= 0.9;
      dataTexture.needsUpdate = true;
    }

    let isRunning = true;
    let time = 0;
    let animationFrameId;

    const animate = () => {
      if (!isRunning) return;
      time += 0.05;
      updateDataTexture();
      material.uniforms.time.value = time;
      renderer.render(scene, camera);
      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      isRunning = false;
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('resize', updateResolution);
      if (renderer.domElement && renderer.domElement.parentNode) {
        renderer.domElement.parentNode.removeChild(renderer.domElement);
      }
      renderer.dispose();
      material.dispose();
      geometry.dispose();
      texture.dispose();
      dataTexture.dispose();
    };
  }, []);

  return (
    <div className="relative w-full h-full min-h-screen select-none overflow-hidden bg-black">
      {/* WebGL Canvas Container */}
      <div
        ref={containerRef}
        className="absolute inset-0 w-full h-full z-0"
        style={{ touchAction: 'none' }}
      />

      {/* Centered Editorial Title */}
      <div className="relative z-10 w-full h-full min-h-screen flex items-center justify-center pointer-events-none px-4">
        <h1
          className="text-center font-bold tracking-tight uppercase text-white drop-shadow-[0_4px_30px_rgba(0,0,0,0.8)]"
          style={{
            fontSize: 'clamp(2.5rem, 8vw, 7.5rem)',
            lineHeight: 0.9,
            maxWidth: '85vw',
            color: '#ffffff',
          }}
        >
          {title}
        </h1>
      </div>
    </div>
  );
}
