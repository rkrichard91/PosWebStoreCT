"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Share2 } from "lucide-react";
import { useCartStore } from "@/store/cart-store";
import { toast } from "sonner";
import { Product } from "@/types";

export function AddToCartButton({ product }: { product: Product }) {
    const [isSharing, setIsSharing] = useState(false);
    const addItem = useCartStore(state => state.addItem);

    const handleAddToCart = () => {
        addItem(product);
        toast.success("Producto agregado al carrito");
    };

    const handleShare = async () => {
        setIsSharing(true);
        try {
            const url = window.location.href;
            if (navigator.share) {
                await navigator.share({
                    title: `${product.name} | Center Tecno`,
                    text: `Mira este producto en Center Tecno: ${product.name}`,
                    url: url,
                });
            } else {
                await navigator.clipboard.writeText(url);
                toast.success("Enlace copiado al portapapeles");
            }
        } catch (error) {
            console.error("Error sharing:", error);
        } finally {
            setIsSharing(false);
        }
    };

    const isOutOfStock = product.stock_physical <= 0;

    return (
        <>
            <Button
                size="lg"
                className="flex-1 btn-gradient hover-3d gap-2"
                onClick={handleAddToCart}
                disabled={isOutOfStock}
            >
                <ShoppingCart className="h-5 w-5" />
                {isOutOfStock ? "Agotado" : "Agregar al Carrito"}
            </Button>
            
            <Button
                size="lg"
                variant="outline"
                className="flex-1 sm:flex-none gap-2 hover:bg-muted"
                onClick={handleShare}
                disabled={isSharing}
            >
                <Share2 className="h-5 w-5 text-primary" />
                Compartir
            </Button>
        </>
    );
}
