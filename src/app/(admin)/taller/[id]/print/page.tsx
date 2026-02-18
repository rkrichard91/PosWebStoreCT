"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Repair } from "@/types";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Printer } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";

export default function RepairPrintPage() {
    const params = useParams();
    const router = useRouter();
    const id = params?.id as string;
    const supabase = createClient();

    const [repair, setRepair] = useState<Repair | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchRepair = async () => {
            const { data } = await supabase.from('repairs').select('*').eq('id', id).single();
            if (data) {
                setRepair(data);
            }
            setLoading(false);
        }

        if (id) fetchRepair();
    }, [id, supabase]);


    if (loading) return <div className="p-8">Cargando ticket...</div>;
    if (!repair) return <div className="p-8">Ticket no encontrado</div>;

    return (
        <div className="bg-white min-h-screen p-8 text-black">
            {/* Header / Actions - Hidden on Print */}
            <div className="print:hidden flex justify-between mb-8 max-w-[21cm] mx-auto">
                <Button variant="outline" onClick={() => router.back()}>
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Volver
                </Button>
                <Button onClick={() => window.print()}>
                    <Printer className="mr-2 h-4 w-4" />
                    Imprimir
                </Button>
            </div>

            {/* Ticket Layout - A4 / Thermal adaptable */}
            <div className="max-w-[21cm] mx-auto border p-8 print:border-0 print:p-0">
                {/* Header */}
                <div className="flex justify-between items-start mb-8 pb-4 border-b-2 border-black">
                    <div>
                        <h1 className="text-2xl font-bold uppercase tracking-wider">Center Tecno</h1>
                        <p className="text-sm mt-1">Servicio Técnico Especializado</p>
                        <p className="text-sm">Mucho Lote 2, Urb. Valle Victoria</p>
                        <p className="text-sm">Mz 2841 V1, Local 7, Guayaquil</p>
                        <p className="text-sm">Tel: +593 99 809 4487</p>
                        <p className="text-sm">admin@center-tecno.com</p>
                    </div>
                    <div className="text-right">
                        <div className="text-4xl font-bold mb-2">#{repair.ticket_number}</div>
                        <p className="text-sm font-medium">
                            Fecha: {format(new Date(repair.created_at), "dd/MM/yyyy HH:mm", { locale: es })}
                        </p>
                    </div>
                </div>

                {/* Customer Info */}
                <div className="mb-6">
                    <h2 className="text-sm font-bold uppercase bg-gray-100 p-1 mb-2 border-y border-black">Datos del Cliente</h2>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                            <span className="font-semibold">Nombre:</span> {repair.customer_name}
                        </div>
                        <div>
                            <span className="font-semibold">Contacto:</span> {repair.customer_contact}
                        </div>
                    </div>
                </div>

                {/* Device Info */}
                <div className="mb-6">
                    <h2 className="text-sm font-bold uppercase bg-gray-100 p-1 mb-2 border-y border-black">Datos del Equipo</h2>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                            <span className="font-semibold">Modelo/Equipo:</span> {repair.device_model}
                        </div>
                        <div>
                            <span className="font-semibold">N° Serie:</span> {repair.serial_number}
                        </div>
                    </div>
                </div>

                {/* Issue Reported */}
                <div className="mb-8">
                    <h2 className="text-sm font-bold uppercase bg-gray-100 p-1 mb-2 border-y border-black">Falla Reportada / Solicitud</h2>
                    <div className="p-2 border border-dashed border-gray-300 min-h-[80px] text-sm">
                        {repair.issue_reported}
                    </div>
                </div>

                {/* Terms */}
                <div className="text-[10px] space-y-1 text-gray-600 mb-12 text-justify">
                    <p><strong>Términos y Condiciones:</strong></p>
                    <p>1. CENTER TECNO no se hace responsable por la pérdida de información. Se recomienda al cliente realizar copias de seguridad antes de ingresar el equipo.</p>
                    <p>2. Equipos no retirados dentro de 90 días corridos desde la notificación de reparación/diagnóstico serán considerados abandonados.</p>
                    <p>3. El diagnóstico tiene un costo base si el cliente rechaza el presupuesto de reparación.</p>
                    <p>4. La garantía cubre únicamente la falla reparada y los repuestos cambiados por un periodo de 3 meses.</p>
                </div>

                {/* Signatures */}
                <div className="grid grid-cols-2 gap-16 mt-16 text-center text-sm">
                    <div className="border-t border-black pt-2">
                        <p>Firma Cliente</p>
                        <p className="text-xs text-muted-foreground">Acepto términos y condiciones</p>
                    </div>
                    <div className="border-t border-black pt-2">
                        <p>Firma Recepción</p>
                        <p className="text-xs text-muted-foreground">Center Tecno</p>
                    </div>
                </div>

                <div className="mt-12 text-center text-xs">
                    <p>Revise el estado de su ticket en: <strong>center-tecno.com/estado</strong></p>
                </div>
            </div>
        </div>
    );
}
