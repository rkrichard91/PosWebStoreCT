"use client";

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { createClient } from '@/lib/supabase/client';
import { Product } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ShoppingCart, Search, PackageOpen, Eye } from 'lucide-react';
import { useCartStore } from '@/store/cart-store';
import { formatCurrency } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { ProductDetailModal } from '@/components/shop/product-detail-modal';

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
    const [selectedCategory, setSelectedCategory] = useState<string>("all");
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const addItem = useCartStore(state => state.addItem);

    const openProductModal = (product: Product) => {
        setSelectedProduct(product);
        setIsModalOpen(true);
    };

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

    // Filter products
    const filteredProducts = products.filter(product => {
        // Category filter
        if (selectedCategory !== "all" && product.category !== selectedCategory) {
            return false;
        }
        // Search filter
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            return (
                product.name.toLowerCase().includes(term) ||
                product.sku.toLowerCase().includes(term)
            );
        }
        return true;
    });

    // Get available categories from products
    const availableCategories = Array.from(new Set(products.map(p => p.category || 'other')));

    // Sort categories based on predefined order
    const sortedCategories = CATEGORY_ORDER.filter(c => availableCategories.includes(c));
    availableCategories.forEach(c => {
        if (!sortedCategories.includes(c)) sortedCategories.push(c);
    });

    if (loading) {
        return (
            <div className="container py-20 flex justify-center items-center min-h-[50vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background pb-10">
            {/* Header */}
            <section className="bg-muted/30 border-b py-8">
                <div className="container mx-auto px-4">
                    <h1 className="text-3xl font-bold tracking-tight mb-2">Catálogo</h1>
                    <p className="text-muted-foreground max-w-2xl mb-6">
                        Encuentra los mejores componentes para tu setup.
                    </p>

                    <div className="max-w-md relative">
                        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Buscar producto..."
                            className="pl-9 h-10"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
            </section>

            <div className="container mx-auto px-4 py-8 flex flex-col lg:flex-row gap-8">
                {/* Sidebar Navigation */}
                <aside className="lg:w-64 flex-shrink-0 space-y-2">
                    <div className="font-semibold mb-4 px-2">Categorías</div>
                    <Button
                        variant={selectedCategory === "all" ? "secondary" : "ghost"}
                        className="w-full justify-start font-medium"
                        onClick={() => setSelectedCategory("all")}
                    >
                        Ver Todo
                    </Button>
                    {sortedCategories.map(category => (
                        <Button
                            key={category}
                            variant={selectedCategory === category ? "secondary" : "ghost"}
                            className="w-full justify-start text-muted-foreground data-[active=true]:text-foreground data-[active=true]:font-medium"
                            data-active={selectedCategory === category}
                            onClick={() => setSelectedCategory(category)}
                        >
                            {CATEGORY_DISPLAY[category] || category}
                        </Button>
                    ))}
                </aside>

                {/* Main Content */}
                <main className="flex-1">
                    <div className="mb-4 flex items-center justify-between">
                        <h2 className="text-xl font-bold">
                            {selectedCategory === "all" ? "Todos los Productos" : (CATEGORY_DISPLAY[selectedCategory] || selectedCategory)}
                        </h2>
                        <span className="text-sm text-muted-foreground">
                            {filteredProducts.length} productos
                        </span>
                    </div>

                    {filteredProducts.length === 0 ? (
                        <div className="py-20 text-center text-muted-foreground border-2 border-dashed rounded-xl">
                            <PackageOpen className="h-12 w-12 mx-auto mb-3 opacity-20" />
                            <p>No se encontraron productos en esta categoría.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {filteredProducts.map(product => (
                                <Card
                                    key={product.id}
                                    className="flex flex-col h-full overflow-hidden hover:shadow-lg transition-all duration-200 cursor-pointer group"
                                    onClick={() => openProductModal(product)}
                                >
                                    <div className="aspect-square bg-muted relative overflow-hidden">
                                        {product.image_url ? (
                                            <Image
                                                src={product.image_url}
                                                alt={product.name}
                                                fill
                                                className="object-cover transition-transform duration-500 group-hover:scale-105"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-muted-foreground/30">
                                                <PackageOpen className="h-10 w-10" />
                                            </div>
                                        )}

                                        {product.stock_physical <= 0 && (
                                            <div className="absolute inset-0 bg-background/60 backdrop-blur-[1px] flex items-center justify-center">
                                                <Badge variant="outline" className="bg-background font-bold border-destructive text-destructive">
                                                    Agotado
                                                </Badge>
                                            </div>
                                        )}

                                        {/* Hover overlay with eye icon */}
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                                            <div className="bg-white rounded-full p-3">
                                                <Eye className="h-6 w-6 text-primary" />
                                            </div>
                                        </div>
                                    </div>

                                    <CardContent className="flex-1 p-4 flex flex-col">
                                        <div className="mb-2">
                                            <p className="text-[10px] text-muted-foreground uppercase bg-muted w-fit px-1.5 py-0.5 rounded mb-2">
                                                {product.category || 'General'}
                                            </p>
                                            <h3 className="font-semibold text-sm leading-tight line-clamp-2 h-10" title={product.name}>
                                                {product.name}
                                            </h3>
                                        </div>

                                        <div className="mt-auto pt-3 flex items-center justify-between">
                                            <span className="font-bold text-lg text-primary">
                                                {formatCurrency(product.price_public)}
                                            </span>
                                            <Button
                                                size="icon"
                                                variant="secondary"
                                                className="h-8 w-8 rounded-full"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleAddToCart(product);
                                                }}
                                                disabled={product.stock_physical <= 0}
                                            >
                                                <ShoppingCart className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </main>
            </div>

            {/* Product Detail Modal */}
            <ProductDetailModal
                product={selectedProduct}
                open={isModalOpen}
                onOpenChange={setIsModalOpen}
            />
        </div>
    );
}
