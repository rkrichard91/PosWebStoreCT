
import { useEffect, useState } from 'react';

export function useBarcodeScanner(onScan: (code: string) => void) {
    const [buffer, setBuffer] = useState('');

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Ignorar si el usuario está escribiendo en un input normal
            const target = e.target as HTMLElement;
            if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') return;

            if (e.key === 'Enter') {
                if (buffer.length > 2) { // Mínimo de caracteres para considerar un código válido
                    // Enviamos el código escaneado
                    onScan(buffer);
                    // Limpiamos buffer
                    setBuffer('');
                }
            } else if (e.key.length === 1) {
                // Acumulamos caracteres imprimibles
                setBuffer((prev) => prev + e.key);
            }

            // Opcional: Timeout para limpiar buffer si no es un scanner rápido (typing humano)
            // Los scanners suelen mandar caracteres con < 50ms de diferencia.
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [buffer, onScan]);
}
