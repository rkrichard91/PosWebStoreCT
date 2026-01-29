
import { Database } from '@/types/database.types';

type Product = Database['public']['Tables']['products']['Row'];

export interface CompatibilityIssue {
    type: 'error' | 'warning';
    message: string;
    component: 'cpu' | 'motherboard' | 'ram' | 'gpu' | 'psu' | 'case' | 'storage' | 'unknown';
}

export function checkCompatibility(
    cpu: Product | null,
    mobo: Product | null,
    ram: Product | null,
    gpu: Product | null,
    psu: Product | null,
    // storage: Product | null, // Podría ser array en futuro
    // computerCase: Product | null // 'case' es palabra reservada
): CompatibilityIssue[] {
    const issues: CompatibilityIssue[] = [];

    // Safe parsing helper since specs is JSONB
    const getSpecs = (product: Product | null) => {
        return (product?.specs as any) || {};
    };

    const cpuSpecs = getSpecs(cpu);
    const moboSpecs = getSpecs(mobo);
    const ramSpecs = getSpecs(ram);
    const gpuSpecs = getSpecs(gpu);
    const psuSpecs = getSpecs(psu);

    // 1. REGLA: SOCKET (Crítica)
    if (cpu && mobo) {
        if (cpuSpecs.socket !== moboSpecs.socket) {
            issues.push({
                type: 'error',
                message: `Incompatible: El CPU es socket ${cpuSpecs.socket} y la placa es ${moboSpecs.socket}.`,
                component: 'motherboard'
            });
        }
    }

    // 2. REGLA: MEMORIA RAM (Crítica)
    if (mobo && ram) {
        // A veces 'ddr4' vs 'DDR4', normalizamos a minúsculas
        const moboRam = String(moboSpecs.memory_type || '').toLowerCase();
        const ramType = String(ramSpecs.type || '').toLowerCase();

        if (moboRam && ramType && moboRam !== ramType) {
            issues.push({
                type: 'error',
                message: `Incompatible: La placa requiere memoria ${moboSpecs.memory_type} pero seleccionaste ${ramSpecs.type}.`,
                component: 'ram'
            });
        }
    }

    // 3. REGLA: ENERGÍA (Advertencia)
    if (cpu && gpu && psu) {
        const cpuTdp = Number(cpuSpecs.tdp) || 65; // Default 65W
        const gpuTdp = Number(gpuSpecs.tdp) || 0;
        const totalTDP = cpuTdp + gpuTdp + 50; // +50W margen base (discos, fans, mobs)

        const psuWattage = Number(psuSpecs.watts) || 0;

        if (psuWattage > 0 && psuWattage < totalTDP) {
            issues.push({
                type: 'warning',
                message: `Riesgo: El consumo estimado es ${totalTDP}W, tu fuente de ${psuWattage}W es insuficiente o muy justa.`,
                component: 'psu'
            });
        }
    }

    return issues;
}
