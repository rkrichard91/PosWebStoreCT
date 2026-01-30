"use client"

import { ColumnDef } from "@tanstack/react-table"
import { MoreHorizontal, ArrowUpDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { ActionCell } from "./actions"
import { Checkbox } from "@/components/ui/checkbox"

// This type is used to define the shape of our data.
// You can use a Zod schema here if you want.
export type Product = {
    id: string
    sku: string
    name: string
    category: string
    price_public: number
    price_cash: number
    cost_price: number | null
    stock_physical: number
    min_stock_alert: number
    is_active: boolean
    image_url: string | null
    slug: string
    description: string | null
    specs: Record<string, any> | null
}

export const columns: ColumnDef<Product>[] = [
    {
        id: "select",
        header: ({ table }) => (
            <Checkbox
                checked={
                    table.getIsAllPageRowsSelected() ||
                    (table.getIsSomePageRowsSelected() && "indeterminate")
                }
                onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
                aria-label="Select all"
            />
        ),
        cell: ({ row }) => (
            <Checkbox
                checked={row.getIsSelected()}
                onCheckedChange={(value) => row.toggleSelected(!!value)}
                aria-label="Select row"
            />
        ),
        enableSorting: false,
        enableHiding: false,
    },
    {
        accessorKey: "sku",
        header: "SKU",
    },
    {
        accessorKey: "name",
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    Nombre
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            )
        },
    },
    {
        accessorKey: "category",
        header: "Categoría",
        cell: ({ row }) => <Badge variant="outline" className="capitalize">{row.getValue("category")}</Badge>,
    },
    {
        accessorKey: "price_public",
        header: "Precio",
        cell: ({ row }) => {
            const amount = parseFloat(row.getValue("price_public"))
            const formatted = new Intl.NumberFormat("es-CL", {
                style: "currency",
                currency: "CLP",
            }).format(amount)

            return <div className="font-medium">{formatted}</div>
        },
    },
    {
        accessorKey: "stock_physical",
        header: "Stock",
        cell: ({ row }) => {
            const stock = parseFloat(row.getValue("stock_physical"))
            return (
                <div className={stock <= 2 ? "text-red-500 font-bold" : ""}>
                    {stock}
                </div>
            )
        }
    },
    {
        accessorKey: "is_active",
        header: "Estado",
        cell: ({ row }) => {
            const isActive = row.getValue("is_active")
            return (
                <Badge variant={isActive ? "default" : "secondary"}>
                    {isActive ? "Activo" : "Inactivo"}
                </Badge>
            )
        }
    },
    {
        id: "actions",
        cell: ({ row }) => <ActionCell product={row.original} />
    },
]
