"use client"

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eye, FileText } from 'lucide-react';
import Link from 'next/link';
import { formatCurrency } from '@/lib/utils';
import { Database } from '@/types/database.types';

type Quote = Database['public']['Tables']['quotes']['Row'] & {
    // Optional: Join with profiles/users if needed directly, but standard auth has emails apart
    user_email?: string
};

export default function AdminQuotesPage() {
    const [quotes, setQuotes] = useState<Quote[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const supabase = createClient();

    useEffect(() => {
        async function fetchQuotes() {
            // TODO: Ideally we would join with a profiles table, but for now getting IDs
            // If we need emails, we might need a server component to access admin auth api or a profiles table join
            // For now, let's just fetch the quotes.

            const { data, error } = await supabase
                .from('quotes')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) {
                console.error("Error fetching quotes:", error);
            } else {
                setQuotes(data || []);
            }
            setIsLoading(false);
        }

        fetchQuotes();
    }, [supabase]);

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold tracking-tight">Gestión de Cotizaciones</h1>

            <Card>
                <CardHeader>
                    <CardTitle>Solicitudes Recientes</CardTitle>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="text-center py-4">Cargando...</div>
                    ) : quotes.length === 0 ? (
                        <div className="text-center py-10 text-muted-foreground">
                            No hay cotizaciones registradas.
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>ID</TableHead>
                                    <TableHead>Fecha</TableHead>
                                    <TableHead>Total</TableHead>
                                    <TableHead>Estado</TableHead>
                                    <TableHead className="text-right">Acciones</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {quotes.map((quote) => (
                                    <TableRow key={quote.id}>
                                        <TableCell className="font-mono text-xs">
                                            {quote.id.slice(0, 8)}...
                                        </TableCell>
                                        <TableCell>
                                            {new Date(quote.created_at).toLocaleDateString()}
                                        </TableCell>
                                        <TableCell className="font-bold">
                                            {formatCurrency(quote.total_price)}
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={quote.status === 'pending' ? 'secondary' : 'default'}>
                                                {quote.status === 'pending' ? 'Pendiente' : quote.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Button variant="ghost" size="sm" asChild>
                                                <Link href={`/quotes/${quote.id}`}>
                                                    <Eye className="h-4 w-4 mr-2" />
                                                    Ver
                                                </Link>
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
