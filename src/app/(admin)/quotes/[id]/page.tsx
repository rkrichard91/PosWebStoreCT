"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatCurrency } from "@/lib/utils";
import { ArrowLeft, Printer, Loader2 } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useParams, notFound } from "next/navigation";

interface OrderItem {
    id: string;
    quantity: number;
    unit_price: number;
    products: {
        id: string;
        name: string;
        sku: string;
        image_url: string | null;
    } | null;
}

interface Quote {
    id: string;
    created_at: string;
    customer_data: {
        name?: string;
        doc_number?: string;
        phone?: string;
        email?: string;
        address?: string;
    } | null;
}

export default function QuoteDetailPage() {
    const params = useParams();
    const quoteId = params.id as string;

    const [quote, setQuote] = useState<Quote | null>(null);
    const [items, setItems] = useState<OrderItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [notFoundState, setNotFoundState] = useState(false);

    useEffect(() => {
        const fetchQuote = async () => {
            const supabase = createClient();

            // Fetch the quote (order with status 'quote')
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const { data: quoteData, error } = await (supabase as any)
                .from("orders")
                .select("*")
                .eq("id", quoteId)
                .eq("status", "quote")
                .single();

            if (error || !quoteData) {
                setNotFoundState(true);
                setLoading(false);
                return;
            }

            setQuote(quoteData);

            // Fetch order items with product details
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const { data: itemsData } = await (supabase as any)
                .from("order_items")
                .select(`
                    *,
                    products (id, name, sku, image_url, price_public)
                `)
                .eq("order_id", quoteId);

            setItems(itemsData || []);
            setLoading(false);
        };

        fetchQuote();
    }, [quoteId]);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    if (notFoundState || !quote) {
        return (
            <div className="flex flex-col items-center justify-center h-96 gap-4">
                <p className="text-muted-foreground">Cotización no encontrada</p>
                <Link href="/quotes">
                    <Button variant="outline">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Volver a Cotizaciones
                    </Button>
                </Link>
            </div>
        );
    }

    // Calculate totals
    const subtotal = items.reduce((acc, item) => acc + (item.unit_price * item.quantity), 0);
    const tax = subtotal * 0.15;
    const total = subtotal + tax;

    return (
        <div className="p-6 max-w-[1000px] mx-auto space-y-6">
            {/* Print Styles */}
            <style>{`
                @media print {
                    body { visibility: hidden; background: white; }
                    #quote-print-area { 
                        visibility: visible; 
                        position: absolute; 
                        left: 0; top: 0; 
                        width: 100%; 
                        background: white; 
                        color: black;
                    }
                    #quote-print-area * { visibility: visible; }
                    .no-print { display: none !important; }
                    @page { margin: 1.5cm; }
                }
            `}</style>

            {/* Header Actions */}
            <div className="flex justify-between items-center no-print">
                <Link href="/quotes">
                    <Button variant="ghost">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Volver a Cotizaciones
                    </Button>
                </Link>
                <Button onClick={() => window.print()}>
                    <Printer className="mr-2 h-4 w-4" />
                    Imprimir
                </Button>
            </div>

            {/* Printable Quote Document */}
            <div id="quote-print-area">
                <Card className="border shadow-sm print:border-none print:shadow-none">
                    <CardHeader className="border-b bg-muted/10 pb-6">
                        <div className="flex items-start justify-between">
                            {/* Logo */}
                            <div className="flex-shrink-0">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src="/logo.png" alt="Center Tecno" className="h-20 w-auto object-contain" />
                            </div>

                            {/* Title */}
                            <div className="flex-1 text-center">
                                <CardTitle className="text-3xl font-bold uppercase tracking-wide">Cotización</CardTitle>
                                <p className="text-sm text-muted-foreground mt-1">
                                    Fecha: {new Date(quote.created_at).toLocaleDateString()}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    ID: {quote.id.slice(0, 8)}...
                                </p>
                            </div>

                            {/* Customer Info */}
                            <div className="text-right text-sm flex-shrink-0 max-w-[200px]">
                                {quote.customer_data?.name ? (
                                    <div className="border rounded p-2 bg-muted/20 print:border-none print:bg-transparent">
                                        <p className="font-bold">{quote.customer_data.name}</p>
                                        {quote.customer_data.doc_number && <p>{quote.customer_data.doc_number}</p>}
                                        {quote.customer_data.email && <p>{quote.customer_data.email}</p>}
                                        {quote.customer_data.phone && <p>{quote.customer_data.phone}</p>}
                                    </div>
                                ) : (
                                    <p className="text-muted-foreground italic">Cliente sin especificar</p>
                                )}
                            </div>
                        </div>

                        {/* Company Info */}
                        <div className="text-xs text-muted-foreground text-center mt-4 pt-4 border-t">
                            <p className="font-semibold">Center Tecno - Lo mejor en tecnología siempre</p>
                            <p>Mucho Lote 2, Urb. Valle Victoria, Mz 2841 V1, Local 7 | RUC: 0993404554001</p>
                            <p>Telf: +593 99 809 4487 | admin@center-tecno.com</p>
                        </div>
                    </CardHeader>

                    <CardContent className="p-0">
                        <Table>
                            <TableHeader className="bg-muted/30">
                                <TableRow>
                                    <TableHead className="w-[80px]">Img</TableHead>
                                    <TableHead>Producto</TableHead>
                                    <TableHead className="text-center w-[80px]">Cant.</TableHead>
                                    <TableHead className="text-right w-[120px]">Precio Unit.</TableHead>
                                    <TableHead className="text-right w-[120px]">Total</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {items.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center text-muted-foreground h-24 italic">
                                            No hay ítems en esta cotización.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    items.map((item) => (
                                        <TableRow key={item.id}>
                                            <TableCell className="py-2">
                                                <div className="h-12 w-12 bg-muted rounded overflow-hidden border relative flex-shrink-0">
                                                    {item.products?.image_url ? (
                                                        <Image src={item.products.image_url} alt="" fill className="object-cover" sizes="48px" />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">N/A</div>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="font-medium">{item.products?.name || "Producto"}</div>
                                                <div className="text-xs text-muted-foreground">{item.products?.sku || ""}</div>
                                            </TableCell>
                                            <TableCell className="text-center font-bold">{item.quantity}</TableCell>
                                            <TableCell className="text-right">{formatCurrency(item.unit_price)}</TableCell>
                                            <TableCell className="text-right font-bold">{formatCurrency(item.unit_price * item.quantity)}</TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>

                        {/* Totals */}
                        <div className="p-6 mt-4 space-y-4">
                            <div className="flex justify-end">
                                <div className="text-right space-y-1">
                                    <div className="flex justify-end gap-4 text-sm text-muted-foreground">
                                        <span>Subtotal:</span>
                                        <span className="font-medium">{formatCurrency(subtotal)}</span>
                                    </div>
                                    <div className="flex justify-end gap-4 text-sm text-muted-foreground">
                                        <span>IVA (15%):</span>
                                        <span className="font-medium">{formatCurrency(tax)}</span>
                                    </div>
                                    <div className="pt-2 border-t mt-2">
                                        <p className="text-sm text-muted-foreground uppercase tracking-wider">Total a Pagar</p>
                                        <p className="text-4xl font-extrabold text-primary">{formatCurrency(total)}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </CardContent>

                    {/* Footer */}
                    <div className="p-4 bg-muted/40 border-t text-xs text-muted-foreground text-center">
                        * Los precios incluyen IVA. Cotización válida por 15 días.
                    </div>
                </Card>
            </div>
        </div>
    );
}
