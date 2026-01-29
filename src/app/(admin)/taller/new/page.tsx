"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";

// Schema
const repairSchema = z.object({
    customer_name: z.string().min(2, "Nombre requerido"),
    customer_contact: z.string().min(6, "Contacto requerido"),
    device_model: z.string().min(2, "Modelo requerido"),
    serial_number: z.string().min(1, "Serial requerido"),
    issue_reported: z.string().min(5, "Descripción del problema requerida"),
});

export default function NewRepairPage() {
    const router = useRouter();
    const supabase = createClient() as any;

    const form = useForm<z.infer<typeof repairSchema>>({
        resolver: zodResolver(repairSchema),
        defaultValues: {
            customer_name: "",
            customer_contact: "",
            device_model: "",
            serial_number: "",
            issue_reported: "",
        },
    });

    async function onSubmit(values: z.infer<typeof repairSchema>) {
        // 1. Insert, ticket_number is serial so auto-generated
        const { data, error } = await supabase
            .from('repairs')
            .insert([{
                ...values,
                status: 'received',
                // technician_id could be current auth user
            }])
            .select()
            .single();

        if (error) {
            toast.error("Error al crear ticket");
            console.error(error);
            return;
        }

        toast.success(`Ticket #${data.ticket_number} creado`);
        router.push('/taller');
    }

    return (
        <div className="max-w-2xl mx-auto py-8">
            <Button variant="ghost" className="mb-4 pl-0" onClick={() => router.back()}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Volver
            </Button>

            <Card>
                <CardHeader>
                    <CardTitle>Ingreso de Equipo a Taller</CardTitle>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="customer_name"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Cliente</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Nombre Completo" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="customer_contact"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Contacto (Tel/Email)</FormLabel>
                                            <FormControl>
                                                <Input placeholder="+56 9 ..." {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="device_model"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Equipo / Modelo</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Ej: Notebook HP Victus" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="serial_number"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Número de Serie</FormLabel>
                                            <FormControl>
                                                <Input placeholder="S/N" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <FormField
                                control={form.control}
                                name="issue_reported"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Falla Reportada</FormLabel>
                                        <FormControl>
                                            <Textarea
                                                placeholder="El cliente indica que..."
                                                className="min-h-[100px]"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <div className="flex justify-end pt-4">
                                <Button type="submit">Generar Ticket</Button>
                            </div>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </div>
    );
}
