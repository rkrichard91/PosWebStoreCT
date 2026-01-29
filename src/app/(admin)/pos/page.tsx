"use client";

import { useEffect, useRef, useState } from "react";
import { useReactToPrint } from 'react-to-print';
import { useCartStore } from "@/store/cart-store";
import { useBarcodeScanner } from "@/hooks/useBarcodeScanner";
import { createClient } from "@/lib/supabase/client";
import { Product, Order, OrderInsert } from "@/types";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { Search, ShoppingCart, Trash2, CreditCard, Printer, FileText } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ReceiptTicket, OrderWithItems } from "@/components/admin/receipt-ticket";

export default function PosPage() {
    const supabase = createClient() as any; // Cast client to any
    const { items, addItem, removeItem, updateQuantity, clearCart, getTotal } = useCartStore();

    // State
    const [searchTerm, setSearchTerm] = useState("");
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(false);

    // Checkout State
    const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState("cash");
    const [customerName, setCustomerName] = useState("");
    const [lastOrder, setLastOrder] = useState<OrderWithItems | null>(null);
    const [printMode, setPrintMode] = useState<'thermal' | 'a4'>('thermal');

    const componentRef = useRef(null);
    const handlePrint = useReactToPrint({
        contentRef: componentRef,
    });

    // Initial load
    useEffect(() => {
        searchProducts("");
    }, []);

    // Search logic
    const searchProducts = async (term: string) => {
        setLoading(true);
        let query = supabase.from('products').select('*').eq('is_active', true).limit(20);

        if (term) {
            query = query.or(`name.ilike.%${term}%,sku.ilike.%${term}%`);
        }

        const { data, error } = await query;
        if (data) {
            setProducts(data);
        }
        setLoading(false);
    };

    // Debounce search
    useEffect(() => {
        const timeout = setTimeout(() => {
            searchProducts(searchTerm);
        }, 300);
        return () => clearTimeout(timeout);
    }, [searchTerm]);

    // Handle Barcode
    useBarcodeScanner(async (code) => {
        toast.info(`Escaneado: ${code}`);
        // Buscar producto exacto por SKU
        const { data } = await supabase
            .from('products')
            .select('*')
            .eq('sku', code)
            .single();

        if (data) {
            addItem(data);
            toast.success(`${data.name} agregado`);
        } else {
            toast.error("Producto no encontrado");
        }
    });

    // Handle Checkout
    const processCheckout = async () => {
        if (items.length === 0) return;

        // 1. Create Order
        const orderData: any = {
            total: getTotal(),
            payment_method: paymentMethod,
            origin: 'pos',
            status: 'completed',
            customer_data: customerName ? { name: customerName } : null,
            // creator_id would be handled by RLS/Supabase default user usually
        };

        const { data: order, error: orderError } = await supabase
            .from('orders')
            .insert([orderData])
            .select()
            .single();

        if (orderError || !order) {
            toast.error("Error al crear orden");
            console.error(orderError);
            return;
        }

        // 2. Create Order Items
        const orderItems = items.map(item => ({
            order_id: order.id,
            product_id: item.id,
            quantity: item.quantity,
            unit_price: item.price_public
        }));

        const { error: itemsError } = await supabase
            .from('order_items')
            .insert(orderItems);

        if (itemsError) {
            toast.error("Error al guardar items");
            console.error(itemsError);
            return;
        }

        // 3. Success & Prepare Print
        toast.success(`Venta #${order.ticket_number} realizada`);

        // Construct full order object for receipt
        const fullOrder: OrderWithItems = {
            ...order,
            order_items: items.map(i => ({
                id: crypto.randomUUID(), // Temp ID for display
                order_id: order.id,
                product_id: i.id,
                quantity: i.quantity,
                unit_price: i.price_public,
                subtotal: i.price_public * i.quantity, // Calculate manually as it is stored generated
                products: i
            }))
        };

        setLastOrder(fullOrder);
        clearCart();
        // Keep modal open but switch to Success/Print view?
        // For simplicity, we just keep the lastOrder in state and show print buttons
    };

    // Close modal reset
    const handleCloseModal = (open: boolean) => {
        setIsCheckoutOpen(open);
        if (!open) {
            setLastOrder(null);
            setCustomerName("");
        }
    }

    return (
        <div className="h-[calc(100vh-4rem)] flex flex-col md:flex-row gap-4 p-4 overflow-hidden">
            {/* Left: Product Catalog */}
            <div className="flex-1 flex flex-col gap-4 overflow-hidden">
                <div className="flex gap-2">
                    <div className="relative flex-1">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Buscar producto (F3) o escanear..."
                            className="pl-8"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            autoFocus
                        />
                    </div>
                </div>

                <div className="flex-1 min-h-0 bg-muted/20 rounded-lg p-2 overflow-y-auto">
                    {loading ? (
                        <div className="p-4 text-center">Cargando...</div>
                    ) : (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                            {products.map(product => (
                                <Card
                                    key={product.id}
                                    className="cursor-pointer hover:border-primary transition-colors flex flex-col justify-between"
                                    onClick={() => addItem(product)}
                                >
                                    <CardContent className="p-4">
                                        <div className="font-bold line-clamp-2 text-sm mb-2 h-10">{product.name}</div>
                                        <div className="text-xs text-muted-foreground mb-4">SKU: {product.sku}</div>
                                        <div className="text-right font-bold text-primary">{formatCurrency(product.price_public)}</div>
                                        <div className="text-xs text-right text-muted-foreground mt-1">Stock: {product.stock_physical}</div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Right: Cart */}
            <div className="w-full md:w-[400px] flex flex-col bg-card border rounded-lg shadow-sm h-full">
                <div className="p-4 border-b flex justify-between items-center bg-muted/40">
                    <h2 className="font-semibold flex items-center gap-2">
                        <ShoppingCart className="h-5 w-5" />
                        Carrito Actual
                    </h2>
                    <Button variant="ghost" size="sm" onClick={clearCart} className="text-destructive hover:text-destructive">
                        <Trash2 className="h-4 w-4 mr-2" />
                        Limpiar
                    </Button>
                </div>

                <ScrollArea className="flex-1 p-4">
                    {items.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-muted-foreground opacity-50 space-y-2">
                            <ShoppingCart className="h-12 w-12" />
                            <p>Carrito vacío</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {items.map(item => (
                                <div key={item.id} className="flex gap-3 text-sm">
                                    <div className="flex-1">
                                        <div className="font-medium line-clamp-1">{item.name}</div>
                                        <div className="text-muted-foreground text-xs">{formatCurrency(item.price_public)} x {item.quantity}</div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Button
                                            variant="outline" size="icon" className="h-6 w-6"
                                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                        >-</Button>
                                        <span className="w-4 text-center">{item.quantity}</span>
                                        <Button
                                            variant="outline" size="icon" className="h-6 w-6"
                                            onClick={() => addItem(item)}
                                        >+</Button>
                                    </div>
                                    <div className="font-bold min-w-[60px] text-right">
                                        {formatCurrency(item.price_public * item.quantity)}
                                    </div>
                                    <Button
                                        variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-destructive"
                                        onClick={() => removeItem(item.id)}
                                    >
                                        <XSmallIcon /> {/* Trash icon replacement */}
                                    </Button>
                                </div>
                            ))}
                        </div>
                    )}
                </ScrollArea>

                <div className="p-4 border-t bg-muted/40 space-y-4">
                    <div className="flex justify-between items-center text-2xl font-bold">
                        <span>Total:</span>
                        <span>{formatCurrency(getTotal())}</span>
                    </div>

                    <Dialog open={isCheckoutOpen} onOpenChange={handleCloseModal}>
                        <DialogTrigger asChild>
                            <Button className="w-full text-lg h-12" disabled={items.length === 0}>
                                <CreditCard className="mr-2 h-5 w-5" />
                                Cobrar
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-md">
                            {!lastOrder ? (
                                <>
                                    <DialogHeader>
                                        <DialogTitle>Confirmar Venta</DialogTitle>
                                        <DialogDescription>
                                            Total a pagar: <span className="font-bold text-foreground">{formatCurrency(getTotal())}</span>
                                        </DialogDescription>
                                    </DialogHeader>

                                    <div className="space-y-4 py-4">
                                        <div className="space-y-2">
                                            <Label>Cliente (Opcional)</Label>
                                            <Input
                                                placeholder="Nombre del cliente"
                                                value={customerName}
                                                onChange={(e) => setCustomerName(e.target.value)}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Método de Pago</Label>
                                            <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="cash">Efectivo</SelectItem>
                                                    <SelectItem value="card">Tarjeta Débito/Crédito</SelectItem>
                                                    <SelectItem value="transfer">Transferencia</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>

                                    <DialogFooter>
                                        <Button variant="outline" onClick={() => setIsCheckoutOpen(false)}>Cancelar</Button>
                                        <Button onClick={processCheckout}>Confirmar Pago</Button>
                                    </DialogFooter>
                                </>
                            ) : (
                                <>
                                    <DialogHeader>
                                        <DialogTitle className="text-green-600 flex items-center gap-2">
                                            Venta Exitosa #{lastOrder.ticket_number}
                                        </DialogTitle>
                                        <DialogDescription>
                                            Selecciona el formato de impresión.
                                        </DialogDescription>
                                    </DialogHeader>

                                    <div className="flex justify-center gap-4 py-6">
                                        <Button
                                            variant={printMode === 'thermal' ? 'default' : 'outline'}
                                            onClick={() => setPrintMode('thermal')}
                                            className="flex flex-col h-20 w-24 gap-2"
                                        >
                                            <Printer className="h-6 w-6" />
                                            <span className="text-xs">Térmica 80mm</span>
                                        </Button>
                                        <Button
                                            variant={printMode === 'a4' ? 'default' : 'outline'}
                                            onClick={() => setPrintMode('a4')}
                                            className="flex flex-col h-20 w-24 gap-2"
                                        >
                                            <FileText className="h-6 w-6" />
                                            <span className="text-xs">Estándar A4</span>
                                        </Button>
                                    </div>

                                    {/* The hidden receipt to print */}
                                    <div className="hidden">
                                        <div ref={componentRef}>
                                            <ReceiptTicket order={lastOrder} mode={printMode} />
                                        </div>
                                    </div>

                                    <DialogFooter className="flex-col sm:flex-row gap-2">
                                        <Button variant="outline" onClick={() => handleCloseModal(false)}>
                                            Cerrar
                                        </Button>
                                        <Button onClick={() => handlePrint()}>
                                            Imprimir Ticket
                                        </Button>
                                    </DialogFooter>
                                </>
                            )}
                        </DialogContent>
                    </Dialog>
                </div>
            </div>
        </div>
    );
}

function XSmallIcon() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
    )
}
