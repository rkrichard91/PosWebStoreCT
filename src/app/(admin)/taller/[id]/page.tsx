"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { ArrowLeft, Save, Printer, UserPlus } from "lucide-react";
import { Repair } from "@/types";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatCurrency } from "@/lib/utils";
import { MultiImageUpload } from "@/components/admin/multi-image-upload";

export default function RepairDetailPage() {
    const params = useParams();
    const router = useRouter();
    const id = params?.id as string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const supabase = createClient() as any;

    const [repair, setRepair] = useState<Repair | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Form states
    const [diagnosis, setDiagnosis] = useState("");
    const [costService, setCostService] = useState("0");
    const [costParts, setCostParts] = useState("0");
    const [status, setStatus] = useState("received");
    const [evidencePhotos, setEvidencePhotos] = useState<string[]>([]);
    const [technicianId, setTechnicianId] = useState<string | null>(null);

    useEffect(() => {
        const fetchRepair = async () => {
            const { data } = await supabase.from('repairs').select('*').eq('id', id).single();
            if (data) {
                setRepair(data);
                // Init form
                setDiagnosis(data.diagnosis || "");
                setCostService(data.cost_service?.toString() || "0");
                setCostParts(data.cost_parts?.toString() || "0");
                setStatus(data.status || "received");
                setEvidencePhotos(data.evidence_photos || []);
                setTechnicianId(data.technician_id);
            }
            setLoading(false);
        }

        if (id) fetchRepair();
    }, [id, supabase]);

    const handleSave = async () => {
        setSaving(true);
        const { error } = await supabase
            .from('repairs')
            .update({
                diagnosis,
                cost_service: parseFloat(costService) || 0,
                cost_parts: parseFloat(costParts) || 0,
                status: status,
                evidence_photos: evidencePhotos,
                technician_id: technicianId,
                updated_at: new Date().toISOString()
            })
            .eq('id', id);

        if (error) {
            toast.error("Error al guardar");
        } else {
            toast.success("Actualizado correctamente");
        }
        setSaving(false);
    }

    const handleAssignToMe = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
            setTechnicianId(user.id);
            toast.success("Te has asignado este ticket");
        }
    }

    if (loading) return <div className="p-8">Cargando ticket...</div>;
    if (!repair) return <div className="p-8">Ticket no encontrado</div>;

    const total = (parseFloat(costService) || 0) + (parseFloat(costParts) || 0);

    return (
        <div className="max-w-4xl mx-auto py-6 space-y-6">
            <div className="flex flex-col sm:flex-row items-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => router.back()}>
                    <ArrowLeft className="h-5 w-5" />
                </Button>
                <div>
                    <h1 className="text-2xl font-bold">Ticket #{repair?.ticket_number}</h1>
                    <p className="text-muted-foreground">{repair?.device_model} - {repair?.customer_name}</p>
                </div>
                <div className="sm:ml-auto flex gap-2">
                    <Button variant="outline" onClick={() => router.push(`/taller/${id}/print`)}>
                        <Printer className="mr-2 h-4 w-4" />
                        Imprimir
                    </Button>
                    <Button onClick={handleSave} disabled={saving}>
                        <Save className="mr-2 h-4 w-4" />
                        {saving ? "Guardando..." : "Guardar Cambios"}
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Left: Status & Diagnosis */}
                <div className="md:col-span-2 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Diagnóstico y Estado</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label>Problema Reportado</Label>
                                <div className="p-3 bg-muted rounded-md text-sm">
                                    {repair.issue_reported}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label>Informe Técnico / Diagnóstico</Label>
                                <Textarea
                                    className="min-h-[150px]"
                                    placeholder="Detalle el trabajo realizado o el diagnóstico..."
                                    value={diagnosis}
                                    onChange={(e) => setDiagnosis(e.target.value)}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label>Fotos de Evidencia</Label>
                                <MultiImageUpload
                                    value={evidencePhotos}
                                    onChange={setEvidencePhotos}
                                    disabled={saving}
                                />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Estado del Trabajo</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label>Estado Actual</Label>
                                <Select value={status} onValueChange={setStatus}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="received">Recibido</SelectItem>
                                        <SelectItem value="diagnosing">Diagnosticando</SelectItem>
                                        <SelectItem value="waiting_parts">Esperando Repuestos</SelectItem>
                                        <SelectItem value="approved">Aprobado / Reparando</SelectItem>
                                        <SelectItem value="repaired">Reparado (Listo para retiro)</SelectItem>
                                        <SelectItem value="delivered">Entregado y Cobrado</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="flex items-center justify-between p-3 border rounded-lg bg-slate-50 dark:bg-slate-900/50">
                                <div className="space-y-0.5">
                                    <Label className="text-base">Técnico Asignado</Label>
                                    <div className="text-sm text-muted-foreground">
                                        {technicianId ?
                                            (technicianId === repair.technician_id ? "Asignado actualmente" : "Pendiente de guardar")
                                            : "Sin asignar"}
                                    </div>
                                </div>
                                <Button variant="secondary" size="sm" onClick={handleAssignToMe}>
                                    <UserPlus className="mr-2 h-4 w-4" />
                                    Asignarme a mí
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Right: Costs & Info */}
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Presupuesto</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label>Mano de Obra</Label>
                                <Input
                                    type="number"
                                    value={costService}
                                    onChange={(e) => setCostService(e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Repuestos</Label>
                                <Input
                                    type="number"
                                    value={costParts}
                                    onChange={(e) => setCostParts(e.target.value)}
                                />
                            </div>
                            <div className="pt-4 border-t flex justify-between items-center font-bold text-lg">
                                <span>Total</span>
                                <span>{formatCurrency(total)}</span>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Datos Cliente</CardTitle>
                        </CardHeader>
                        <CardContent className="text-sm space-y-2">
                            <div>
                                <span className="font-semibold block">Nombre:</span>
                                {repair.customer_name}
                            </div>
                            <div>
                                <span className="font-semibold block">Contacto:</span>
                                {repair.customer_contact}
                            </div>
                            <div>
                                <span className="font-semibold block">Serial:</span>
                                <span className="font-mono">{repair.serial_number}</span>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
