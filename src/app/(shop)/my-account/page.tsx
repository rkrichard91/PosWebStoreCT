"use client";

import { useEffect, useState } from "react";
import { type User as SupabaseUser } from '@supabase/supabase-js';
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatCurrency } from "@/lib/utils";
import { Loader2, Package, Wrench, LogOut, ShoppingBag, Clock, CheckCircle2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

// Tipos locales
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
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-transparent animate__animated animate__fadeIn">
            {/* Header Section with Gradient */}
            <div className="relative bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border-b">
                <div className="container py-10 max-w-6xl">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div>
                            <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl text-foreground">
                                Mi Cuenta
                            </h1>
                            <p className="mt-2 text-lg text-muted-foreground">
                                Hola, <span className="font-semibold text-primary">{user?.user_metadata?.full_name || user?.email}</span>. Aquí tienes un resumen de tu actividad.
                            </p>
                        </div>
                        <Button variant="outline" onClick={handleLogout} className="hover:bg-destructive/10 hover:text-destructive hover:border-destructive/50 transition-colors">
                            <LogOut className="mr-2 h-4 w-4" /> Cerrar Sesión
                        </Button>
                    </div>
                </div>
            </div>

            <div className="container py-10 max-w-6xl space-y-8">
                {/* Stats Cards */}
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                    <Card className="hover:shadow-lg transition-all duration-300 border-primary/20 bg-card/50 backdrop-blur-sm">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Compras Totales</CardTitle>
                            <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center">
                                <ShoppingBag className="h-4 w-4 text-primary" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold">{orders.length}</div>
                            <p className="text-xs text-muted-foreground mt-1">
                                pedidos realizados
                            </p>
                        </CardContent>
                    </Card>
                    <Card className="hover:shadow-lg transition-all duration-300 border-indigo-500/20 bg-card/50 backdrop-blur-sm">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Reparaciones</CardTitle>
                            <div className="h-8 w-8 rounded-full bg-indigo-500/20 flex items-center justify-center">
                                <Wrench className="h-4 w-4 text-indigo-500" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold">{repairs.length}</div>
                            <p className="text-xs text-muted-foreground mt-1">
                                servicios técnicos
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Main Content Tabs */}
                <Tabs defaultValue="orders" className="w-full animate__animated animate__fadeInUp animate__delay-1s">
                    <div className="flex items-center justify-between mb-4">
                        <TabsList className="grid w-full max-w-[400px] grid-cols-2">
                            <TabsTrigger value="orders">Mis Compras</TabsTrigger>
                            <TabsTrigger value="repairs">Mis Reparaciones</TabsTrigger>
                        </TabsList>
                    </div>

                    <TabsContent value="orders" className="space-y-4">
                        <Card className="border-none shadow-md bg-card/60 backdrop-blur-sm">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Package className="h-5 w-5 text-primary" />
                                    Historial de Compras
                                </CardTitle>
                                <CardDescription>Visualiza tus compras realizadas en tienda y web.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Table>
                                    <TableHeader>
                                        <TableRow className="hover:bg-muted/50">
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
                                                <TableCell colSpan={5} className="text-center h-32 text-muted-foreground flex flex-col items-center justify-center">
                                                    <ShoppingBag className="h-8 w-8 mb-2 opacity-20" />
                                                    No tienes compras registradas.
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            orders.map((order) => (
                                                <TableRow key={order.id} className="cursor-pointer hover:bg-muted/50 transition-colors">
                                                    <TableCell className="font-mono font-medium text-primary">#{order.ticket_number}</TableCell>
                                                    <TableCell>{new Date(order.created_at).toLocaleDateString()}</TableCell>
                                                    <TableCell className="font-semibold">{formatCurrency(order.total)}</TableCell>
                                                    <TableCell className="capitalize">
                                                        <Badge variant="outline">{order.payment_method}</Badge>
                                                    </TableCell>
                                                    <TableCell>
                                                        <StatusBadge status={order.status} type="order" />
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        )}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="repairs" className="space-y-4">
                        <Card className="border-none shadow-md bg-card/60 backdrop-blur-sm">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Wrench className="h-5 w-5 text-indigo-500" />
                                    Estado de Reparaciones
                                </CardTitle>
                                <CardDescription>Seguimiento de tus equipos en servicio técnico.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Table>
                                    <TableHeader>
                                        <TableRow className="hover:bg-muted/50">
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
                                                <TableCell colSpan={5} className="text-center h-32 text-muted-foreground flex flex-col items-center justify-center">
                                                    <Wrench className="h-8 w-8 mb-2 opacity-20" />
                                                    No tienes reparaciones registradas.
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            repairs.map((repair) => (
                                                <TableRow key={repair.id} className="cursor-pointer hover:bg-muted/50 transition-colors">
                                                    <TableCell className="font-mono font-medium text-indigo-500">#{repair.ticket_number}</TableCell>
                                                    <TableCell className="font-medium">{repair.device_model}</TableCell>
                                                    <TableCell className="max-w-[200px] truncate text-muted-foreground">{repair.issue_reported}</TableCell>
                                                    <TableCell>{new Date(repair.created_at).toLocaleDateString()}</TableCell>
                                                    <TableCell>
                                                        <StatusBadge status={repair.status} type="repair" />
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
        </div>
    );
}

function StatusBadge({ status, type }: { status: string, type: 'order' | 'repair' }) {
    if (type === 'order') {
        return (
            <Badge variant={status === 'completed' ? 'default' : 'secondary'} className={status === 'completed' ? 'bg-green-500 hover:bg-green-600' : ''}>
                {status === 'completed' ? (
                    <span className="flex items-center gap-1"><CheckCircle2 className="h-3 w-3" /> Completado</span>
                ) : status}
            </Badge>
        );
    }

    // Repair Status Mapping
    const statusConfig: Record<string, { label: string, color: string, icon: any }> = {
        'received': { label: 'Recibido', color: 'bg-blue-500', icon: Clock },
        'diagnosing': { label: 'Diagnosticando', color: 'bg-yellow-500', icon: Wrench },
        'waiting_parts': { label: 'Esperando Repuestos', color: 'bg-orange-500', icon: Package },
        'approved': { label: 'Aprobado', color: 'bg-indigo-500', icon: CheckCircle2 },
        'repaired': { label: 'Reparado', color: 'bg-green-500', icon: CheckCircle2 },
        'delivered': { label: 'Entregado', color: 'bg-gray-500', icon: CheckCircle2 },
    };

    const config = statusConfig[status] || { label: status, color: 'bg-gray-400', icon: AlertCircle };
    const Icon = config.icon;

    return (
        <Badge className={`${config.color} hover:${config.color}/80 text-white border-none`}>
            <span className="flex items-center gap-1">
                <Icon className="h-3 w-3" /> {config.label}
            </span>
        </Badge>
    );
}
