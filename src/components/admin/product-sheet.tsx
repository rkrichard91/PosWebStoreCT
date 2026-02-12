"use client"

import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet"
import { ProductForm, ProductFormValues } from "./product-form"
import { Product } from "@/app/(admin)/inventory/columns"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { useState } from "react"

interface ProductSheetProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    product: Product
}

export function ProductSheet({ open, onOpenChange, product }: ProductSheetProps) {
    const [loading, setLoading] = useState(false)
    const router = useRouter()
    const supabase = createClient()

    const initialData: ProductFormValues = {
        sku: product.sku,
        name: product.name,
        slug: product.slug,
        category: product.category as "cpu" | "motherboard" | "ram" | "gpu" | "storage" | "psu" | "case" | "monitor" | "peripheral",
        description: product.description || "",
        price_public: product.price_public,
        price_cash: product.price_cash,
        cost_price: product.cost_price || 0,
        invoice_cost: product.invoice_cost || null,
        iva_on_purchase: product.iva_on_purchase ?? true,
        stock_physical: product.stock_physical,
        min_stock_alert: product.min_stock_alert || 2,
        image_url: product.image_url || "",
        is_active: product.is_active,
        specs: product.specs || {},
    }

    const onSubmit = async (values: ProductFormValues) => {
        setLoading(true)

        const productData = {
            sku: values.sku,
            name: values.name,
            slug: values.slug,
            category: values.category,
            description: values.description || null,
            price_public: values.price_public,
            price_cash: values.price_cash,
            cost_price: values.cost_price,
            invoice_cost: values.invoice_cost || null,
            iva_on_purchase: values.iva_on_purchase,
            stock_physical: values.stock_physical,
            min_stock_alert: values.min_stock_alert,
            image_url: values.image_url || null,
            is_active: values.is_active,
            specs: values.specs || {},
            updated_at: new Date().toISOString()
        }

        const { error } = await (supabase
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            .from('products') as any)
            .update(productData)
            .eq('id', product.id)

        setLoading(false)

        if (error) {
            console.error(error)
            toast.error(`Error al actualizar producto: ${error.message}`)
        } else {
            toast.success("Producto actualizado exitosamente")
            onOpenChange(false)
            router.refresh()
        }
    }

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="sm:max-w-xl overflow-y-auto w-full">
                <SheetHeader>
                    <SheetTitle>Editar Producto</SheetTitle>
                    <SheetDescription>
                        Realiza cambios en los detalles del producto aquí.
                    </SheetDescription>
                </SheetHeader>
                <div className="py-4">
                    <ProductForm
                        initialData={initialData}
                        onSubmit={onSubmit}
                        isLoading={loading}
                    />
                </div>
            </SheetContent>
        </Sheet>
    )
}
