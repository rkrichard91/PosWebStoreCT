"use client";

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { createClient } from '@/lib/supabase/client';
import { Product } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ShoppingCart, Search, PackageOpen } from 'lucide-react';
import { useCartStore } from '@/store/cart-store';
import { formatCurrency } from '@/lib/utils';
import { Input } from '@/components/ui/input';
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

// Order in which categories should appear
const CATEGORY_ORDER = [
    'laptop', 'cpu', 'motherboard', 'ram', 'gpu',
    'storage', 'psu', 'case', 'cooling',
    'monitor', 'peripheral'
];

export default function CatalogoPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const addItem = useCartStore(state => state.addItem);

    useEffect(() => {
        async function fetchProducts() {
            setLoading(true);
            const supabase = createClient();
            const { data, error } = await supabase
                .from('products')
                .select('*')
                .eq('is_active', true);

            if (error) {
                console.error("Error loading products:", error);
            } else if (data) {
                setProducts(data as Product[]);
            }
            setLoading(false);
        }

        fetchProducts();
    }, []);

    const handleAddToCart = (product: Product) => {
        addItem(product);
        toast.success("Producto agregado al carrito");
    };

    // Group products by category
    const groupedProducts = products.reduce((acc, product) => {
        const cat = product.category || 'other';
        if (!acc[cat]) acc[cat] = [];
        // Filter by search term if exists
        if (!searchTerm ||
            product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            product.sku.toLowerCase().includes(searchTerm.toLowerCase())) {
            acc[cat].push(product);
        }
        return acc;
    }, {} as Record<string, Product[]>);

    // Filter categories that have products
    const activeCategories = CATEGORY_ORDER.filter(cat => groupedProducts[cat]?.length > 0);
    // Add any categories not in the ordered list but present in data
    Object.keys(groupedProducts).forEach(cat => {
        if (!CATEGORY_ORDER.includes(cat) && groupedProducts[cat].length > 0) {
            activeCategories.push(cat);
        }
    });

    if (loading) {
        return (
            <div className="container py-20 flex justify-center items-center min-h-[50vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background pb-20">
            {/* Header / Hero */}
            <section className="bg-muted/30 border-b py-12">
                <div className="container mx-auto px-4 text-center">
                    <h1 className="text-4xl font-extrabold tracking-tight mb-4">Catálogo de Productos</h1>
                    <p className="text-muted-foreground text-lg max-w-2xl mx-auto mb-8">
                        Explora nuestra selección de componentes de hardware y accesorios de alta calidad.
                    </p>

                    <div className="max-w-md mx-auto relative">
                        <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                        <Input
                            placeholder="Buscar producto..."
                            className="pl-10 h-12 text-lg"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
            </section>

            <div className="container mx-auto py-12 px-4 space-y-16">
                {activeCategories.length === 0 ? (
                    <div className="text-center py-20 text-muted-foreground">
                        <PackageOpen className="h-16 w-16 mx-auto mb-4 opacity-20" />
                        <p className="text-xl">No se encontraron productos.</p>
                    </div>
                ) : (
                    activeCategories.map(category => (
                        <section key={category} id={category} className="scroll-mt-20">
                            <div className="flex items-center gap-4 mb-6 border-b pb-2">
                                <h2 className="text-2xl font-bold text-primary">
                                    {CATEGORY_DISPLAY[category] || category.charAt(0).toUpperCase() + category.slice(1)}
                                </h2>
                                <span className="text-xs font-medium px-2 py-1 bg-muted rounded-full text-muted-foreground">
                                    {groupedProducts[category].length}
                                </span>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                                {groupedProducts[category].map(product => (
                                    <Card key={product.id} className="flex flex-col h-full overflow-hidden hover:shadow-lg transition-shadow duration-300">
                                        {/* Image Area */}
                                        <div className="aspect-square bg-muted relative overflow-hidden group">
                                            {product.image_url ? (
                                                <Image
                                                    src={product.image_url}
                                                    alt={product.name}
                                                    fill
                                                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-muted-foreground/30">
                                                    <PackageOpen className="h-12 w-12" />
                                                </div>
                                            )}

                                            {/* Stock Badge */}
                                            <div className="absolute top-2 right-2">
                                                {product.stock_physical > 0 ? (
                                                    <Badge variant={product.stock_physical < 3 ? "destructive" : "secondary"} className="font-semibold shadow-sm">
                                                        {product.stock_physical < 3 ? "¡Últimas unidades!" : "En Stock"}
                                                    </Badge>
                                                ) : (
                                                    <Badge variant="outline" className="bg-background/80 backdrop-blur-sm text-muted-foreground border-destructive/50">
                                                        Agotado
                                                    </Badge>
                                                )}
                                            </div>
                                        </div>

                                        <CardContent className="flex-1 p-5 flex flex-col">
                                            <div className="mb-2">
                                                <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">
                                                    {product.sku}
                                                </p>
                                                <h3 className="font-bold text-lg leading-tight line-clamp-2 min-h-[3rem]" title={product.name}>
                                                    {product.name}
                                                </h3>
                                            </div>

                                            <div className="mt-auto pt-4 flex items-center justify-between border-t border-dashed">
                                                <div className="flex flex-col">
                                                    <span className="text-xs text-muted-foreground">Precio</span>
                                                    <span className="text-xl font-bold text-primary">
                                                        {formatCurrency(product.price_public)}
                                                    </span>
                                                </div>
                                                <Button
                                                    size="sm"
                                                    onClick={() => handleAddToCart(product)}
                                                    disabled={product.stock_physical <= 0}
                                                    className="rounded-full px-4 shadow-sm hover:translate-y-[-2px] transition-transform"
                                                >
                                                    <ShoppingCart className="h-4 w-4 mr-2" />
                                                    Agregar
                                                </Button>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        </section>
                    ))
                )}
            </div>
        </div>
    );
}
