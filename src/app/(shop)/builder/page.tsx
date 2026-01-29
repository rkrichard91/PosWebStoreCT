"use client";

import { useBuilderStore } from "@/store/builder-store";
import { BuilderSummary } from "@/components/shop/builder-summary";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Cpu, CircuitBoard, MemoryStick, HardDrive, Zap, Box, Monitor, Mouse, Plus, X, RotateCcw } from "lucide-react";
import Image from "next/image";
import { Database } from "@/types/database.types";
import { formatCurrency } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { ProductSelector } from "@/components/shop/product-selector";

type Category = Database['public']['Tables']['products']['Row']['category'];

const CATEGORIES: { id: Category; label: string; icon: any }[] = [
    { id: 'cpu', label: 'Procesador', icon: Cpu },
    { id: 'motherboard', label: 'Placa Madre', icon: CircuitBoard },
    { id: 'ram', label: 'Memoria RAM', icon: MemoryStick },
    { id: 'gpu', label: 'Tarjeta de Video', icon: CircuitBoard }, // Reusing icon for now
    { id: 'storage', label: 'Almacenamiento', icon: HardDrive },
    { id: 'psu', label: 'Fuente de Poder', icon: Zap },
    { id: 'case', label: 'Gabinete', icon: Box },
    { id: 'monitor', label: 'Monitor', icon: Monitor },
    { id: 'peripheral', label: 'Periféricos', icon: Mouse },
];

export default function BuilderPage() {
    const { selection, removeComponent, resetBuilder } = useBuilderStore();

    return (
        <div className="container mx-auto py-8">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Arma tu PC</h1>
                    <p className="text-muted-foreground">Selecciona tus componentes y verificaremos la compatibilidad automáticamente.</p>
                </div>
                <Button variant="outline" onClick={resetBuilder} size="sm">
                    <RotateCcw className="mr-2 h-4 w-4" />
                    Reiniciar
                </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Component Selection */}
                <div className="lg:col-span-2 space-y-4">
                    {CATEGORIES.map((cat) => {
                        const selectedProduct = selection[cat.id as keyof typeof selection];
                        const Icon = cat.icon;

                        return (
                            <Card key={cat.id} className={cn("transition-all duration-200", selectedProduct ? "border-primary/50" : "border-border")}>
                                <CardContent className="p-4 flex items-center gap-4">
                                    {/* Icon or Image */}
                                    <div className="h-16 w-16 bg-muted rounded-md flex items-center justify-center flex-shrink-0 overflow-hidden relative">
                                        {selectedProduct?.image_url ? (
                                            <div className="relative h-full w-full">
                                                <Image
                                                    src={selectedProduct.image_url}
                                                    alt={selectedProduct.name}
                                                    fill
                                                    className="object-cover"
                                                />
                                            </div>
                                        ) : (
                                            <Icon className="h-8 w-8 text-muted-foreground/50" />
                                        )}
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h3 className="font-semibold text-lg">{cat.label}</h3>
                                                {selectedProduct ? (
                                                    <p className="text-sm font-medium text-foreground">{selectedProduct.name}</p>
                                                ) : (
                                                    <p className="text-sm text-muted-foreground">Aún no seleccionado</p>
                                                )}
                                            </div>
                                            {selectedProduct && (
                                                <div className="text-right">
                                                    <span className="font-bold text-primary">{formatCurrency(selectedProduct.price_public)}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div>
                                        {selectedProduct ? (
                                            <div className="flex gap-2">
                                                <ProductSelector
                                                    category={cat.id}
                                                    categoryLabel={cat.label}
                                                    onSelect={(p) => useBuilderStore.getState().setComponent(cat.id, p)}
                                                    currentSelection={selectedProduct}
                                                />
                                                <Button variant="ghost" size="icon" onClick={() => removeComponent(cat.id)} className="text-muted-foreground hover:text-destructive">
                                                    <X className="h-5 w-5" />
                                                </Button>
                                            </div>
                                        ) : (
                                            <ProductSelector
                                                category={cat.id}
                                                categoryLabel={cat.label}
                                                onSelect={(p) => useBuilderStore.getState().setComponent(cat.id, p)}
                                                currentSelection={null}
                                            />
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>

                {/* Right Column: Summary & Status */}
                <div className="lg:col-span-1">
                    <div className="sticky top-24">
                        <BuilderSummary />
                    </div>
                </div>
            </div>
        </div>
    );
}
