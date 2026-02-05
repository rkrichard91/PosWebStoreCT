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

    // Convert to Sale: Load items into POS cart
    const handleConvertToSale = async () => {
        toast.loading("Cargando productos...");

        // 1. Fetch order items with product details
        const { data: items, error } = await supabase
            .from("order_items")
            .select(`
                *,
                products (*)
            `)
            .eq("order_id", quoteId);

        if (error || !items || items.length === 0) {
            toast.dismiss();
            toast.error("No se pudieron cargar los productos de la cotización");
            console.error(error);
            return;
        }

        // 2. Format items for POS cart (matching CartItem structure)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const cartItems = (items as any[]).map((item) => {
            const product = item.products as Record<string, unknown>;
            return {
                ...product,
                quantity: item.quantity,
            };
        });

        // 3. Store in localStorage for POS to pick up
        localStorage.setItem("pos_pending_quote", JSON.stringify({
            quoteId,
            items: cartItems
        }));

        toast.dismiss();
        toast.success("Redirigiendo al POS...");

        // 4. Navigate to POS
        router.push("/pos");
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
