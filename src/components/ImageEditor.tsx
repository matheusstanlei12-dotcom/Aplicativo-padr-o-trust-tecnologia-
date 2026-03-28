import React, { useRef, useEffect, useState } from 'react';
import { X, Check, RotateCcw, Pencil } from 'lucide-react';

interface ImageEditorProps {
    src: string;
    onSave: (editedSrc: string) => void;
    onCancel: () => void;
}

export const ImageEditor: React.FC<ImageEditorProps> = ({ src, onSave, onCancel }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [ctx, setCtx] = useState<CanvasRenderingContext2Array | null>(null);
    const [imageLoaded, setImageLoaded] = useState(false);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const context = canvas.getContext('2d');
        if (!context) return;

        // Configuração inicial do pincel
        context.strokeStyle = '#ff0000'; // Vermelho para destaque
        context.lineWidth = 4;
        context.lineCap = 'round';
        context.lineJoin = 'round';
        
        setCtx(context as any);

        const img = new Image();
        img.src = src;
        img.onload = () => {
            // Ajustar o canvas para o tamanho da imagem mantendo proporção
            const maxWidth = window.innerWidth * 0.95;
            const maxHeight = window.innerHeight * 0.7;
            
            let width = img.width;
            let height = img.height;

            if (width > maxWidth) {
                height *= maxWidth / width;
                width = maxWidth;
            }
            if (height > maxHeight) {
                width *= maxHeight / height;
                height = maxHeight;
            }

            canvas.width = width;
            canvas.height = height;

            context.drawImage(img, 0, 0, width, height);
            
            // Re-aplicar estilos após redimensionar canvas
            context.strokeStyle = '#ff0000';
            context.lineWidth = 4;
            context.lineCap = 'round';
            context.lineJoin = 'round';
            
            setImageLoaded(true);
        };
    }, [src]);

    const getPos = (e: React.MouseEvent | React.TouchEvent) => {
        const canvas = canvasRef.current;
        if (!canvas) return { x: 0, y: 0 };

        const rect = canvas.getBoundingClientRect();
        const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
        const clientY = 'touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;

        return {
            x: clientX - rect.left,
            y: clientY - rect.top
        };
    };

    const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
        if (!ctx) return;
        setIsDrawing(true);
        const pos = getPos(e);
        ctx.beginPath();
        ctx.moveTo(pos.x, pos.y);
    };

    const draw = (e: React.MouseEvent | React.TouchEvent) => {
        if (!isDrawing || !ctx) return;
        e.preventDefault(); // Prevenir scroll no touch
        const pos = getPos(e);
        ctx.lineTo(pos.x, pos.y);
        ctx.stroke();
    };

    const stopDrawing = () => {
        if (!isDrawing || !ctx) return;
        ctx.closePath();
        setIsDrawing(false);
    };

    const handleClear = () => {
        const canvas = canvasRef.current;
        if (!canvas || !ctx) return;
        
        const img = new Image();
        img.src = src;
        img.onload = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            // Re-garantir estilos
            ctx.strokeStyle = '#ff0000';
            ctx.lineWidth = 4;
        };
    };

    const handleSave = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        onSave(canvas.toDataURL('image/jpeg', 0.8));
    };

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(0,0,0,0.95)',
            zIndex: 9999,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px'
        }} ref={containerRef}>
            
            <div style={{
                width: '100%',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '20px',
                color: 'white'
            }}>
                <button 
                    onClick={onCancel}
                    style={{ background: 'none', border: 'none', color: 'white', display: 'flex', alignItems: 'center', gap: '5px' }}
                >
                    <X size={24} /> Cancelar
                </button>
                
                <div style={{ display: 'flex', gap: '15px' }}>
                    <button 
                        onClick={handleClear}
                        style={{ background: '#4a5568', border: 'none', padding: '8px 15px', borderRadius: '6px', color: 'white', display: 'flex', alignItems: 'center', gap: '5px' }}
                    >
                        <RotateCcw size={18} /> Limpar
                    </button>
                    <button 
                        onClick={handleSave}
                        style={{ background: '#2f855a', border: 'none', padding: '8px 15px', borderRadius: '6px', color: 'white', display: 'flex', alignItems: 'center', gap: '5px' }}
                    >
                        <Check size={18} /> Salvar Edição
                    </button>
                </div>
            </div>

            <div style={{ 
                position: 'relative', 
                backgroundColor: '#000', 
                borderRadius: '8px', 
                overflow: 'hidden',
                boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
            }}>
                {!imageLoaded && (
                    <div style={{ color: 'white', padding: '20px' }}>Carregando editor...</div>
                )}
                <canvas
                    ref={canvasRef}
                    onMouseDown={startDrawing}
                    onMouseMove={draw}
                    onMouseUp={stopDrawing}
                    onMouseLeave={stopDrawing}
                    onTouchStart={startDrawing}
                    onTouchMove={draw}
                    onTouchEnd={stopDrawing}
                    style={{ 
                        cursor: 'crosshair',
                        touchAction: 'none', // Importante para mobile
                        display: imageLoaded ? 'block' : 'none'
                    }}
                />
            </div>

            <div style={{ marginTop: '20px', color: '#cbd5e0', fontSize: '14px', textAlign: 'center' }}>
                <p style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                    <Pencil size={16} /> Arraste na imagem para destacar pontos específicos
                </p>
            </div>
        </div>
    );
};
