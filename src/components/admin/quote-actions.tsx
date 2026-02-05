"use client";

import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, FileEdit, Trash, Printer, ShoppingCart } from "lucide-react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface QuoteActionsProps {
    quoteId: string;
}

export function QuoteActions({ quoteId }: QuoteActionsProps) {
    const router = useRouter();
    const supabase = createClient();

    const handleDelete = async () => {
        if (!confirm("¿Estás seguro de eliminar esta cotización?")) return;

        const { error } = await supabase
            .from("orders")
            .delete()
            .eq("id", quoteId);

        if (error) {
            toast.error("Error al eliminar cotización");
            console.error(error);
        } else {
            toast.success("Cotización eliminada");
            router.refresh();
        }
    };

    // TODO: Implement "Convert to Sale" server action or logic
    const handleConvertToSale = async () => {
        const { error } = await supabase
            .from("orders")
            .update({ status: 'pending' } as any) // Move to pending (sale)
            .eq("id", quoteId);

        if (error) {
            toast.error("Error al convertir a venta");
        } else {
            toast.success("Cotización convertida a venta");
            router.refresh();
        }
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                    <span className="sr-only">Abrir menú</span>
                    <MoreHorizontal className="h-4 w-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                <DropdownMenuItem asChild>
                    <Link href={`/quotes/${quoteId}`}>
                        <FileEdit className="mr-2 h-4 w-4" />
                        Ver / Editar
                    </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                    {/* Assuming a print route exists or will be created */}
                    <Link href={`/quotes/${quoteId}/print`} target="_blank">
                        <Printer className="mr-2 h-4 w-4" />
                        Imprimir
                    </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleConvertToSale}>
                    <ShoppingCart className="mr-2 h-4 w-4" />
                    Convertir a Venta
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleDelete} className="text-red-600 focus:text-red-600">
                    <Trash className="mr-2 h-4 w-4" />
                    Eliminar
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
