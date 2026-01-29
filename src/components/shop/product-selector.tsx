"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search } from "lucide-react";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Database } from "@/types/database.types";
import { formatCurrency } from "@/lib/utils";
import Image from "next/image";

type Product = Database['public']['Tables']['products']['Row'];
type Category = Database['public']['Tables']['products']['Row']['category'];

interface ProductSelectorProps {
    category: Category;
    categoryLabel: string;
    onSelect: (product: Product) => void;
    currentSelection: Product | null;
}

export function ProductSelector({ category, categoryLabel, onSelect, currentSelection }: ProductSelectorProps) {
    const [open, setOpen] = useState(false);
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState("");
    const supabase = createClient();

    useEffect(() => {
        if (open) {
            setLoading(true);
            const fetchProducts = async () => {
                let query = supabase
                    .from('products')
                    .select('*')
                    .eq('category', category)
                    .eq('is_active', true);

                if (search) {
                    query = query.ilike('name', `%${search}%`);
                }

                const { data, error } = await query;
                if (!error && data) {
                    setProducts(data);
                }
                setLoading(false);
            };
            fetchProducts();
        }
    }, [open, category, search, supabase]);

    const handleSelect = (product: Product) => {
        onSelect(product);
        setOpen(false);
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant={currentSelection ? "ghost" : "secondary"} size={currentSelection ? "sm" : "sm"}>
                    {currentSelection ? "Cambiar" : "Elegir"}
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl h-[80vh] flex flex-col">
                <DialogHeader>
                    <DialogTitle>Seleccionar {categoryLabel}</DialogTitle>
                </DialogHeader>

                <div className="flex items-center space-x-2 py-4">
                    <Search className="h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Buscar..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="flex-1"
                    />
                </div>

                <div className="flex-1 overflow-hidden relative">
                    {loading ? (
                        <div className="flex items-center justify-center h-full text-muted-foreground">Cargando...</div>
                    ) : (
                        <ScrollArea className="h-full pr-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-4">
                                {products.length === 0 ? (
                                    <div className="col-span-full text-center text-muted-foreground py-10">
                                        No se encontraron productos en esta categoría.
                                    </div>
                                ) : (
                                    products.map((product) => (
                                        <div
                                            key={product.id}
                                            className="border rounded-lg p-3 flex gap-3 hover:bg-muted/50 cursor-pointer transition-colors"
                                            onClick={() => handleSelect(product)}
                                        >
                                            <div className="h-20 w-20 bg-muted rounded-md flex-shrink-0 relative overflow-hidden">
                                                {product.image_url ? (
                                                    <Image src={product.image_url} alt={product.name} fill className="object-cover" />
                                                ) : (
                                                    <div className="h-full w-full flex items-center justify-center text-xs text-muted-foreground">Sin img</div>
                                                )}
                                            </div>
                                            <div className="flex-1 flex flex-col justify-between">
                                                <div>
                                                    <h4 className="font-medium line-clamp-2 text-sm">{product.name}</h4>
                                                    <p className="text-xs text-muted-foreground mt-1">
                                                        SKU: {product.sku}
                                                    </p>
                                                </div>
                                                <div className="text-right font-bold text-primary">
                                                    {formatCurrency(product.price_public)}
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </ScrollArea>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
