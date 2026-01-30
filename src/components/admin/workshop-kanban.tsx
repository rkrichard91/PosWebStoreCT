
"use client";

import { useEffect, useState } from "react";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import { Repair } from "@/types";
import Link from "next/link";

const COLUMNS = [
    { id: 'received', title: 'Recibido', color: 'bg-gray-100 dark:bg-gray-800' },
    { id: 'diagnosing', title: 'Diagnosticando', color: 'bg-blue-100 dark:bg-blue-900/20' },
    { id: 'waiting_parts', title: 'Esperando Repuesto', color: 'bg-yellow-100 dark:bg-yellow-900/20' },
    { id: 'approved', title: 'Aprobado', color: 'bg-purple-100 dark:bg-purple-900/20' },
    { id: 'repaired', title: 'Reparado', color: 'bg-green-100 dark:bg-green-900/20' },
    { id: 'delivered', title: 'Entregado', color: 'bg-slate-200 dark:bg-slate-800' },
];

export default function WorkshopKanban() {
    const [repairs, setRepairs] = useState<Repair[]>([]);
    const supabase = createClient();

    const fetchRepairs = async () => {
        const { data } = await supabase.from('repairs').select('*').order('created_at', { ascending: false });
        if (data) setRepairs(data);
    };

    useEffect(() => {
        fetchRepairs();

        // Realtime subscription
        const channel = supabase
            .channel('repairs_changes')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'repairs' }, () => {
                fetchRepairs();
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const onDragEnd = async (result: DropResult) => {
        const { destination, source, draggableId } = result;

        if (!destination) return;
        if (destination.droppableId === source.droppableId && destination.index === source.index) return;

        const newStatus = destination.droppableId;

        // Optimistic update
        const updatedRepairs = repairs.map(r =>
            r.id === draggableId ? { ...r, status: newStatus as Repair['status'] } : r
        );
        setRepairs(updatedRepairs);

        // Persist
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (supabase.from('repairs') as any).update({ status: newStatus }).eq('id', draggableId);
    };

    return (
        <div className="h-full flex flex-col">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold tracking-tight">Taller de Reparaciones</h1>
                <Button asChild>
                    <Link href="/taller/new">
                        <Plus className="mr-2 h-4 w-4" /> Nuevo Ticket
                    </Link>
                </Button>
            </div>

            <div className="flex-1 overflow-x-auto min-h-0 pb-4">
                <DragDropContext onDragEnd={onDragEnd}>
                    <div className="flex gap-4 min-w-max h-full">
                        {COLUMNS.map((col) => (
                            <div key={col.id} className={`w-80 flex flex-col rounded-lg p-2 ${col.color}`}>
                                <h3 className="font-semibold text-sm mb-3 px-2 flex justify-between uppercase text-muted-foreground tracking-wider">
                                    {col.title}
                                    <Badge variant="secondary" className="bg-background/50">
                                        {repairs.filter(r => r.status === col.id).length}
                                    </Badge>
                                </h3>

                                <Droppable droppableId={col.id}>
                                    {(provided) => (
                                        <div
                                            {...provided.droppableProps}
                                            ref={provided.innerRef}
                                            className="flex-1 space-y-3 overflow-y-auto min-h-[100px]"
                                        >
                                            {repairs
                                                .filter(r => r.status === col.id)
                                                .map((repair, index) => (
                                                    <Draggable key={repair.id} draggableId={repair.id} index={index}>
                                                        {(provided) => (
                                                            <Card
                                                                ref={provided.innerRef}
                                                                {...provided.draggableProps}
                                                                {...provided.dragHandleProps}
                                                                className="shadow-sm hover:shadow-md transition-shadow cursor-grab active:cursor-grabbing"
                                                            >
                                                                <CardContent className="p-3 space-y-2">
                                                                    <div className="flex justify-between items-start">
                                                                        <span className="font-bold text-sm">#{repair.ticket_number}</span>
                                                                        <span className="text-xs text-muted-foreground">
                                                                            {formatDistanceToNow(new Date(repair.created_at), { addSuffix: true, locale: es })}
                                                                        </span>
                                                                    </div>
                                                                    <div>
                                                                        <p className="font-semibold text-sm line-clamp-1">{repair.customer_name}</p>
                                                                        <p className="text-xs text-muted-foreground line-clamp-1">{repair.device_model}</p>
                                                                    </div>
                                                                    <div className="text-xs bg-muted p-1 rounded">
                                                                        {repair.issue_reported || 'Sin descripción'}
                                                                    </div>
                                                                    <div className="flex justify-end">
                                                                        <Link href={`/taller/${repair.id}`}>
                                                                            <Button variant="ghost" size="sm" className="h-6 text-xs">Ver detalle</Button>
                                                                        </Link>
                                                                    </div>
                                                                </CardContent>
                                                            </Card>
                                                        )}
                                                    </Draggable>
                                                ))}
                                            {provided.placeholder}
                                        </div>
                                    )}
                                </Droppable>
                            </div>
                        ))}
                    </div>
                </DragDropContext>
            </div>
        </div>
    );
}
