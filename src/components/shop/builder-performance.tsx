"use client";

import { useBuilderStore } from "@/store/builder-store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Gauge, MonitorPlay, Briefcase, Info } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Database } from "@/types/database.types";

type Product = Database['public']['Tables']['products']['Row'];

export function BuilderPerformance() {
    const { selection } = useBuilderStore();
    const { cpu, gpu, ram } = selection;

    // Helper to extract numeric specs safely
    const getSpec = (product: Product | null, key: string): number => {
        if (!product || !product.specs) return 0;
        const specs = product.specs as Record<string, unknown>;
        return Number(specs[key]) || 0;
    };

    // --- Heuristic Scoring Logic ---
    // returns 0-100 score
    const calculateScore = () => {
        let score = 0;
        if (!cpu && !gpu) return 0;

        // CPU Contribution (approx 40% weight if no GPU, 20% if GPU)
        const cpuCores = getSpec(cpu, 'cores');
        // Simple heuristic: 4 cores = baseline, 16+ = max
        const cpuScore = Math.min(cpuCores * 5, 40) + (getSpec(cpu, 'base_clock') * 2);

        // RAM Contribution (10%)
        const ramSize = getSpec(ram, 'capacity_gb'); // Asuming 'capacity_gb' exists in specs or name parsing needed
        // Fallback: try to parse from name if specs empty
        let ramGb = ramSize;
        if (ramGb === 0 && ram?.name) {
            const match = ram.name.match(/(\d+)\s*GB/i);
            if (match) ramGb = parseInt(match[1]);
        }
        const ramScore = Math.min(ramGb, 64) / 64 * 100;

        // GPU Contribution (70% weight for gaming)
        // This is very rough without a DB. We'll use VRAM as a very weak proxy + name indicators
        let gpuScore = 0;
        if (gpu) {
            const vram = getSpec(gpu, 'memory_size') || 0;
            // Regex detection for tiers
            const name = gpu.name.toUpperCase();
            if (name.includes("4090") || name.includes("7900 XTX")) gpuScore = 100;
            else if (name.includes("4080") || name.includes("4070") || name.includes("7900")) gpuScore = 85;
            else if (name.includes("4060") || name.includes("3060") || name.includes("7600")) gpuScore = 60;
            else if (name.includes("3050") || name.includes("6600")) gpuScore = 40;
            else if (name.includes("1660") || name.includes("1650")) gpuScore = 25;
            else gpuScore = Math.min(vram * 5, 20); // Fallback for low end
        } else if (cpu?.name.includes("G")) {
            // APU
            gpuScore = 15;
        }

        // Weighted Total for Gaming
        score = (cpuScore * 0.2) + (gpuScore * 0.7) + (ramScore * 0.1);
        return Math.min(Math.round(score), 100);
    };

    const score = calculateScore();

    // --- Estimations ---
    const getEstimations = (score: number) => {
        if (score === 0) return { gaming: null, work: null };

        // Gaming FPS Estimations (1080p High)
        // These are completely made up heuristics for display
        const gaming = {
            competitive: Math.round(score * 4.5), // Valorant, CS2
            battleRoyale: Math.round(score * 2.2), // Warzone, Fortnite
            aaa: Math.round(score * 1.2), // Cyberpunk, Starfield
        };

        // Work Suitability (1-10)
        // Boost CPU heavy tasks
        const cpuCores = getSpec(cpu, 'cores') || 4;
        const cpuBonus = cpuCores > 8 ? 2 : 0;

        // RAM bottle necks
        let ramGb = getSpec(ram, 'capacity_gb');
        if (ramGb === 0 && ram?.name) {
            const match = ram.name.match(/(\d+)\s*GB/i);
            if (match) ramGb = parseInt(match[1]);
        }
        const ramBonus = ramGb >= 32 ? 2 : (ramGb < 16 ? -2 : 0);

        const work = {
            office: Math.min(10, 5 + (score / 10)),
            coding: Math.min(10, 3 + (score / 15) + (ramGb >= 16 ? 2 : 0) + (cpuCores >= 6 ? 2 : 0)),
            editing: Math.min(10, 1 + (score / 12) + ramBonus + (gpu ? 2 : 0)),
            rendering: Math.min(10, 1 + (score / 10) + cpuBonus + (gpu ? 1 : 0)),
        };

        return { gaming, work };
    };

    const { gaming, work } = getEstimations(score);

    if (!gaming || !work) return null;

    return (
        <Card className="mt-6 border-primary/20 bg-card/50">
            <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                    <Gauge className="h-5 w-5 text-primary" />
                    Rendimiento Estimado
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">

                {/* Score Summary */}
                <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                        <span>Puntaje General</span>
                        <span className="font-bold">{score}/100</span>
                    </div>
                    <Progress value={score} className="h-2" />
                    <p className="text-xs text-muted-foreground pt-1">
                        {score < 30 ? "Básico / Oficina" :
                            score < 60 ? "Gaming Entrada / Media" :
                                score < 85 ? "Gaming Alta / Streaming" : "Enthusiast / Ultra"}
                    </p>
                </div>

                {/* Gaming Performance */}
                {gpu && (
                    <div className="space-y-3">
                        <div className="flex items-center gap-2 text-sm font-semibold border-b pb-1">
                            <MonitorPlay className="h-4 w-4" />
                            Gaming (1080p Est.)
                        </div>
                        <div className="grid grid-cols-1 gap-2 text-sm">
                            <div className="flex justify-between items-center group relative cursor-help">
                                <span>Competitivo (Valorant/CS2)</span>
                                <span className={gaming.competitive > 144 ? "text-green-500 font-bold" : "text-foreground"}>
                                    {gaming.competitive}+ FPS
                                </span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span>Battle Royale (Warzone)</span>
                                <span className={gaming.battleRoyale > 60 ? "text-primary font-bold" : ""}>
                                    {gaming.battleRoyale}+ FPS
                                </span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span>AAA (Cyberpunk 2077)</span>
                                <span className={gaming.aaa > 60 ? "text-primary" : "text-muted-foreground"}>
                                    {gaming.aaa}+ FPS
                                </span>
                            </div>
                        </div>
                    </div>
                )}

                {/* Work Performance */}
                <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm font-semibold border-b pb-1">
                        <Briefcase className="h-4 w-4" />
                        Productividad
                    </div>
                    <div className="space-y-2 text-sm">
                        <WorkRow label="Oficina / Estudiante" score={work.office} />
                        <WorkRow label="Programación" score={work.coding} />
                        <WorkRow label="Edición de Video" score={work.editing} />
                        <WorkRow label="Renderizado 3D" score={work.rendering} />
                    </div>
                </div>

                <div className="text-[10px] text-muted-foreground flex items-start gap-1 p-2 bg-muted/50 rounded">
                    <Info className="h-3 w-3 mt-0.5 flex-shrink-0" />
                    <span>Estimaciones basadas en hardware seleccionado. El rendimiento real puede variar según configuración y drivers.</span>
                </div>

            </CardContent>
        </Card>
    );
}

function WorkRow({ label, score }: { label: string, score: number }) {
    // 1-10
    return (
        <div className="flex items-center justify-between gap-4">
            <span className="truncate">{label}</span>
            <div className="flex gap-0.5">
                {[...Array(5)].map((_, i) => (
                    <div
                        key={i}
                        className={`h-2 w-4 rounded-sm ${i < (score / 2) ? "bg-primary" : "bg-muted"}`}
                    />
                ))}
            </div>
        </div>
    );
}
