"use client"

import { ProductForm, ProductFormValues } from "@/components/admin/product-form"
import { toast } from "sonner"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { useParams } from "next/navigation"

export default function EditProductPage() {
    const router = useRouter()
    const params = useParams()
    // Handle array or string param safely
    const id = Array.isArray(params.id) ? params.id[0] : params.id

    const [loading, setLoading] = useState(false)
    const [initialData, setInitialData] = useState<ProductFormValues | undefined>(undefined)
    const [fetching, setFetching] = useState(true)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const supabase = createClient() as any // Cast to any to bypass Database Generic issues

    useEffect(() => {
        const fetchProduct = async () => {
            if (!id) return

            const { data, error } = await supabase
                .from('products')
                .select('*')
                .eq('id', id)
                .single()

            if (error) {
                console.error(error)
                toast.error("Error al cargar producto")
                router.push('/inventory')
                return
            }

            if (data) {
                setInitialData({
                    sku: data.sku,
                    name: data.name,
                    slug: data.slug,
                    category: data.category,
                    description: data.description || "",
                    price_public: data.price_public,
                    price_cash: data.price_cash,
                    cost_price: data.cost_price || 0,
                    invoice_cost: data.invoice_cost || null,
                    iva_on_purchase: data.iva_on_purchase ?? true,
                    stock_physical: data.stock_physical,
                    min_stock_alert: data.min_stock_alert,
                    image_url: data.image_url || "",
                    is_active: data.is_active,
                })
            }
            setFetching(false)
        }

        fetchProduct()
    }, [id, router, supabase])

    const handleSubmit = async (values: ProductFormValues) => {
        if (!id) return
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
            updated_at: new Date().toISOString()
        }

        const { error } = await supabase
            .from('products')
            .update(productData)
            .eq('id', id)

        setLoading(false)

        if (error) {
            console.error(error)
            toast.error(`Error al actualizar producto: ${error.message}`)
        } else {
            toast.success("Producto actualizado exitosamente")
            router.push("/inventory")
            router.refresh()
        }
    }

    if (fetching) {
        return <div className="container py-10">Cargando datos del producto...</div>
    }

    return (
        <div className="container max-w-2xl mx-auto py-10">
            <h1 className="text-3xl font-bold tracking-tight mb-6">Editar Producto</h1>
            <ProductForm initialData={initialData} onSubmit={handleSubmit} isLoading={loading} />
        </div>
    )
}
