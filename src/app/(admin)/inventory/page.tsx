
import { columns } from "./columns"
import { DataTable } from "./data-table"
import { Button } from "@/components/ui/button"
import { PlusCircle } from "lucide-react"
import Link from "next/link"
import { createClient } from "@/lib/supabase/server"

async function getData() {
    const supabase = await createClient()
    const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false })

    if (error) {
        console.error("Error fetching products:", error)
        return []
    }

    return data || []
}

export default async function InventoryPage() {
    const data = await getData()

    return (
        <section className="container mx-auto py-10 space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold tracking-tight">Inventario</h1>
                <Button asChild>
                    <Link href="/inventory/new">
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Agregar Producto
                    </Link>
                </Button>
            </div>
            <DataTable columns={columns} data={data} />
        </section>
    )
}
