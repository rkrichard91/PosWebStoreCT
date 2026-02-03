import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { Plus, FileText, Calendar, User } from "lucide-react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatCurrency } from "@/lib/utils";

export const metadata = {
    title: "Cotizaciones | Admin Dashboard",
    description: "Gestión de cotizaciones",
};

interface Quote {
    id: string;
    customer_data: { name?: string } | null;
    total: number;
    created_at: string;
    status: string | null;
}

export default async function QuotesPage() {
    const supabase = await createClient();

    // Fetch quotes (orders with status 'quote')
    const { data, error } = await supabase
        .from("orders")
        .select("*")
        .eq("status", "quote")
        .order("created_at", { ascending: false });

    const quotes = data as unknown as Quote[] | null;

    if (error) {
        console.error("Error fetching quotes:", error);
    }

    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">Cotizaciones</h2>
                <div className="flex items-center space-x-2">
                    <Link href="/quotes/create">
                        <Button>
                            <Plus className="mr-2 h-4 w-4" />
                            Nueva Cotización
                        </Button>
                    </Link>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Historial de Cotizaciones</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[100px]">ID</TableHead>
                                <TableHead>Cliente</TableHead>
                                <TableHead>Fecha</TableHead>
                                <TableHead className="text-right">Total</TableHead>
                                <TableHead className="text-right">Acciones</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {!quotes || quotes.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center h-24 text-muted-foreground">
                                        No hay cotizaciones registradas.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                quotes.map((quote) => {
                                    // Parse customer data if it exists
                                    const customerName = quote.customer_data?.name || "Cliente General";

                                    return (
                                        <TableRow key={quote.id}>
                                            <TableCell className="font-medium">
                                                <div className="flex items-center space-x-2">
                                                    <FileText className="h-4 w-4 text-muted-foreground" />
                                                    <span>{quote.id.slice(0, 8)}...</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center space-x-2">
                                                    <User className="h-3 w-3 text-muted-foreground" />
                                                    <span>{customerName}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center space-x-2">
                                                    <Calendar className="h-3 w-3 text-muted-foreground" />
                                                    <span>{new Date(quote.created_at).toLocaleDateString()}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right font-medium">
                                                {formatCurrency(quote.total)}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                {/* Actions placeholder */}
                                            </TableCell>
                                        </TableRow>
                                    )
                                })
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
