import { useRef, useState, useEffect } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Float, Torus, Octahedron, Icosahedron, Box } from "@react-three/drei";
import * as THREE from "three";

function FloatingShape({ position, color, speed = 1, scale = 1, shape = "torus" }: {
  position: [number, number, number];
  color: string;
  speed?: number;
  scale?: number;
  shape?: "torus" | "octahedron" | "icosahedron" | "box";
}) {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (!meshRef.current) return;
    meshRef.current.rotation.x = state.clock.elapsedTime * 0.3 * speed;
    meshRef.current.rotation.y = state.clock.elapsedTime * 0.5 * speed;
  });

  const material = (
    <meshStandardMaterial
      color={color}
      emissive={color}
      emissiveIntensity={0.3}
      roughness={0.1}
      metalness={0.8}
      transparent
      opacity={0.7}
      wireframe={shape === "icosahedron"}
    />
  );

  return (
    <Float speed={speed} rotationIntensity={0.5} floatIntensity={0.5}>
      <mesh ref={meshRef} position={position} scale={scale}>
        {shape === "torus" && <torusGeometry args={[1, 0.3, 16, 32]} />}
        {shape === "octahedron" && <octahedronGeometry args={[1]} />}
        {shape === "icosahedron" && <icosahedronGeometry args={[1]} />}
        {shape === "box" && <boxGeometry args={[1, 1, 1]} />}
        {material}
      </mesh>
    </Float>
  );
}

function MouseCamera() {
  const { camera } = useThree();
  const mouse = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      mouse.current.x = (e.clientX / window.innerWidth - 0.5) * 2;
      mouse.current.y = -(e.clientY / window.innerHeight - 0.5) * 2;
    };
    window.addEventListener("mousemove", handler);
    return () => window.removeEventListener("mousemove", handler);
  }, []);

  useFrame(() => {
    camera.position.x += (mouse.current.x * 1.5 - camera.position.x) * 0.05;
    camera.position.y += (mouse.current.y * 0.8 - camera.position.y) * 0.05;
    camera.lookAt(0, 0, 0);
  });

  return null;
}

export default function Scene3D() {
  return (
    <Canvas
      camera={{ position: [0, 0, 8], fov: 60 }}
      style={{ position: "absolute", inset: 0 }}
      gl={{ antialias: true, alpha: true }}
    >
      <ambientLight intensity={0.2} />
      <pointLight position={[10, 10, 10]} intensity={1} color="#00FFFF" />
      <pointLight position={[-10, -10, -10]} intensity={0.5} color="#8B5CF6" />
      <pointLight position={[0, 10, -10]} intensity={0.3} color="#EC4899" />

      <MouseCamera />

      {/* Floating 3D objects */}
      <FloatingShape position={[-4, 2, -2]} color="#00FFFF" speed={0.6} scale={0.7} shape="torus" />
      <FloatingShape position={[4, -1, -3]} color="#8B5CF6" speed={0.8} scale={0.9} shape="octahedron" />
      <FloatingShape position={[3, 3, -4]} color="#00FFFF" speed={0.5} scale={0.5} shape="icosahedron" />
      <FloatingShape position={[-3, -2, -2]} color="#8B5CF6" speed={1.2} scale={0.6} shape="box" />
      <FloatingShape position={[0, -3, -5]} color="#EC4899" speed={0.7} scale={0.8} shape="torus" />
      <FloatingShape position={[-5, 0, -5]} color="#00FFFF" speed={0.9} scale={1.1} shape="octahedron" />
      <FloatingShape position={[5, 1, -4]} color="#8B5CF6" speed={0.6} scale={0.4} shape="box" />
      <FloatingShape position={[1, 4, -6]} color="#EC4899" speed={1.1} scale={0.7} shape="icosahedron" />
    </Canvas>
  );
}
