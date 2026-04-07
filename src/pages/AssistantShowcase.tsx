import React, { useState, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Environment } from '@react-three/drei';
import { Avatar3D } from '../components/Avatar3D';

export const AssistantShowcase: React.FC = () => {
  const [step, setStep] = useState(1);

  const steps = [
    { id: 1, title: 'Bem-vindo', description: 'Olá! Sou seu assistente técnico. Vamos iniciar a inspeção?' },
    { id: 2, title: 'Recebimento', description: 'Primeiro, vamos registrar a chegada do equipamento.' },
    { id: 3, title: 'Desmontagem', description: 'Agora, acompanhe o processo de abertura e limpeza.' },
    { id: 4, title: 'Análise Técnica', description: 'Identificamos os componentes que precisam de reparo.' },
    { id: 5, title: 'Orçamento', description: 'O orçamento está pronto para sua revisão.' },
    { id: 6, title: 'Execução', description: 'Iniciamos os reparos conforme planejado.' },
    { id: 7, title: 'Testes Finais', description: 'Garantindo que tudo está dentro dos padrões Trust.' },
    { id: 8, title: 'Finalização', description: 'Equipamento pronto para entrega. Obrigado!' },
  ];

  const handleNext = () => {
    setStep((prev) => (prev < 8 ? prev + 1 : 1));
  };

  const handlePrev = () => {
    setStep((prev) => (prev > 1 ? prev - 1 : 8));
  };

  return (
    <div style={{ 
      width: '100vw', 
      height: '100vh', 
      background: 'radial-gradient(circle, #f8f9fa 0%, #e9ecef 100%)',
      display: 'flex',
      flexDirection: 'column',
      fontFamily: 'Inter, sans-serif'
    }}>
      {/* Header Estilizado */}
      <div style={{ padding: '40px', position: 'absolute', top: 0, left: 0, zIndex: 10 }}>
        <h1 style={{ margin: 0, fontSize: '2.5rem', fontWeight: 800, color: '#1a1a1a' }}>
          Onboarding <span style={{ color: '#3498db' }}>3D</span>
        </h1>
        <p style={{ color: '#666', marginTop: '10px' }}>Assistente Virtual Automático</p>
      </div>

      {/* Canvas 3D */}
      <div style={{ flex: 1, cursor: 'grab' }}>
        <Canvas shadows>
          <PerspectiveCamera makeDefault position={[0, 0, 5]} fov={45} />
          
          {/* Ambiente e Luzes (O Avatar3D já tem algumas, mas aqui reforçamos o cenário) */}
          <Environment preset="city" />
          <OrbitControls 
            enablePan={false} 
            minPolarAngle={Math.PI / 3} 
            maxPolarAngle={Math.PI / 2} 
            minDistance={3}
            maxDistance={8}
          />

          <Suspense fallback={null}>
            <Avatar3D 
              step={step} 
              position={[0, -1.8, 0]} 
              scale={1.5}
            />
          </Suspense>
        </Canvas>
      </div>

      {/* Interface de Controle (Estilo Card Moderno) */}
      <div style={{ 
        position: 'absolute', 
        bottom: '40px', 
        left: '50%', 
        transform: 'translateX(-50%)',
        width: '90%',
        maxWidth: '500px',
        background: 'rgba(255, 255, 255, 0.9)',
        backdropFilter: 'blur(10px)',
        padding: '30px',
        borderRadius: '24px',
        boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
        zIndex: 20,
        textAlign: 'center'
      }}>
        <div style={{ marginBottom: '20px' }}>
          <span style={{ 
            background: '#3498db', 
            color: '#white', 
            padding: '4px 12px', 
            borderRadius: '12px', 
            fontSize: '0.8rem',
            fontWeight: 'bold' 
          }}>
            ETAPA {step} DE 8
          </span>
          <h2 style={{ marginTop: '15px', color: '#333' }}>{steps[step - 1].title}</h2>
          <p style={{ color: '#666', lineHeight: '1.6' }}>{steps[step - 1].description}</p>
        </div>

        <div style={{ display: 'flex', gap: '15px', justifyContent: 'center' }}>
          <button 
            onClick={handlePrev}
            style={{
              padding: '12px 24px',
              borderRadius: '12px',
              border: '1px solid #ddd',
              background: 'white',
              cursor: 'pointer',
              fontWeight: 'bold',
              transition: 'all 0.2s'
            }}
          >
            Anterior
          </button>
          <button 
            onClick={handleNext}
            style={{
              padding: '12px 40px',
              borderRadius: '12px',
              border: 'none',
              background: '#3498db',
              color: 'white',
              cursor: 'pointer',
              fontWeight: 'bold',
              boxShadow: '0 4px 12px rgba(52, 152, 219, 0.3)',
              transition: 'all 0.2s'
            }}
          >
            Próxima Etapa
          </button>
        </div>
      </div>
    </div>
  );
};
