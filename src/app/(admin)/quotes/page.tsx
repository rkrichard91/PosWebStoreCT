"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, ShoppingCart, Loader2, Printer } from "lucide-react";
import Link from "next/link";
import { formatCurrency } from "@/lib/utils";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

interface Quote {
    id: string;
    created_at: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    customer_data: any;
    total: number;
    status: string;
}

export default function QuotesPage() {
    const [quotes, setQuotes] = useState<Quote[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchQuotes = async () => {
        setLoading(true);
        const supabase = createClient();
        const { data, error } = await supabase
            .from("orders")
            .select("*")
            .eq("status", "quote")
            .order("created_at", { ascending: false });

        if (error) {
            console.error("Error fetching quotes:", error);
            toast.error("Error al cargar cotizaciones");
        } else {
            setQuotes(data || []);
        }
        setLoading(false);
    };

    useEffect(() => {
        // eslint-disable-next-line 
        fetchQuotes();
    }, []);

    const convertToSale = async (quoteId: string) => {
        if (!confirm("¿Convertir esta cotización en una venta activa? Pasará a estado completado.")) return;

        const supabase = createClient();
        const { error } = await supabase
            .from('orders')
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            .update({ status: 'completed', origin: 'pos' } as any) // Treating as POS Sale
            .eq('id', quoteId);

        if (error) {
            toast.error("Error al convertir a venta");
        } else {
            toast.success("Cotización convertida a venta exitosamente");
            fetchQuotes();
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        );
    }

    return (
        <div className="p-6 space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold tracking-tight">Cotizaciones</h1>
                <Link href="/quotes/create">
                    <Button>
                        <Plus className="mr-2 h-4 w-4" /> Nueva Cotización
                    </Button>
                </Link>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Historial de Cotizaciones</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Fecha</TableHead>
                                <TableHead>Cliente</TableHead>
                                <TableHead>Contacto</TableHead>
                                <TableHead className="text-right">Total</TableHead>
                                <TableHead className="text-center">Estado</TableHead>
                                <TableHead className="text-right">Acciones</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {quotes.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center py-10 text-muted-foreground">
                                        No hay cotizaciones registradas. Crea una nueva.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                quotes.map((quote) => {
                                    const customer = quote.customer_data || {};
                                    return (
                                        <TableRow key={quote.id}>
                                            <TableCell>
                                                {format(new Date(quote.created_at), "dd MMM yyyy HH:mm", { locale: es })}
                                            </TableCell>
                                            <TableCell>
                                                <div className="font-medium">{customer.name || "Cliente General"}</div>
                                                <div className="text-xs text-muted-foreground">{customer.doc_number}</div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="text-sm">{customer.email}</div>
                                                <div className="text-xs text-muted-foreground">{customer.phone}</div>
                                            </TableCell>
                                            <TableCell className="text-right font-bold">
                                                {formatCurrency(quote.total)}
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Cotización</Badge>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-2">
                                                    {/* Add View/Edit logic later if needed */}
                                                    <Button variant="ghost" size="icon" title="Imprimir" onClick={() => window.print()}> {/* Simplified print */}
                                                        <Printer className="h-4 w-4" />
                                                    </Button>
                                                    <Button size="sm" onClick={() => convertToSale(quote.id)} className="bg-green-600 hover:bg-green-700">
                                                        <ShoppingCart className="mr-2 h-3 w-3" /> Vender
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
