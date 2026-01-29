
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
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Download, FileJson, FileSpreadsheet, Upload } from "lucide-react"
import { toast } from "sonner"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

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
    const router = useRouter()
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
        state: {
            sorting,
            columnFilters,
        },
    })

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

    const normalizeCategory = (input: unknown): string => {
        const validCategories = ['laptop', 'cpu', 'gpu', 'motherboard', 'ram', 'storage', 'psu', 'case', 'peripheral', 'monitor', 'service']
        const lower = String(input || "").toLowerCase().trim()

        if (validCategories.includes(lower)) return lower

        // Mapeos comunes
        if (lower.includes('process') || lower.includes('procesador')) return 'cpu'
        if (lower.includes('graphic') || lower.includes('video') || lower.includes('gpu') || lower.includes('grafica') || lower.includes('tarjeta')) return 'gpu'
        if (lower.includes('mother') || lower.includes('placa') || lower.includes('board') || lower.includes('madre')) return 'motherboard'
        if (lower.includes('memory') || lower.includes('memoria') || lower.includes('ram')) return 'ram'
        if (lower.includes('storage') || lower.includes('disco') || lower.includes('ssd') || lower.includes('hdd') || lower.includes('almacenamiento')) return 'storage'
        if (lower.includes('power') || lower.includes('fuente') || lower.includes('psu')) return 'psu'
        if (lower.includes('case') || lower.includes('gabinete') || lower.includes('chasis') || lower.includes('caja') || lower.includes('torre')) return 'case'
        if (lower.includes('screen') || lower.includes('monitor') || lower.includes('pantalla') || lower.includes('display')) return 'monitor'
        if (lower.includes('servici') || lower.includes('service') || lower.includes('reparacion') || lower.includes('mano')) return 'service'
        if (lower.includes('lap') || lower.includes('portatil') || lower.includes('notebook')) return 'laptop'

        return 'peripheral' // Fallback seguro
    }

    const resolveImageField = (p: any): string | null => {
        const val = p.image_url || p.imageUrl || p.Image_url || p.image || p.imagen || p.foto || p.url || p.picture || null
        return typeof val === 'string' && val.trim().length > 0 ? val.trim() : null
    }

    const parsePrice = (val: any): number => {
        if (typeof val === 'number') return val
        if (typeof val === 'string') {
            // Remover $ y , (ej: "$1,200.50" -> "1200.50")
            const clean = val.replace(/[$,]/g, '')
            const num = parseFloat(clean)
            return isNaN(num) ? 0 : num
        }
        return 0
    }

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
            // Parse specs if it's a string (from CSV)
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

            // Resolve prices
            const pricePublic = resolvePrice(product, 'public')
            const priceCash = resolvePrice(product, 'cash') || pricePublic // Fallback to public if cash missing
            const priceCost = resolvePrice(product, 'cost')

            // Preparar datos del producto con valores por defecto
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

        // Reset input
        if (fileInputRef.current) {
            fileInputRef.current.value = ""
        }
    }

    return (
        <div>
            {/* Hidden file input */}
            <input
                ref={fileInputRef}
                type="file"
                accept={importType === "json" ? ".json" : ".csv"}
                onChange={handleFileChange}
                className="hidden"
            />

            <div className="flex items-center justify-between py-4">
                <Input
                    placeholder="Filtrar por nombre..."
                    value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
                    onChange={(event) =>
                        table.getColumn("name")?.setFilterValue(event.target.value)
                    }
                    className="max-w-sm"
                />
                <div className="flex gap-2">
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
