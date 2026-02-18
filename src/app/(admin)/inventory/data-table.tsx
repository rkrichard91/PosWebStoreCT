
"use client"

import * as React from "react"
import {
    ColumnDef,
    ColumnFiltersState,
    SortingState,
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    useReactTable,
} from "@tanstack/react-table"

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import Image from "next/image"
import { Download, FileJson, FileSpreadsheet, Upload, LayoutGrid, List } from "lucide-react"
import { toast } from "sonner"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ActionCell } from "./actions"
import { Product } from "./columns"

interface DataTableProps<TData, TValue> {
    columns: ColumnDef<TData, TValue>[]
    data: TData[]
}

export function DataTable<TData, TValue>({
    columns,
    data,
}: DataTableProps<TData, TValue>) {
    const [sorting, setSorting] = React.useState<SortingState>([])
    const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
    const [isImporting, setIsImporting] = React.useState(false)
    const fileInputRef = React.useRef<HTMLInputElement>(null)
    const [importType, setImportType] = React.useState<"json" | "csv">("json")
    const [rowSelection, setRowSelection] = React.useState({})
    const [view, setView] = React.useState<"list" | "grid">("list")
    const router = useRouter()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const supabase = createClient() as any

    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        onSortingChange: setSorting,
        getSortedRowModel: getSortedRowModel(),
        onColumnFiltersChange: setColumnFilters,
        getFilteredRowModel: getFilteredRowModel(),
        onRowSelectionChange: setRowSelection,
        state: {
            sorting,
            columnFilters,
            rowSelection,
        },
        autoResetPageIndex: false, // Prevent reset on data update
    })

    // Bulk Actions Logic
    const handleBulkDeactivate = async () => {
        const selectedRows = table.getFilteredSelectedRowModel().rows
        const selectedIds = selectedRows.map(row => (row.original as Product).id)

        if (selectedIds.length === 0) return

        toast.promise(
            async () => {
                const { error } = await supabase
                    .from('products')
                    .update({ is_active: false })
                    .in('id', selectedIds)

                if (error) throw error
            },
            {
                loading: 'Desactivando productos...',
                success: () => {
                    setRowSelection({})
                    router.refresh()
                    return `${selectedIds.length} productos desactivados`
                },
                error: 'Error al desactivar productos'
            }
        )
    }

    const handleBulkDelete = async () => {
        const selectedRows = table.getFilteredSelectedRowModel().rows
        const selectedIds = selectedRows.map(row => (row.original as Product).id)

        if (selectedIds.length === 0) return

        if (!confirm(`¿Estás seguro de que deseas eliminar ${selectedIds.length} productos permanentemente? Esta acción no se puede deshacer.`)) {
            return
        }

        toast.promise(
            async () => {
                const { error } = await supabase
                    .from('products')
                    .delete()
                    .in('id', selectedIds)

                if (error) throw error
            },
            {
                loading: 'Eliminando productos...',
                success: () => {
                    setRowSelection({})
                    router.refresh()
                    return `${selectedIds.length} productos eliminados`
                },
                error: 'Error al eliminar productos'
            }
        )
    }

    // ... existing export/import functions ...
    const exportToJSON = () => {
        const jsonData = JSON.stringify(data, null, 2)
        const blob = new Blob([jsonData], { type: "application/json" })
        const url = URL.createObjectURL(blob)
        const link = document.createElement("a")
        link.href = url
        link.download = `catalogo_${new Date().toISOString().split('T')[0]}.json`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        URL.revokeObjectURL(url)
        toast.success("Catálogo exportado a JSON")
    }

    const exportToCSV = () => {
        if (data.length === 0) {
            toast.error("No hay datos para exportar")
            return
        }

        const headers = Object.keys(data[0] as object)
        const csvRows = [
            headers.join(","),
            ...data.map((row) =>
                headers.map((header) => {
                    const value = (row as Record<string, unknown>)[header]
                    if (typeof value === "string") {
                        return `"${value.replace(/"/g, '""')}"`
                    }
                    return value ?? ""
                }).join(",")
            ),
        ]

        const csvContent = csvRows.join("\n")
        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
        const url = URL.createObjectURL(blob)
        const link = document.createElement("a")
        link.href = url
        link.download = `catalogo_${new Date().toISOString().split('T')[0]}.csv`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        URL.revokeObjectURL(url)
        toast.success("Catálogo exportado a CSV")
    }

    const handleImportClick = (type: "json" | "csv") => {
        setImportType(type)
        fileInputRef.current?.click()
    }

    const parseCSV = (text: string): Record<string, string>[] => {
        const lines = text.trim().split("\n")
        if (lines.length < 2) return []

        const headers = lines[0].split(",").map(h => h.trim().replace(/^"|"$/g, ""))
        const products: Record<string, string>[] = []

        for (let i = 1; i < lines.length; i++) {
            const values: string[] = []
            let current = ""
            let inQuotes = false

            for (const char of lines[i]) {
                if (char === '"') {
                    inQuotes = !inQuotes
                } else if (char === "," && !inQuotes) {
                    values.push(current.trim())
                    current = ""
                } else {
                    current += char
                }
            }
            values.push(current.trim())

            if (values.length === headers.length) {
                const product: Record<string, string> = {}
                headers.forEach((header, index) => {
                    product[header] = values[index]?.replace(/^"|"$/g, "") || ""
                })
                products.push(product)
            }
        }
        return products
    }

    // ... helper functions normalizeCategory, resolveImageField, parsePrice, resolvePrice ...
    const normalizeCategory = (input: unknown): string => {
        const validCategories = ['laptop', 'cpu', 'gpu', 'motherboard', 'ram', 'storage', 'psu', 'case', 'peripheral', 'monitor', 'service', 'cooling']
        const lower = String(input || "").toLowerCase().trim()

        if (validCategories.includes(lower)) return lower

        // Common mappings
        if (lower.includes('procesador') || lower.includes('micro')) return 'cpu'
        if (lower.includes('placa') || lower.includes('madre') || lower.includes('mother')) return 'motherboard'
        if (lower.includes('video') || lower.includes('grafica') || lower.includes('rtx') || lower.includes('gtx') || lower.includes('radeon')) return 'gpu'
        if (lower.includes('memoria') || lower.includes('ram')) return 'ram'
        if (lower.includes('disco') || lower.includes('ssd') || lower.includes('hdd') || lower.includes('almacenamiento')) return 'storage'
        if (lower.includes('fuente') || lower.includes('poder') || lower.includes('psu')) return 'psu'
        if (lower.includes('gabinete') || lower.includes('chasis') || lower.includes('torre') || lower.includes('case')) return 'case'
        if (lower.includes('pantalla') || lower.includes('monitor')) return 'monitor'
        if (lower.includes('teclado') || lower.includes('mouse') || lower.includes('audifono') || lower.includes('headset') || lower.includes('silla') || lower.includes('periferico')) return 'peripheral'
        if (lower.includes('notebook') || lower.includes('laptop') || lower.includes('portatil')) return 'laptop'
        if (lower.includes('servicio') || lower.includes('instalacion') || lower.includes('armado')) return 'service'
        if (lower.includes('cooler') || lower.includes('refrigeracion') || lower.includes('fan') || lower.includes('liquida')) return 'cooling'

        return 'peripheral' // Default fallback
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const resolveImageField = (p: any): string | null => {
        const val = p.image_url || p.imageUrl || p.Image_url || p.image || p.imagen || p.foto || p.url || p.picture || null
        return typeof val === 'string' && val.trim().length > 0 ? val.trim() : null
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const parsePrice = (val: any): number => {
        if (typeof val === 'number') return val
        if (typeof val === 'string') {
            const clean = val.replace(/[$,]/g, '')
            const num = parseFloat(clean)
            return isNaN(num) ? 0 : num
        }
        return 0
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const resolvePrice = (p: any, type: 'public' | 'cash' | 'cost'): number => {
        let val
        if (type === 'public') {
            val = p.price_public || p.price || p.precio || p.precio_publico || p.pvp || p.public_price || p.precio_venta
        } else if (type === 'cash') {
            val = p.price_cash || p.cash_price || p.precio_efectivo || p.efectivo || p.price_discount
        } else if (type === 'cost') {
            val = p.cost_price || p.cost || p.precio_costo || p.costo || p.purchase_price
        }
        return parsePrice(val)
    }

    const processImport = async (products: Record<string, unknown>[]) => {
        if (products.length === 0) {
            toast.error("No se encontraron productos en el archivo")
            return
        }

        setIsImporting(true)
        let successCount = 0
        let errorCount = 0

        for (const product of products) {
            let specs = {}
            if (typeof product.specs === 'string' && product.specs.trim() !== '') {
                try {
                    specs = JSON.parse(product.specs)
                } catch (e) {
                    console.warn("Could not parse specs as JSON, using empty object", e)
                }
            } else if (typeof product.specs === 'object' && product.specs !== null) {
                specs = product.specs
            }

            const category = normalizeCategory(product.category)
            const imageUrl = resolveImageField(product)

            const pricePublic = resolvePrice(product, 'public')
            const priceCash = resolvePrice(product, 'cash') || pricePublic
            const priceCost = resolvePrice(product, 'cost')

            const productData = {
                sku: product.sku || `SKU-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
                name: product.name || "Producto sin nombre",
                slug: product.slug || (product.name as string)?.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") + `-${Math.random().toString(36).substr(2, 5)}`,
                category: category,
                description: product.description || null,
                price_public: pricePublic,
                price_cash: priceCash,
                cost_price: priceCost,
                stock_physical: Number(product.stock_physical) || 0,
                min_stock_alert: Number(product.min_stock_alert) || 5,
                image_url: imageUrl,
                is_active: product.is_active !== undefined ? Boolean(product.is_active) : true,
                specs: specs,
                updated_at: new Date().toISOString()
            }

            const { error } = await supabase
                .from('products')
                .upsert(productData, { onConflict: 'sku' })

            if (error) {
                console.error("Error importing product:", JSON.stringify(error, null, 2))
                console.error("Product data causing error:", JSON.stringify(productData, null, 2))
                errorCount++
            } else {
                successCount++
            }
        }

        setIsImporting(false)

        if (successCount > 0) {
            toast.success(`${successCount} producto(s) importado(s) exitosamente`)
            router.refresh()
        }
        if (errorCount > 0) {
            toast.error(`${errorCount} producto(s) fallaron al importar. Revisa la consola para más detalles.`)
        }
    }

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0]
        if (!file) return

        try {
            const text = await file.text()
            let products: Record<string, unknown>[]

            if (importType === "json") {
                const parsed = JSON.parse(text)
                products = Array.isArray(parsed) ? parsed : [parsed]
            } else {
                products = parseCSV(text)
            }

            await processImport(products)
        } catch (error) {
            console.error("Error parsing file:", error)
            toast.error("Error al leer el archivo. Verifica el formato.")
        }

        if (fileInputRef.current) {
            fileInputRef.current.value = ""
        }
    }

    return (
        <div>
            <input
                ref={fileInputRef}
                type="file"
                accept={importType === "json" ? ".json" : ".csv"}
                onChange={handleFileChange}
                className="hidden"
            />

            <div className="flex items-center justify-between py-4">
                {Object.keys(rowSelection).length > 0 ? (
                    <div className="flex items-center gap-2 w-full bg-muted/30 p-2 rounded-md border border-dashed border-primary/20">
                        <span className="text-sm font-medium pl-2">
                            {Object.keys(rowSelection).length} seleccionados
                        </span>
                        <div className="flex-1" />
                        <Button
                            variant="secondary"
                            size="sm"
                            onClick={handleBulkDeactivate}
                            className="bg-orange-100 text-orange-700 hover:bg-orange-200 border-orange-200 dark:bg-orange-900/20 dark:text-orange-400 dark:border-orange-900/50"
                        >
                            Desactivar
                        </Button>
                        <Button
                            variant="destructive"
                            size="sm"
                            onClick={handleBulkDelete}
                        >
                            Eliminar
                        </Button>
                        <div className="w-px h-6 bg-border mx-2" />
                    </div>
                ) : (
                    <div className="flex items-center gap-2">
                        <Input
                            placeholder="Filtrar por nombre..."
                            value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
                            onChange={(event) =>
                                table.getColumn("name")?.setFilterValue(event.target.value)
                            }
                            className="max-w-sm"
                        />
                    </div>
                )}

                <div className="flex gap-2">
                    <div className="flex items-center border rounded-md p-1 bg-muted/20 mr-2">
                        <Button
                            variant={view === "list" ? "secondary" : "ghost"}
                            size="sm"
                            className="h-8 w-8 p-0"
                            onClick={() => setView("list")}
                        >
                            <List className="h-4 w-4" />
                        </Button>
                        <Button
                            variant={view === "grid" ? "secondary" : "ghost"}
                            size="sm"
                            className="h-8 w-8 p-0"
                            onClick={() => setView("grid")}
                        >
                            <LayoutGrid className="h-4 w-4" />
                        </Button>
                    </div>

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" disabled={isImporting}>
                                <Upload className="mr-2 h-4 w-4" />
                                {isImporting ? "Importando..." : "Importar"}
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleImportClick("json")}>
                                <FileJson className="mr-2 h-4 w-4" />
                                Importar desde JSON
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleImportClick("csv")}>
                                <FileSpreadsheet className="mr-2 h-4 w-4" />
                                Importar desde CSV
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline">
                                <Download className="mr-2 h-4 w-4" />
                                Exportar
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={exportToJSON}>
                                <FileJson className="mr-2 h-4 w-4" />
                                Exportar a JSON
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={exportToCSV}>
                                <FileSpreadsheet className="mr-2 h-4 w-4" />
                                Exportar a CSV
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>

            {view === "list" ? (
                <div className="rounded-md border bg-card">
                    <Table>
                        <TableHeader>
                            {table.getHeaderGroups().map((headerGroup) => (
                                <TableRow key={headerGroup.id}>
                                    {headerGroup.headers.map((header) => {
                                        return (
                                            <TableHead key={header.id}>
                                                {header.isPlaceholder
                                                    ? null
                                                    : flexRender(
                                                        header.column.columnDef.header,
                                                        header.getContext()
                                                    )}
                                            </TableHead>
                                        )
                                    })}
                                </TableRow>
                            ))}
                        </TableHeader>
                        <TableBody>
                            {table.getRowModel().rows?.length ? (
                                table.getRowModel().rows.map((row) => (
                                    <TableRow
                                        key={row.id}
                                        data-state={row.getIsSelected() && "selected"}
                                    >
                                        {row.getVisibleCells().map((cell) => (
                                            <TableCell key={cell.id}>
                                                {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={columns.length} className="h-24 text-center">
                                        No hay resultados.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                    {table.getRowModel().rows?.length ? (
                        table.getRowModel().rows.map((row) => {
                            const product = row.original as Product
                            return (
                                <Card key={row.id} className="overflow-hidden flex flex-col justify-between">
                                    <div className="aspect-square relative bg-muted/50">
                                        {product.image_url ? (
                                            <Image
                                                src={product.image_url}
                                                alt={product.name}
                                                fill
                                                className="object-cover transition-transform hover:scale-105 duration-300"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">
                                                Sin Imagen
                                            </div>
                                        )}
                                        <div className="absolute top-2 right-2">
                                            <Badge variant={product.is_active ? "default" : "secondary"}>
                                                {product.is_active ? "Activo" : "Inactivo"}
                                            </Badge>
                                        </div>
                                    </div>
                                    <CardContent className="p-4 flex-1 flex flex-col gap-2">
                                        <div className="flex justify-between items-start">
                                            <Badge variant="outline" className="text-[10px] uppercase">{product.category}</Badge>
                                            <div className="scale-75 origin-top-right -mt-1 -mr-2">
                                                <ActionCell product={product} />
                                            </div>
                                        </div>
                                        <h3 className="font-semibold text-sm line-clamp-2" title={product.name}>
                                            {product.name}
                                        </h3>
                                        <div className="mt-auto flex items-center justify-between">
                                            <span className="font-bold text-lg">
                                                ${product.price_public.toLocaleString('es-CL')}
                                            </span>
                                            <span className={`text-xs ${product.stock_physical <= 2 ? "text-red-500 font-bold" : "text-muted-foreground"}`}>
                                                Stock: {product.stock_physical}
                                            </span>
                                        </div>
                                    </CardContent>
                                </Card>
                            )
                        })
                    ) : (
                        <div className="col-span-full h-24 text-center flex items-center justify-center text-muted-foreground">
                            No hay resultados.
                        </div>
                    )}
                </div>
            )}

            <div className="flex items-center justify-end space-x-2 py-4">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => table.previousPage()}
                    disabled={!table.getCanPreviousPage()}
                >
                    Anterior
                </Button>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => table.nextPage()}
                    disabled={!table.getCanNextPage()}
                >
                    Siguiente
                </Button>
            </div>
        </div>
    )
}
