"use client"

import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MoreHorizontal } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { Product } from "./columns"
import { useState } from "react"
import { ProductSheet } from "@/components/admin/product-sheet"

interface ActionCellProps {
    product: Product
}

export function ActionCell({ product }: ActionCellProps) {
    const router = useRouter()
    const supabase = createClient()
    const [isEditOpen, setIsEditOpen] = useState(false)

    const onDelete = async () => {
        const confirmed = window.confirm("¿Estás seguro de eliminar este producto? Esta acción no se puede deshacer.")
        if (!confirmed) return

        const { error } = await supabase.from('products').delete().eq('id', product.id)

        if (error) {
            toast.error("Error al eliminar producto", { description: error.message })
        } else {
            toast.success("Producto eliminado")
            router.refresh()
        }
    }

    const onCopyId = () => {
        navigator.clipboard.writeText(product.id)
        toast.success("ID copiado al portapapeles")
    }

    return (
        <>
            <ProductSheet open={isEditOpen} onOpenChange={setIsEditOpen} product={product} />
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Abrir menú</span>
                        <MoreHorizontal className="h-4 w-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                    <DropdownMenuItem onClick={onCopyId}>
                        Copiar ID del producto
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => setIsEditOpen(true)}>
                        Editar detalles
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-destructive font-medium" onClick={onDelete}>
                        Eliminar producto
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </>
    )
}
