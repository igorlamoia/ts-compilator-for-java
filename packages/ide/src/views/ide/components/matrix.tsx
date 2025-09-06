"use client";
import React, { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Stars } from "@react-three/drei";
import * as THREE from "three";
import { TIntermediateCodeData } from "@/pages/api/intermediator";

import { Text } from "@react-three/drei";

function DNABase({
  pos,
  text,
  color,
}: {
  pos: [number, number, number];
  text: string | number | boolean;
  color: string;
}) {
  return (
    <group position={pos}>
      {/* Esfera representando um operando */}
      <mesh>
        <sphereGeometry args={[0.2, 16, 16]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.5}
        />
      </mesh>

      {/* Texto 3D ao lado */}
      <Text
        position={[0.5, 0, 0]} // desloca o texto pra não ficar dentro da esfera
        fontSize={0.25}
        color="#ffffff"
        anchorX="left"
        anchorY="middle"
        outlineWidth={0.02}
        outlineColor="black"
      >
        {text}
      </Text>
    </group>
  );
}

function DNAHelix({
  instructions,
}: {
  instructions: TIntermediateCodeData["instructions"];
}) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = clock.getElapsedTime() * 0.2; // rotação lenta da hélice
    }
  });

  return (
    <group ref={groupRef}>
      {instructions.map((inst, i) => {
        const angle = i * 0.6; // espaçamento helicoidal
        const y = i * -0.6; // altura
        const x1 = Math.cos(angle) * 2;
        const z1 = Math.sin(angle) * 2;
        const x2 = Math.cos(angle + Math.PI) * 2;
        const z2 = Math.sin(angle + Math.PI) * 2;

        return (
          <group key={i}>
            {/* operand1 */}
            <DNABase
              pos={[x1, y, z1]}
              text={inst.operand1 ?? "N/A"}
              color="#00fff7"
            />
            {/* operand2 */}
            <DNABase
              pos={[x2, y, z2]}
              text={inst.operand2 ?? "N/A"}
              color="#ff00aa"
            />

            {/* linha ligando operandos (base do DNA) */}
            <line>
              <bufferGeometry
                attach="geometry"
                setFromPoints={[
                  new THREE.Vector3(x1, y, z1),
                  new THREE.Vector3(x2, y, z2),
                ]}
              />
              <lineBasicMaterial color="#ffffff" />
            </line>
          </group>
        );
      })}
    </group>
  );
}

export default function InstructionsDNA({
  instructions,
}: {
  instructions: TIntermediateCodeData["instructions"];
}) {
  return (
    <div className="w-full h-[600px] bg-black rounded-lg overflow-hidden">
      <Canvas camera={{ position: [0, 0, 10], fov: 60 }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1.2} />
        <OrbitControls />
        <Stars radius={100} depth={50} count={4000} factor={4} fade />

        <DNAHelix instructions={instructions} />
      </Canvas>
    </div>
  );
}
