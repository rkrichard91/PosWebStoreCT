"use client";

import { useEffect, useState } from "react";
import { type User as SupabaseUser } from '@supabase/supabase-js';
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../../components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatCurrency } from "@/lib/utils";
import { Loader2, Package, Wrench, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";

// Tipos locales para no depender de importaciones circulares o fallidas
type Order = {
    id: string;
    ticket_number: number;
    created_at: string;
    total: number;
    status: string;
    payment_method: string;
};

type Repair = {
    id: string;
    ticket_number: number;
    device_model: string;
    issue_reported: string;
    status: string;
    created_at: string;
};

export default function MyAccountPage() {
    const supabase = createClient();
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState<SupabaseUser | null>(null);
    const [orders, setOrders] = useState<Order[]>([]);
    const [repairs, setRepairs] = useState<Repair[]>([]);

    useEffect(() => {
        const loadData = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                router.push("/login");
                return;
            }
            setUser(user);

            const { data: ordersData } = await supabase
                .from("orders")
                .select("*")
                .or(`customer_id.eq.${user.id},customer_data->>email.eq.${user.email}`)
                .order("created_at", { ascending: false });

            if (ordersData) {
                // Supabase returns generic data, we map it to our local type. 
                // Ideally we use Database['public']['Tables']['orders']['Row'] but local type is fine for now
                setOrders(ordersData as unknown as Order[]);
            }

            // Fetch Repairs
            const { data: repairsData } = await supabase
                .from("repairs")
                .select("*")
                .eq("customer_contact", user.email || "")
                .order("created_at", { ascending: false });

            if (repairsData) {
                setRepairs(repairsData as unknown as Repair[]);
            }

            setLoading(false);
        };

        loadData();
    }, [supabase, router]);

    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.push("/login");
        router.refresh();
    };

    if (loading) {
        return (
            <div className="flex h-[50vh] w-full items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="container py-10 max-w-5xl">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold">Mi Cuenta</h1>
                    <p className="text-muted-foreground">Bienvenido, {user?.user_metadata?.full_name || user?.email}</p>
                </div>
                <Button variant="outline" onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" /> Cerrar Sesión
                </Button>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Compras Totales</CardTitle>
                        <Package className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{orders.length}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Reparaciones</CardTitle>
                        <Wrench className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{repairs.length}</div>
                    </CardContent>
                </Card>
            </div>

            <Tabs defaultValue="orders" className="w-full">
                <TabsList>
                    <TabsTrigger value="orders">Mis Compras</TabsTrigger>
                    <TabsTrigger value="repairs">Mis Reparaciones</TabsTrigger>
                </TabsList>

                <TabsContent value="orders">
                    <Card>
                        <CardHeader>
                            <CardTitle>Historial de Compras</CardTitle>
                            <CardDescription>Visualiza tus compras realizadas en tienda y web.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Ticket #</TableHead>
                                        <TableHead>Fecha</TableHead>
                                        <TableHead>Total</TableHead>
                                        <TableHead>Pago</TableHead>
                                        <TableHead>Estado</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {orders.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={5} className="text-center h-24 text-muted-foreground">
                                                No tienes compras registradas.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        orders.map((order) => (
                                            <TableRow key={order.id}>
                                                <TableCell className="font-mono">#{order.ticket_number}</TableCell>
                                                <TableCell>{new Date(order.created_at).toLocaleDateString()}</TableCell>
                                                <TableCell>{formatCurrency(order.total)}</TableCell>
                                                <TableCell className="capitalize">{order.payment_method}</TableCell>
                                                <TableCell>
                                                    <Badge variant={order.status === 'completed' ? 'default' : 'secondary'}>
                                                        {order.status === 'completed' ? 'Completado' : order.status}
                                                    </Badge>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="repairs">
                    <Card>
                        <CardHeader>
                            <CardTitle>Estado de Reparaciones</CardTitle>
                            <CardDescription>Seguimiento de tus equipos en servicio técnico.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Ticket #</TableHead>
                                        <TableHead>Equipo</TableHead>
                                        <TableHead>Problema</TableHead>
                                        <TableHead>Fecha Ingreso</TableHead>
                                        <TableHead>Estado</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {repairs.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={5} className="text-center h-24 text-muted-foreground">
                                                No tienes reparaciones registradas.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        repairs.map((repair) => (
                                            <TableRow key={repair.id}>
                                                <TableCell className="font-mono">#{repair.ticket_number}</TableCell>
                                                <TableCell>{repair.device_model}</TableCell>
                                                <TableCell className="max-w-[200px] truncate">{repair.issue_reported}</TableCell>
                                                <TableCell>{new Date(repair.created_at).toLocaleDateString()}</TableCell>
                                                <TableCell>
                                                    <Badge variant={
                                                        repair.status === 'delivered' ? 'default' :
                                                            repair.status === 'approved' ? 'default' :
                                                                'secondary'
                                                    }>
                                                        {translatedStatus(repair.status)}
                                                    </Badge>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}

function translatedStatus(status: string) {
    const map: Record<string, string> = {
        'received': 'Recibido',
        'diagnosing': 'Diagnosticando',
        'waiting_parts': 'Esperando Repuestos',
        'approved': 'Aprobado',
        'repaired': 'Reparado',
        'delivered': 'Entregado'
    };
    return map[status] || status;
}
