"use client";

import Image from 'next/image';
import { Product } from '@/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ShoppingCart, PackageOpen, Check, X } from 'lucide-react';
import { useCartStore } from '@/store/cart-store';
import { formatCurrency } from '@/lib/utils';
import { toast } from 'sonner';

const CATEGORY_DISPLAY: Record<string, string> = {
    'laptop': 'Laptops & Notebooks',
    'cpu': 'Procesadores',
    'motherboard': 'Placas Madre',
    'ram': 'Memorias RAM',
    'gpu': 'Tarjetas de Video',
    'storage': 'Almacenamiento (SSD/HDD)',
    'psu': 'Fuentes de Poder',
    'case': 'Gabinetes',
    'cooling': 'Refrigeración & Fans',
    'monitor': 'Monitores',
    'peripheral': 'Periféricos & Accesorios',
    'service': 'Servicios',
};

// Spec labels for display by category
const SPEC_LABELS: Record<string, Record<string, string>> = {
    cpu: {
        socket: 'Socket',
        tdp: 'TDP (Watts)',
        cores: 'Núcleos',
        frequency: 'Frecuencia Base (GHz)',
    },
    motherboard: {
        socket: 'Socket',
        memory_type: 'Tipo de Memoria',
        form_factor: 'Formato',
        max_memory: 'Memoria Máxima (GB)',
        slots_ram: 'Slots RAM',
    },
    ram: {
        type: 'Tecnología',
        capacity: 'Capacidad Total (GB)',
        speed: 'Velocidad (MHz)',
        modules: 'Cantidad de Módulos',
        format: 'Formato',
    },
    gpu: {
        vram: 'VRAM (GB)',
        tdp: 'TDP / Consumo (Watts)',
        length_mm: 'Largo (mm)',
        recommended_psu: 'Fuente Recomendada (W)',
    },
    psu: {
        watts: 'Potencia (Watts)',
        certification: 'Certificación 80+',
        modular: 'Modularidad',
    },
    cooling: {
        type: 'Tipo',
        fan_size: 'Tamaño Ventilador (mm)',
        socket_support: 'Soportes',
    },
    case: {
        max_gpu_length_mm: 'Largo Máx GPU (mm)',
        form_factor_support: 'Soporte Placa Madre',
        included_fans: 'Ventiladores Incluidos',
    },
    storage: {
        type: 'Tipo',
        interface: 'Interfaz',
        capacity_gb: 'Capacidad (GB)',
        read_speed: 'Velocidad Lectura (MB/s)',
    },
    monitor: {
        size: 'Tamaño (Pulgadas)',
        refresh_rate: 'Tasa de Refresco (Hz)',
        resolution: 'Resolución',
        panel: 'Tipo de Panel',
    },
    laptop: {
        processor: 'Procesador',
        ram_size: 'RAM (GB)',
        storage_size: 'Almacenamiento',
        screen_size: 'Pantalla',
        gpu_model: 'GPU',
    },
};

// Value formatters for spec values
const SPEC_VALUE_DISPLAY: Record<string, Record<string, string>> = {
    memory_type: { ddr4: 'DDR4', ddr5: 'DDR5' },
    form_factor: { atx: 'ATX', matx: 'Micro-ATX', itx: 'Mini-ITX' },
    format: { dimm: 'DIMM (Escritorio)', sodimm: 'SO-DIMM (Laptop)' },
    type: { air: 'Aire', aio: 'Líquida (AIO)', fan: 'Ventilador Caja', ssd: 'SSD', hdd: 'HDD Mecánico', ddr4: 'DDR4', ddr5: 'DDR5' },
    interface: { sata: 'SATA', nvme: 'NVMe M.2' },
    certification: { none: 'Sin Certificación', white: '80+ White', bronze: '80+ Bronze', gold: '80+ Gold', platinum: '80+ Platinum' },
    modular: { no: 'No Modular', semi: 'Semi Modular', full: 'Full Modular' },
    form_factor_support: { atx: 'Hasta ATX', matx: 'Hasta Micro-ATX', eatx: 'Hasta E-ATX' },
    panel: { ips: 'IPS', va: 'VA', tn: 'TN', oled: 'OLED' },
};

function formatSpecValue(key: string, value: unknown): string {
    if (value === null || value === undefined || value === '') return '-';
    const strValue = String(value);
    if (SPEC_VALUE_DISPLAY[key] && SPEC_VALUE_DISPLAY[key][strValue]) {
        return SPEC_VALUE_DISPLAY[key][strValue];
    }
    return strValue;
}

interface ProductDetailModalProps {
    product: Product | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function ProductDetailModal({ product, open, onOpenChange }: ProductDetailModalProps) {
    const addItem = useCartStore(state => state.addItem);

    if (!product) return null;

    const handleAddToCart = () => {
        addItem(product);
        toast.success("Producto agregado al carrito");
        onOpenChange(false);
    };

    // Get specs for display based on category
    const getDisplaySpecs = () => {
        if (!product.specs) return [];

        // Handle specs as string (JSON) or object
        let specs: Record<string, unknown> = {};
        if (typeof product.specs === 'string' && product.specs.trim() !== '') {
            try {
                specs = JSON.parse(product.specs);
            } catch (e) {
                console.warn("Could not parse specs as JSON", e);
                return [];
            }
        } else if (typeof product.specs === 'object' && product.specs !== null) {
            specs = product.specs as Record<string, unknown>;
        } else {
            return [];
        }

        const categorySpecs = SPEC_LABELS[product.category] || {};

        return Object.entries(categorySpecs)
            .filter(([key]) => specs[key] !== undefined && specs[key] !== null && specs[key] !== '')
            .map(([key, label]) => ({
                label,
                value: formatSpecValue(key, specs[key]),
            }));
    };

    const displaySpecs = getDisplaySpecs();
    const isInStock = product.stock_physical > 0;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="sr-only">{product.name}</DialogTitle>
                </DialogHeader>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Image */}
                    <div className="aspect-square bg-muted rounded-lg overflow-hidden relative">
                        {product.image_url ? (
                            <Image
                                src={product.image_url}
                                alt={product.name}
                                fill
                                className="object-cover"
                                sizes="(max-width: 768px) 100vw, 300px"
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-muted-foreground/30">
                                <PackageOpen className="h-16 w-16" />
                            </div>
                        )}

                        {!isInStock && (
                            <div className="absolute inset-0 bg-background/60 backdrop-blur-[2px] flex items-center justify-center">
                                <Badge variant="destructive" className="text-sm px-3 py-1">
                                    Agotado
                                </Badge>
                            </div>
                        )}
                    </div>

                    {/* Info */}
                    <div className="space-y-4">
                        {/* Category */}
                        <Badge variant="secondary" className="text-xs">
                            {CATEGORY_DISPLAY[product.category] || product.category}
                        </Badge>

                        {/* Name */}
                        <h2 className="text-2xl font-bold tracking-tight">
                            {product.name}
                        </h2>

                        {/* SKU */}
                        <p className="text-sm text-muted-foreground">
                            SKU: <span className="font-mono">{product.sku}</span>
                        </p>

                        {/* Price */}
                        <div className="py-3 border-y">
                            <p className="text-3xl font-extrabold text-primary">
                                {formatCurrency(product.price_public)}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                                IVA incluido
                            </p>
                        </div>

                        {/* Stock Status */}
                        <div className="flex items-center gap-2">
                            {isInStock ? (
                                <>
                                    <Check className="h-4 w-4 text-green-500" />
                                    <span className="text-green-600 text-sm font-medium">
                                        En Stock ({product.stock_physical} {product.stock_physical === 1 ? 'unidad' : 'unidades'})
                                    </span>
                                </>
                            ) : (
                                <>
                                    <X className="h-4 w-4 text-red-500" />
                                    <span className="text-red-500 text-sm font-medium">Sin Stock</span>
                                </>
                            )}
                        </div>

                        {/* Add to Cart Button */}
                        <Button
                            className="w-full"
                            onClick={handleAddToCart}
                            disabled={!isInStock}
                        >
                            <ShoppingCart className="mr-2 h-4 w-4" />
                            Agregar al Carrito
                        </Button>
                    </div>
                </div>

                {/* Description */}
                {product.description && (
                    <div className="mt-6 pt-4 border-t">
                        <h3 className="font-semibold mb-2">Descripción</h3>
                        <p className="text-sm text-muted-foreground whitespace-pre-line">
                            {product.description}
                        </p>
                    </div>
                )}

                {/* Specifications */}
                {displaySpecs.length > 0 && (
                    <div className="mt-4 pt-4 border-t">
                        <h3 className="font-semibold mb-3">Especificaciones Técnicas</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {displaySpecs.map((spec, index) => (
                                <div
                                    key={index}
                                    className="flex justify-between items-center py-2 px-3 bg-muted/30 rounded-md text-sm"
                                >
                                    <span className="text-muted-foreground">{spec.label}</span>
                                    <span className="font-medium">{spec.value}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}
