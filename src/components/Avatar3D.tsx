import React, { useRef, useEffect, useState, Suspense } from 'react';
import { useGraph, useFrame } from '@react-three/fiber';
import { useGLTF, useAnimations, ContactShadows } from '@react-three/drei';
import * as THREE from 'three';

interface Avatar3DProps {
  step: number;
  position?: [number, number, number];
  scale?: number;
  rotation?: [number, number, number];
}

const REMOTE_URL = 'https://models.readyplayer.me/658da75c02796e6d7616640c.glb?useMesh=true&pose=A';

/**
 * Componente interno que tenta carregar o modelo GLTF.
 */
const AvatarModel: React.FC<Avatar3DProps & { url: string }> = ({ url, step, position, scale, rotation }) => {
  const group = useRef<THREE.Group>(null);
  const [currentAnim, setCurrentAnim] = useState<'Idle' | 'Talking' | 'Point'>('Idle');
  const { scene, animations } = useGLTF(url);
  const { nodes } = useGraph(scene);
  const { actions } = useAnimations(animations, group);

  useEffect(() => {
    if (!actions || Object.keys(actions).length === 0) return;
    const timers: ReturnType<typeof setTimeout>[] = [];
    setCurrentAnim('Point');
    timers.push(setTimeout(() => setCurrentAnim('Talking'), 1200));
    timers.push(setTimeout(() => setCurrentAnim('Idle'), 5200));
    return () => timers.forEach(t => clearTimeout(t));
  }, [step, actions]);

  useEffect(() => {
    if (!actions) return;
    const action = actions[currentAnim];
    if (action) {
      if (currentAnim === 'Point') {
        action.setLoop(THREE.LoopOnce, 1);
        action.clampWhenFinished = true;
      } else {
        action.setLoop(THREE.LoopRepeat, Infinity);
      }
      action.reset().fadeIn(0.5).play();
    }
  }, [currentAnim, actions]);

  useFrame((state) => {
    const head = nodes.Head || nodes.mixamorigHead || nodes.Neck;
    if (head && currentAnim !== 'Point') {
      const targetX = (state.mouse.x * Math.PI) / 6; 
      const targetY = (state.mouse.y * Math.PI) / 8;
      head.rotation.y = THREE.MathUtils.lerp(head.rotation.y, targetX, 0.1);
      head.rotation.x = THREE.MathUtils.lerp(head.rotation.x, -targetY, 0.1);
    }
  });

  return (
    <group ref={group} {...{position, scale, rotation}} dispose={null}>
      <primitive object={scene} />
    </group>
  );
};

/**
 * Placeholder Profissional (Humanóide Estilizado) 
 * Representa um assistente masculino de uniforme (Camisa Branca + Calça Escura)
 */
const AvatarPlaceholder: React.FC<Avatar3DProps> = ({ position, scale, rotation }) => {
  const group = useRef<THREE.Group>(null);

  // Pequena animação de respiração/flutuação para o placeholder
  useFrame((state) => {
    if (group.current) {
        group.current.position.y = position![1] + Math.sin(state.clock.elapsedTime) * 0.05;
    }
  });

  return (
    <group ref={group} {...{position, scale, rotation}}>
      {/* Pernas (Calça Jeans Escura) */}
      <mesh position={[-0.15, 0.4, 0]} castShadow>
        <capsuleGeometry args={[0.12, 0.6, 4, 12]} />
        <meshStandardMaterial color="#2c3e50" roughness={0.7} />
      </mesh>
      <mesh position={[0.15, 0.4, 0]} castShadow>
        <capsuleGeometry args={[0.12, 0.6, 4, 12]} />
        <meshStandardMaterial color="#2c3e50" roughness={0.7} />
      </mesh>
      
      {/* Tronco (Camisa Polo Branca Profissional) */}
      <mesh position={[0, 1.1, 0]} castShadow>
        <capsuleGeometry args={[0.25, 0.7, 4, 12]} />
        <meshStandardMaterial color="#ffffff" roughness={0.4} />
      </mesh>

      {/* Gola da Camisa */}
      <mesh position={[0, 1.45, 0]} rotation={[0.2, 0, 0]} castShadow>
        <torusGeometry args={[0.15, 0.05, 8, 24]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>
      
      {/* Cabeça */}
      <mesh position={[0, 1.7, 0]} castShadow>
        <sphereGeometry args={[0.22, 32, 32]} />
        <meshStandardMaterial color="#f5cba7" roughness={0.4} /> 
      </mesh>

      {/* Cabelo (Corte Masculino Profissional) */}
      <mesh position={[0, 1.8, 0.05]} castShadow>
        <sphereGeometry args={[0.23, 16, 16, 0, Math.PI * 2, 0, Math.PI / 1.8]} />
        <meshStandardMaterial color="#34495e" />
      </mesh>

      {/* Olhos/Viseira Tech (para dar um toque moderno) */}
      <mesh position={[0, 1.7, 0.18]} castShadow>
        <boxGeometry args={[0.25, 0.08, 0.08]} />
        <meshStandardMaterial color="#1a1a1a" emissive="#3498db" emissiveIntensity={1} />
      </mesh>
    </group>
  );
};

export const Avatar3D: React.FC<Avatar3DProps> = (props) => {
  const [loadError, setLoadError] = useState(false);

  return (
    <group>
      <ambientLight intensity={0.7} />
      <spotLight position={[5, 10, 5]} angle={0.2} penumbra={1} intensity={1.5} castShadow />
      <directionalLight position={[-5, 5, -5]} intensity={0.3} color="#ffffff" />
      <ContactShadows position={[0, 0, 0]} opacity={0.4} scale={6} blur={2} far={4} />

      {!loadError ? (
        <Suspense fallback={null}>
          <ErrorBoundary onError={() => setLoadError(true)}>
             <AvatarModel {...props} url={REMOTE_URL} />
          </ErrorBoundary>
        </Suspense>
      ) : (
        <AvatarPlaceholder {...props} />
      )}
    </group>
  );
};

class ErrorBoundary extends React.Component<{ children: React.ReactNode, onError: () => void }> {
  state = { hasError: false };
  static getDerivedStateFromError() { return { hasError: true }; }
  componentDidCatch() { this.props.onError(); }
  render() { return this.state.hasError ? null : this.props.children; }
}

try { useGLTF.preload(REMOTE_URL); } catch (e) {}
