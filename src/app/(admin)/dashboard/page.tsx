import { createClient } from "@/lib/supabase/server";
import { formatCurrency } from "@/lib/utils";
import { 
    Card, 
    CardContent, 
    CardHeader, 
    CardTitle, 
    CardDescription 
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { OverviewChart } from "./dashboard-charts";
import { 
    DollarSign, 
    Wrench, 
    AlertTriangle, 
    ShoppingCart 
} from "lucide-react";
import Link from "next/link";

export default async function DashboardPage() {
    const supabase = await createClient();

    // Fetch Key Metrics concurrently
    const [
        { data: ordersData },
        { data: repairsData },
        { data: productsData }
    ] = await Promise.all([
        supabase.from('orders').select('total, created_at, status'),
        supabase.from('repairs').select('id, ticket_number, customer_name, status, device_model').neq('status', 'delivered').order('created_at', { ascending: false }).limit(5),
        supabase.from('products').select('id, name, stock_physical, min_stock_alert').order('stock_physical', { ascending: true })
    ]);

    // Calculate metrics
    const totalRevenue = ordersData?.reduce((acc, order) => acc + (order.total || 0), 0) || 0;
    const salesCount = ordersData?.length || 0;
    const activeRepairsCount = repairsData?.length || 0;
    
    const lowStockProducts = productsData?.filter(p => p.stock_physical <= p.min_stock_alert) || [];
    const lowStockCount = lowStockProducts.length;

    // Process data for the chart (group sales by month or last 7 days)
    // For simplicity, we'll generate some dummy data for the chart if no orders exist,
    // otherwise group them by date.
    
    let chartData: { name: string; total: number }[] = [];
    
    if (ordersData && ordersData.length > 0) {
        // Group by day name (very simplified)
        const days = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
        const grouped: Record<string, number> = {};
        
        ordersData.forEach(order => {
            if (order.created_at) {
                const date = new Date(order.created_at);
                const dayName = days[date.getDay()];
                grouped[dayName] = (grouped[dayName] || 0) + (order.total || 0);
            }
        });

        chartData = Object.entries(grouped).map(([name, total]) => ({ name, total }));
    } else {
        // Dummy data for visual presentation if DB is empty
        chartData = [
            { name: "Lun", total: 0 },
            { name: "Mar", total: 0 },
            { name: "Mié", total: 0 },
            { name: "Jue", total: 0 },
            { name: "Vie", total: 0 },
            { name: "Sáb", total: 0 },
            { name: "Dom", total: 0 },
        ];
    }

    return (
        <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold tracking-tight">Dashboard Analítico</h1>
                <p className="text-muted-foreground">
                    Resumen general de ventas, reparaciones e inventario.
                </p>
            </div>

            {/* KPI Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card className="glass-card hover-3d transition-transform">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Ingresos Totales</CardTitle>
                        <div className="bg-primary/10 p-2 rounded-full">
                            <DollarSign className="h-4 w-4 text-primary" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatCurrency(totalRevenue)}</div>
                        <p className="text-xs text-muted-foreground">Histórico de ventas</p>
                    </CardContent>
                </Card>
                
                <Card className="glass-card hover-3d transition-transform">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Ventas Realizadas</CardTitle>
                        <div className="bg-blue-500/10 p-2 rounded-full">
                            <ShoppingCart className="h-4 w-4 text-blue-500" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">+{salesCount}</div>
                        <p className="text-xs text-muted-foreground">Tickets emitidos</p>
                    </CardContent>
                </Card>

                <Card className="glass-card hover-3d transition-transform">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Reparaciones Activas</CardTitle>
                        <div className="bg-orange-500/10 p-2 rounded-full">
                            <Wrench className="h-4 w-4 text-orange-500" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{activeRepairsCount}</div>
                        <p className="text-xs text-muted-foreground">En taller</p>
                    </CardContent>
                </Card>

                <Card className="glass-card hover-3d transition-transform">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Alertas de Stock</CardTitle>
                        <div className="bg-destructive/10 p-2 rounded-full">
                            <AlertTriangle className="h-4 w-4 text-destructive" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-destructive">{lowStockCount}</div>
                        <p className="text-xs text-muted-foreground">Productos por agotarse</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <Card className="col-span-4 glass-card">
                    <CardHeader>
                        <CardTitle>Rendimiento de Ventas</CardTitle>
                        <CardDescription>Resumen de ingresos por día.</CardDescription>
                    </CardHeader>
                    <CardContent className="pl-2">
                        <OverviewChart data={chartData} />
                    </CardContent>
                </Card>

                <Card className="col-span-3 glass-card flex flex-col">
                    <CardHeader>
                        <CardTitle>Reparaciones Recientes</CardTitle>
                        <CardDescription>Últimos equipos ingresados al taller.</CardDescription>
                    </CardHeader>
                    <CardContent className="flex-1">
                        {repairsData && repairsData.length > 0 ? (
                            <div className="space-y-4">
                                {repairsData.map(repair => (
                                    <div key={repair.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                                        <div className="space-y-1">
                                            <p className="text-sm font-medium leading-none">Ticket #{repair.ticket_number}</p>
                                            <p className="text-xs text-muted-foreground">{repair.device_model || 'Dispositivo'} - {repair.customer_name}</p>
                                        </div>
                                        <Badge variant={repair.status === 'repaired' ? 'default' : 'secondary'} className="capitalize">
                                            {repair.status === 'received' ? 'Recibido' : repair.status}
                                        </Badge>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground space-y-2 pb-8">
                                <div className="bg-muted p-3 rounded-full">
                                    <Wrench className="h-6 w-6 opacity-40" />
                                </div>
                                <p>No hay reparaciones activas.</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Alertas de Inventario Inferior */}
            {lowStockProducts && lowStockProducts.length > 0 && (
                <Card className="glass-card border-destructive/30">
                    <CardHeader>
                        <CardTitle className="text-destructive flex items-center gap-2">
                            <AlertTriangle className="h-5 w-5" />
                            Atención Requerida: Inventario Bajo
                        </CardTitle>
                        <CardDescription>
                            Los siguientes productos han alcanzado su límite mínimo de stock.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                            {lowStockProducts.slice(0, 8).map(product => (
                                <Link href="/inventory" key={product.id}>
                                    <div className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors group">
                                        <span className="text-sm font-medium truncate pr-2 group-hover:text-primary">{product.name}</span>
                                        <Badge variant="destructive">{product.stock_physical}</Badge>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
