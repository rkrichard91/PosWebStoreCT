"use client";

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Product } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ShoppingCart, ArrowLeft, PackageOpen, Check, X } from 'lucide-react';
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

// Spec labels for display
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
};

// Value formatters for specs
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

export default function ProductDetailPage() {
    const params = useParams();
    const slug = params.slug as string;

    const [product, setProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState(true);
    const [notFound, setNotFound] = useState(false);
    const addItem = useCartStore(state => state.addItem);

    useEffect(() => {
        async function fetchProduct() {
            if (!slug) return;
            setLoading(true);
            const supabase = createClient();
            const { data, error } = await supabase
                .from('products')
                .select('*')
                .eq('slug', slug)
                .eq('is_active', true)
                .single();

            if (error || !data) {
                console.error("Error loading product:", error);
                setNotFound(true);
            } else {
                setProduct(data as Product);
            }
            setLoading(false);
        }

        fetchProduct();
    }, [slug]);

    const handleAddToCart = () => {
        if (product) {
            addItem(product);
            toast.success("Producto agregado al carrito");
        }
    };

    // Get specs for display based on category
    const getDisplaySpecs = () => {
        if (!product || !product.specs) return [];

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

    if (loading) {
        return (
            <div className="container py-20 flex justify-center items-center min-h-[50vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (notFound || !product) {
        return (
            <div className="container py-20 text-center min-h-[50vh]">
                <PackageOpen className="h-16 w-16 mx-auto mb-4 text-muted-foreground/30" />
                <h1 className="text-2xl font-bold mb-2">Producto no encontrado</h1>
                <p className="text-muted-foreground mb-6">El producto que buscas no existe o fue removido.</p>
                <Button asChild>
                    <Link href="/catalogo">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Volver al Catálogo
                    </Link>
                </Button>
            </div>
        );
    }

    const displaySpecs = getDisplaySpecs();
    const isInStock = product.stock_physical > 0;

    return (
        <div className="min-h-screen bg-background pb-16">
            {/* Breadcrumb */}
            <section className="border-b bg-muted/20">
                <div className="container mx-auto px-4 py-4">
                    <Link
                        href="/catalogo"
                        className="inline-flex items-center text-sm text-muted-foreground hover:text-primary transition-colors"
                    >
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Volver al Catálogo
                    </Link>
                </div>
            </section>

            {/* Product Detail */}
            <div className="container mx-auto px-4 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
                    {/* Image */}
                    <div className="relative">
                        <div className="aspect-square bg-muted rounded-xl overflow-hidden relative">
                            {product.image_url ? (
                                <Image
                                    src={product.image_url}
                                    alt={product.name}
                                    fill
                                    className="object-cover"
                                    sizes="(max-width: 1024px) 100vw, 50vw"
                                    priority
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-muted-foreground/30">
                                    <PackageOpen className="h-24 w-24" />
                                </div>
                            )}

                            {!isInStock && (
                                <div className="absolute inset-0 bg-background/60 backdrop-blur-[2px] flex items-center justify-center">
                                    <Badge variant="destructive" className="text-lg px-4 py-2">
                                        Agotado
                                    </Badge>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Info */}
                    <div className="space-y-6">
                        {/* Category */}
                        <Badge variant="secondary" className="text-xs">
                            {CATEGORY_DISPLAY[product.category] || product.category}
                        </Badge>

                        {/* Name */}
                        <h1 className="text-3xl lg:text-4xl font-bold tracking-tight">
                            {product.name}
                        </h1>

                        {/* SKU */}
                        <p className="text-sm text-muted-foreground">
                            SKU: <span className="font-mono">{product.sku}</span>
                        </p>

                        {/* Price */}
                        <div className="py-4 border-y">
                            <p className="text-4xl font-extrabold text-primary">
                                {formatCurrency(product.price_public)}
                            </p>
                            <p className="text-sm text-muted-foreground mt-1">
                                IVA incluido
                            </p>
                        </div>

                        {/* Stock Status */}
                        <div className="flex items-center gap-2">
                            {isInStock ? (
                                <>
                                    <Check className="h-5 w-5 text-green-500" />
                                    <span className="text-green-600 font-medium">
                                        En Stock ({product.stock_physical} {product.stock_physical === 1 ? 'unidad' : 'unidades'})
                                    </span>
                                </>
                            ) : (
                                <>
                                    <X className="h-5 w-5 text-red-500" />
                                    <span className="text-red-500 font-medium">Sin Stock</span>
                                </>
                            )}
                        </div>

                        {/* Add to Cart Button */}
                        <Button
                            size="lg"
                            className="w-full text-lg py-6"
                            onClick={handleAddToCart}
                            disabled={!isInStock}
                        >
                            <ShoppingCart className="mr-2 h-5 w-5" />
                            Agregar al Carrito
                        </Button>

                        {/* Description */}
                        {product.description && (
                            <Card>
                                <CardContent className="p-6">
                                    <h2 className="font-semibold mb-3">Descripción</h2>
                                    <p className="text-muted-foreground whitespace-pre-line">
                                        {product.description}
                                    </p>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </div>

                {/* Specifications */}
                {displaySpecs.length > 0 && (
                    <Card className="mt-12">
                        <CardContent className="p-6">
                            <h2 className="text-xl font-bold mb-6">Especificaciones Técnicas</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {displaySpecs.map((spec, index) => (
                                    <div
                                        key={index}
                                        className="flex justify-between items-center py-3 px-4 bg-muted/30 rounded-lg"
                                    >
                                        <span className="text-muted-foreground">{spec.label}</span>
                                        <span className="font-semibold">{spec.value}</span>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
}
