"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { formatCurrency } from "@/lib/utils";
import { useParams } from "next/navigation";
import Image from "next/image";

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
    } | null;
}

export default function QuotePrintPage() {
    const params = useParams();
    const quoteId = params.id as string;

    const [quote, setQuote] = useState<Quote | null>(null);
    const [items, setItems] = useState<OrderItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchQuote = async () => {
            const supabase = createClient();

            // Fetch quote
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const { data: quoteData } = await (supabase as any)
                .from("orders")
                .select("*")
                .eq("id", quoteId)
                .single();

            if (quoteData) {
                setQuote(quoteData);
            }

            // Fetch items
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const { data: itemsData } = await (supabase as any)
                .from("order_items")
                .select(`
                    *,
                    products (id, name, sku, image_url)
                `)
                .eq("order_id", quoteId);

            if (itemsData) {
                setItems(itemsData);
            }

            setLoading(false);

            // Auto-print after data is loaded
            setTimeout(() => {
                window.print();
            }, 500);
        };

        fetchQuote();
    }, [quoteId]);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <p>Cargando cotización...</p>
            </div>
        );
    }

    if (!quote) {
        return (
            <div className="flex items-center justify-center h-screen">
                <p>Cotización no encontrada</p>
            </div>
        );
    }

    const subtotal = items.reduce((acc, item) => acc + (item.unit_price * item.quantity), 0);
    const tax = subtotal * 0.15;
    const total = subtotal + tax;

    return (
        <div className="p-8 max-w-[800px] mx-auto bg-white text-black print:p-0">
            {/* Header */}
            <div className="flex items-start justify-between border-b pb-4 mb-6">
                {/* Logo */}
                <div className="flex-shrink-0">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src="/logo.png" alt="Center Tecno" className="h-16 w-auto" />
                </div>

                {/* Title */}
                <div className="text-center flex-1">
                    <h1 className="text-2xl font-bold uppercase">Cotización</h1>
                    <p className="text-sm text-gray-600">
                        Fecha: {new Date(quote.created_at).toLocaleDateString()}
                    </p>
                    <p className="text-xs text-gray-500">ID: {quote.id.slice(0, 8)}</p>
                </div>

                {/* Customer */}
                <div className="text-right text-sm max-w-[180px]">
                    {quote.customer_data?.name ? (
                        <>
                            <p className="font-bold">{quote.customer_data.name}</p>
                            {quote.customer_data.doc_number && <p>{quote.customer_data.doc_number}</p>}
                            {quote.customer_data.phone && <p>{quote.customer_data.phone}</p>}
                        </>
                    ) : (
                        <p className="text-gray-400 italic">Cliente no especificado</p>
                    )}
                </div>
            </div>

            {/* Company Info */}
            <div className="text-xs text-gray-600 text-center mb-6 pb-4 border-b">
                <p className="font-semibold">Center Tecno - Lo mejor en tecnología siempre</p>
                <p>Mucho Lote 2, Urb. Valle Victoria, Mz 2841 V1, Local 7 | RUC: 0993404554001</p>
                <p>Telf: +593 99 809 4487 | admin@center-tecno.com</p>
            </div>

            {/* Items Table */}
            <table className="w-full text-sm mb-6">
                <thead>
                    <tr className="border-b">
                        <th className="text-left py-2 w-14">Img</th>
                        <th className="text-left py-2">Producto</th>
                        <th className="text-center py-2 w-16">Cant.</th>
                        <th className="text-right py-2 w-24">P. Unit.</th>
                        <th className="text-right py-2 w-24">Total</th>
                    </tr>
                </thead>
                <tbody>
                    {items.map((item) => (
                        <tr key={item.id} className="border-b">
                            <td className="py-2">
                                <div className="h-10 w-10 bg-gray-100 rounded overflow-hidden relative">
                                    {item.products?.image_url ? (
                                        <Image src={item.products.image_url} alt="" fill className="object-cover" sizes="40px" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">N/A</div>
                                    )}
                                </div>
                            </td>
                            <td className="py-2">
                                <div className="font-medium">{item.products?.name || "Producto"}</div>
                                <div className="text-xs text-gray-500">{item.products?.sku}</div>
                            </td>
                            <td className="py-2 text-center">{item.quantity}</td>
                            <td className="py-2 text-right">{formatCurrency(item.unit_price)}</td>
                            <td className="py-2 text-right font-medium">{formatCurrency(item.unit_price * item.quantity)}</td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {/* Totals */}
            <div className="flex justify-end mb-8">
                <div className="text-right space-y-1">
                    <div className="flex justify-between gap-8 text-sm">
                        <span className="text-gray-600">Subtotal:</span>
                        <span>{formatCurrency(subtotal)}</span>
                    </div>
                    <div className="flex justify-between gap-8 text-sm">
                        <span className="text-gray-600">IVA (15%):</span>
                        <span>{formatCurrency(tax)}</span>
                    </div>
                    <div className="flex justify-between gap-8 pt-2 border-t font-bold text-lg">
                        <span>TOTAL:</span>
                        <span>{formatCurrency(total)}</span>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div className="text-xs text-gray-500 text-center border-t pt-4">
                * Los precios incluyen IVA. Cotización válida por 15 días.
            </div>
        </div>
    );
}
