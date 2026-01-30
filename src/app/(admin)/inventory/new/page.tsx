"use client"

import { ProductForm, ProductFormValues } from "@/components/admin/product-form"
import { toast } from "sonner"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { useState } from "react"

export default function NewProductPage() {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const supabase = createClient() as any // Cast to any to bypass Database Generic issues

    const handleSubmit = async (values: ProductFormValues) => {
        setLoading(true)

        const productData = {
            sku: values.sku,
            name: values.name,
            slug: values.slug,
            category: values.category,
            description: values.description || null,
            price_public: values.price_public,
            price_cash: values.price_cash,
            cost_price: values.cost_price || 0,
            stock_physical: values.stock_physical,
            min_stock_alert: values.min_stock_alert,
            image_url: values.image_url || null,
            is_active: values.is_active,
            specs: {},
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        }

        const { error } = await supabase.from('products').insert([productData])

        setLoading(false)

        if (error) {
            console.error(error)
            toast.error(`Error al crear producto: ${error.message}`)
        } else {
            toast.success("Producto creado exitosamente")
            router.push("/inventory")
            router.refresh()
        }
    }

    return (
        <div className="container max-w-2xl mx-auto py-10">
            <h1 className="text-3xl font-bold tracking-tight mb-6">Nuevo Producto</h1>
            <ProductForm onSubmit={handleSubmit} isLoading={loading} />
        </div>
    )
}
