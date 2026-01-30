"use client";

import { ShoppingCart, Trash2, Plus, Minus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
    SheetFooter,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useCartStore } from "@/store/cart-store";
import { formatCurrency } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";

export function CartSheet() {
    const { items, removeItem, updateQuantity, getTotal, getItemCount } = useCartStore();
    const [isMounted, setIsMounted] = useState(false);

    // Evitar hidratación mismatch
    useEffect(() => {
        // eslint-disable-next-line
        setIsMounted(true);
    }, []);

    const cartTotal = getTotal();
    const itemCount = getItemCount();

    // Lógica para generar enlace de WhatsApp
    const handleWhatsAppCheckout = () => {
        const phoneNumber = "56912345678"; // Reemplazar con variable de entorno o config real
        let message = `Hola! 👋 Quiero realizar el siguiente pedido:\n\n`;

        items.forEach(item => {
            message += `• ${item.quantity}x ${item.name} - ${formatCurrency(item.price_public)}\n`;
        });

        message += `\n*Total: ${formatCurrency(cartTotal)}*\n`;
        message += `\n¿Me indican los datos para transferencia o medios de pago?`;

        const encodedMessage = encodeURIComponent(message);
        window.open(`https://wa.me/${phoneNumber}?text=${encodedMessage}`, '_blank');
    };

    if (!isMounted) return null;

    return (
        <Sheet>
            <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                    <ShoppingCart className="h-5 w-5" />
                    {itemCount > 0 && (
                        <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-primary text-[10px] font-medium text-primary-foreground flex items-center justify-center">
                            {itemCount}
                        </span>
                    )}
                    <span className="sr-only">Carrito</span>
                </Button>
            </SheetTrigger>
            <SheetContent className="flex w-full flex-col pr-0 sm:max-w-lg">
                <SheetHeader className="px-1">
                    <SheetTitle>Tu Carrito ({itemCount})</SheetTitle>
                    <SheetDescription>
                        Revisa tus productos antes de finalizar la compra.
                    </SheetDescription>
                </SheetHeader>
                <ScrollArea className="flex-1 pr-6">
                    {items.length === 0 ? (
                        <div className="flex h-full flex-col items-center justify-center space-y-2 p-8 text-center text-muted-foreground">
                            <ShoppingCart className="h-12 w-12 opacity-20" />
                            <p>Tu carrito está vacío.</p>
                            <Button variant="link" asChild className="mt-4">
                                <Link href="/catalogo">Ver productos</Link>
                            </Button>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-5 p-1">
                            {items.map((item) => (
                                <div key={item.id} className="flex gap-4">
                                    <div className="relative h-16 w-16 overflow-hidden rounded-md border bg-muted">
                                        {item.image_url ? (
                                            <Image
                                                src={item.image_url}
                                                alt={item.name}
                                                fill
                                                className="object-cover"
                                            />
                                        ) : (
                                            <div className="flex h-full w-full items-center justify-center bg-secondary">
                                                <ShoppingCart className="h-6 w-6 text-muted-foreground/50" />
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex flex-1 flex-col justify-between">
                                        <div className="flex justify-between gap-2">
                                            <h3 className="line-clamp-2 text-sm font-medium leading-none">
                                                {item.name}
                                            </h3>
                                            <p className="text-right text-sm font-bold tabular-nums">
                                                {formatCurrency(item.price_public * item.quantity)}
                                            </p>
                                        </div>
                                        <p className="text-xs text-muted-foreground">
                                            {formatCurrency(item.price_public)} c/u
                                        </p>
                                        <div className="mt-2 flex items-center gap-2">
                                            <div className="flex h-8 items-center rounded-md border">
                                                <button
                                                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                                    className="flex h-full w-8 items-center justify-center hover:bg-muted"
                                                    disabled={item.quantity <= 1}
                                                >
                                                    <Minus className="h-3 w-3" />
                                                </button>
                                                <span className="w-8 text-center text-xs tabular-nums">
                                                    {item.quantity}
                                                </span>
                                                <button
                                                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                    className="flex h-full w-8 items-center justify-center hover:bg-muted"
                                                >
                                                    <Plus className="h-3 w-3" />
                                                </button>
                                            </div>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 text-muted-foreground hover:text-destructive"
                                                onClick={() => removeItem(item.id)}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                                <span className="sr-only">Eliminar</span>
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </ScrollArea>
                {items.length > 0 && (
                    <div className="space-y-4 pr-6 pt-4">
                        <Separator />
                        <div className="flex items-center justify-between text-base font-semibold">
                            <span>Total Estimado</span>
                            <span className="text-xl">{formatCurrency(cartTotal)}</span>
                        </div>
                        <SheetFooter>
                            <Button
                                className="w-full bg-green-600 hover:bg-green-700 text-white gap-2"
                                size="lg"
                                onClick={handleWhatsAppCheckout}
                            >
                                {/* Pudiéramos usar un icono de WA si tuviéramos, usaré MessageCircle o similar */}
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-message-circle"><path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" /></svg>
                                Comprar por WhatsApp
                            </Button>
                        </SheetFooter>
                    </div>
                )}
            </SheetContent>
        </Sheet>
    );
}
