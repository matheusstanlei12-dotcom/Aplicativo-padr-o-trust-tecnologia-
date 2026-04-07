import React, { useRef, useEffect, useState, Suspense } from 'react';
import { useGraph, useFrame } from '@react-three/fiber';
import { useGLTF, useAnimations, ContactShadows, Image as DreiImage } from '@react-three/drei';
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
 * Placeholder Profissional usando imagem local caso o 3D falhe.
 * Agora usa o asset de alta qualidade public/avatar.png em um billboard.
 */
const AvatarPlaceholder: React.FC<Avatar3DProps> = ({ position, scale, rotation }) => {
  const group = useRef<THREE.Group>(null);

  // Mantém uma animação sutil de flutuação para o billboard
  useFrame((state) => {
    if (group.current) {
        group.current.position.y = position![1] + Math.sin(state.clock.elapsedTime) * 0.05;
    }
  });

  return (
    <group ref={group} {...{position, rotation}} scale={scale ? scale * 1.8 : 1.8}>
      <DreiImage 
        url="/avatar.png" 
        transparent 
        side={THREE.DoubleSide} 
        position={[0, 1, 0]}
      />
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
