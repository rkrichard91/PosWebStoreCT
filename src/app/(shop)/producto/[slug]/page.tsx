import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Image from "next/image";
import { formatCurrency } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Share2, PackageOpen, Check, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Product } from "@/types";
import { AddToCartButton } from "./add-to-cart-button";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const supabase = await createClient();
    const { data } = await supabase
        .from("products")
        .select("*")
        .eq("slug", slug)
        .single();

    const product = data as any;

    if (!product) {
        return {
            title: "Producto no encontrado | Center Tecno",
        };
    }

    return {
        title: `${product.name} | Center Tecno`,
        description: product.description || `Compra ${product.name} en Center Tecno por ${formatCurrency(product.price_public)}.`,
        openGraph: {
            title: product.name,
            description: product.description || `Compra ${product.name} al mejor precio en Center Tecno.`,
            images: [product.image_url || "/og-image.jpg"],
            url: `https://centertecno.com/producto/${product.slug}`, // Replace with actual domain later
            type: "website",
        },
    };
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const supabase = await createClient();
    
    const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("slug", slug)
        .single();

    if (error || !data) {
        notFound();
    }

    const product = data as Product;

    return (
        <div className="min-h-screen bg-background pb-20">
            {/* Breadcrumb / Back button */}
            <div className="container mx-auto px-4 py-6">
                <Link href="/catalogo" className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Volver al catálogo
                </Link>
            </div>

            <main className="container mx-auto px-4">
                <div className="bg-card rounded-2xl border shadow-sm overflow-hidden glass-card">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-0 md:gap-8">
                        {/* Product Image */}
                        <div className="relative aspect-square md:aspect-auto md:h-full bg-muted/50 p-8 flex items-center justify-center border-b md:border-b-0 md:border-r">
                            {product.image_url ? (
                                <div className="relative w-full h-full min-h-[300px] max-h-[500px]">
                                    <Image
                                        src={product.image_url}
                                        alt={product.name}
                                        fill
                                        className="object-contain hover:scale-105 transition-transform duration-500"
                                        priority
                                    />
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center text-muted-foreground/50">
                                    <PackageOpen className="h-24 w-24 mb-4" />
                                    <span>Sin imagen disponible</span>
                                </div>
                            )}
                            
                            {/* Stock Badge Overlay */}
                            <div className="absolute top-4 left-4 flex flex-col gap-2">
                                <Badge className="w-fit uppercase shadow-sm bg-background text-foreground border">
                                    {product.category || 'General'}
                                </Badge>
                                {product.stock_physical <= 0 && (
                                    <Badge variant="destructive" className="w-fit uppercase shadow-sm">
                                        Agotado
                                    </Badge>
                                )}
                            </div>
                        </div>

                        {/* Product Info */}
                        <div className="p-6 md:p-10 flex flex-col justify-center">
                            <div className="mb-2 flex items-center gap-2">
                                <span className="text-xs text-muted-foreground font-mono bg-muted px-2 py-1 rounded">
                                    SKU: {product.sku}
                                </span>
                            </div>
                            
                            <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-4 text-foreground">
                                {product.name}
                            </h1>
                            
                            <div className="mb-8">
                                <div className="flex items-baseline gap-3 mb-2">
                                    <span className="text-4xl font-black text-primary">
                                        {formatCurrency(product.price_public)}
                                    </span>
                                    <span className="text-sm text-muted-foreground line-through">
                                        {formatCurrency(product.price_public * 1.15)} {/* Fake regular price for visual effect */}
                                    </span>
                                </div>
                                <p className="text-sm text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
                                    <Check className="h-4 w-4" /> 
                                    Precio exclusivo web / efectivo
                                </p>
                            </div>

                            <div className="prose dark:prose-invert max-w-none mb-8">
                                <h3 className="text-lg font-semibold mb-2">Descripción</h3>
                                <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                                    {product.description || "No hay descripción disponible para este producto."}
                                </p>
                            </div>

                            {/* Client Component for interactive Add to Cart */}
                            <div className="mt-auto pt-6 border-t flex flex-col sm:flex-row gap-4">
                                <AddToCartButton product={product} />
                            </div>
                            
                            {/* Features/Trust badges */}
                            <div className="mt-8 grid grid-cols-2 gap-4 border-t pt-6">
                                <div className="flex items-start gap-3">
                                    <div className="bg-primary/10 p-2 rounded-full text-primary">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/></svg>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium">Garantía Segura</p>
                                        <p className="text-xs text-muted-foreground">Soporte directo</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <div className="bg-primary/10 p-2 rounded-full text-primary">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="14" x="2" y="5" rx="2"/><path d="M2 10h20"/></svg>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium">Pagos Seguros</p>
                                        <p className="text-xs text-muted-foreground">Transferencia o Efectivo</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
