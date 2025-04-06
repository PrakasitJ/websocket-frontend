import { useEffect, useState, useRef, useCallback } from "react";

interface MousePosition {
    x: number;
    y: number;
    id?: string;
    color?: string;
}

function throttle<T extends (...args: any[]) => any>(
    func: T,
    limit: number
): (...args: Parameters<T>) => void {
    let inThrottle: boolean;
    return function(this: any, ...args: Parameters<T>) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => (inThrottle = false), limit);
        }
    };
}

export default function Mouse() {
    const [mousePosition, setMousePosition] = useState<MousePosition>({ x: 0, y: 0 });
    const [otherMousePositions, setOtherMousePositions] = useState<MousePosition[]>([]);
    const wsRef = useRef<WebSocket | null>(null);
    const lastSentPosition = useRef<MousePosition>({ x: 0, y: 0 });
    const containerRef = useRef<HTMLDivElement>(null);

    const sendMousePosition = useCallback(
        throttle((position: MousePosition) => {
            if (wsRef.current?.readyState === WebSocket.OPEN) {
                const dx = position.x - lastSentPosition.current.x;
                const dy = position.y - lastSentPosition.current.y;
                if (Math.sqrt(dx * dx + dy * dy) > 5) {
                    wsRef.current.send(JSON.stringify({
                        type: 'mouse_position',
                        x: position.x,
                        y: position.y,
                    }));
                    lastSentPosition.current = position;
                }
            }
        }, 50),
        []
    );

    useEffect(() => {
        const ws = new WebSocket('ws://localhost:3000/ws');
        wsRef.current = ws;

        ws.onopen = () => {
            console.log('WebSocket Connected');
        };

        ws.onmessage = (event) => {
            const data = JSON.parse(event.data);
            if (data.type === 'mouse_position') {
                setOtherMousePositions(prev => {
                    const existingIndex = prev.findIndex(pos => pos.id === data.id);
                    if (existingIndex >= 0) {
                        const newPositions = [...prev];
                        newPositions[existingIndex] = {
                            ...newPositions[existingIndex],
                            x: data.x,
                            y: data.y
                        };
                        return newPositions;
                    }
                    return [...prev, data];
                });
            }
        };

        ws.onclose = () => {
            console.log('WebSocket Disconnected');
        };

        return () => {
            ws.close();
        };
    }, []);

    const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
        if (!containerRef.current) return;
        
        const rect = containerRef.current.getBoundingClientRect();
        const newPosition = {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top
        };
        
        setMousePosition(newPosition);
        sendMousePosition(newPosition);
    }, [sendMousePosition]);

    return (
        <div
            ref={containerRef}
            onMouseMove={handleMouseMove}
            style={{
                width: '100vw',
                height: '100vh',
                position: 'relative',
                background: 'linear-gradient(45deg, #1a1a1a, #2a2a2a)',
                overflow: 'hidden',
                willChange: 'transform',
            }}
        >
            <div
                style={{
                    position: 'absolute',
                    top: `${mousePosition.y}px`,
                    left: `${mousePosition.x}px`,
                    width: '20px',
                    height: '20px',
                    backgroundColor: '#ff4444',
                    borderRadius: '50%',
                    pointerEvents: 'none',
                    transform: 'translate(-50%, -50%)',
                    boxShadow: '0 0 10px rgba(255, 68, 68, 0.5)',
                    willChange: 'transform',
                    transition: 'transform 0.1s ease-out',
                }}
            />

            {otherMousePositions.map((position) => (
                <div
                    key={position.id}
                    style={{
                        position: 'absolute',
                        top: `${position.y}px`,
                        left: `${position.x}px`,
                        width: '20px',
                        height: '20px',
                        backgroundColor: position.color || '#4444ff',
                        borderRadius: '50%',
                        pointerEvents: 'none',
                        transform: 'translate(-50%, -50%)',
                        boxShadow: '0 0 10px rgba(68, 68, 255, 0.5)',
                        willChange: 'transform',
                        transition: 'transform 0.1s ease-out',
                    }}
                />
            ))}
        </div>
    );
}
