'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Search, Wrench, CheckCircle2, Clock, Smartphone } from 'lucide-react';
import { checkRepairStatus } from './actions';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/lib/utils'; // Assuming this utility exists

export default function CheckRepairPage() {
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<any>(null);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        setResult(null);

        const formData = new FormData(e.currentTarget);
        const response = await checkRepairStatus(formData);

        if (response.error) {
            toast.error(response.error);
        } else if (response.success) {
            setResult(response.data);
            toast.success("Ticket encontrado");
        }
        setLoading(false);
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'received': return 'bg-blue-500';
            case 'diagnosing': return 'bg-yellow-500';
            case 'waiting_parts': return 'bg-orange-500';
            case 'approved': return 'bg-purple-500';
            case 'repaired': return 'bg-green-500';
            case 'delivered': return 'bg-gray-500';
            default: return 'bg-slate-500';
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'received': return 'Recibido';
            case 'diagnosing': return 'En Diagnóstico';
            case 'waiting_parts': return 'Esperando Repuestos';
            case 'approved': return 'Aprobado';
            case 'repaired': return 'Reparado';
            case 'delivered': return 'Entregado';
            default: return status;
        }
    };

    return (
        <div className="container py-10 flex flex-col items-center min-h-[60vh] gap-8">
            <div className="text-center space-y-2">
                <h1 className="text-3xl font-bold tracking-tight">Consulta tu Reparación</h1>
                <p className="text-muted-foreground">
                    Ingresa tu número de ticket y el contacto (email o teléfono) que dejaste en tienda.
                </p>
            </div>

            <Card className="w-full max-w-md">
                <form onSubmit={handleSubmit}>
                    <CardHeader>
                        <CardTitle>Buscar Ticket</CardTitle>
                        <CardDescription>
                            Tus datos están seguros. Solo tú puedes ver el estado.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="ticketNumber">Número de Ticket</Label>
                            <Input
                                id="ticketNumber"
                                name="ticketNumber"
                                placeholder="Ej: 1042"
                                type="number"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="contact">Email o Teléfono</Label>
                            <Input
                                id="contact"
                                name="contact"
                                placeholder="Tu contacto registrado"
                                required
                            />
                        </div>
                    </CardContent>
                    <CardFooter>
                        <Button className="w-full" type="submit" disabled={loading}>
                            {loading ? (
                                <span className="flex items-center gap-2">Buscando...</span>
                            ) : (
                                <span className="flex items-center gap-2">
                                    <Search className="h-4 w-4" /> Consultar Estado
                                </span>
                            )}
                        </Button>
                    </CardFooter>
                </form>
            </Card>

            {result && (
                <Card className="w-full max-w-md border-primary/20 bg-primary/5 animate-in fade-in slide-in-from-bottom-4">
                    <CardHeader className="pb-2">
                        <div className="flex justify-between items-start">
                            <div>
                                <CardTitle className="text-xl flex items-center gap-2">
                                    <Wrench className="h-5 w-5" />
                                    Ticket #{result.ticket_number}
                                </CardTitle>
                                <CardDescription className="flex items-center gap-1 mt-1">
                                    <Smartphone className="h-3 w-3" />
                                    {result.device_model}
                                </CardDescription>
                            </div>
                            <Badge className={getStatusColor(result.status)}>
                                {getStatusLabel(result.status)}
                            </Badge>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                                <span className="text-muted-foreground block text-xs uppercase tracking-wider">Fecha Ingreso</span>
                                <span className="font-medium flex items-center gap-1">
                                    <Clock className="h-3 w-3" />
                                    {new Date(result.created_at).toLocaleDateString()}
                                </span>
                            </div>
                            <div>
                                <span className="text-muted-foreground block text-xs uppercase tracking-wider">Total Estimado</span>
                                <span className="font-medium">{formatCurrency(result.total || 0)}</span>
                            </div>
                        </div>

                        {result.diagnosis && (
                            <div className="rounded-md bg-background/50 p-3 border text-sm">
                                <span className="text-muted-foreground block text-xs uppercase tracking-wider mb-1">Diagnóstico / Notas:</span>
                                <p>{result.diagnosis}</p>
                            </div>
                        )}

                        {result.status === 'repaired' && (
                            <div className="rounded-md bg-green-500/10 border-green-500/20 border p-3 flex items-start gap-3 text-sm text-green-700 dark:text-green-400">
                                <CheckCircle2 className="h-5 w-5 mt-0.5" />
                                <div>
                                    <p className="font-semibold">¡Tu equipo está listo!</p>
                                    <p>Puedes pasar a retirarlo en nuestro horario de atención.</p>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
