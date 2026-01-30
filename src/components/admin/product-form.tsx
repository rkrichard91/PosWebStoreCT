"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm, UseFormReturn } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { ImageUpload } from "@/components/admin/image-upload"
import { Calculator } from "lucide-react"
import { useEffect, useState } from "react"

const productSchema = z.object({
    sku: z.string().min(1, "SKU requerido"),
    name: z.string().min(1, "Nombre requerido"),
    slug: z.string().nullable().optional(),
    category: z.enum([
        "laptop", "cpu", "gpu", "motherboard", "ram", "storage",
        "psu", "case", "monitor", "peripheral", "service", "cooling"
    ]),
    price_public: z.number().min(0),
    price_cash: z.number().min(0),
    cost_price: z.number().nullable().optional(),
    stock_physical: z.number().int().min(0),
    min_stock_alert: z.number().int().min(0),
    is_active: z.boolean().default(true),
    image_url: z.string().nullable().optional(),
    description: z.string().nullable().optional(),
    specs: z.record(z.any()).nullable().optional(),
});

export type ProductFormValues = z.infer<typeof productSchema>

interface ProductFormProps {
    initialData?: ProductFormValues
    onSubmit: (values: ProductFormValues) => void
    isLoading?: boolean
}

export function ProductForm({ initialData, onSubmit, isLoading }: ProductFormProps) {
    const form = useForm<ProductFormValues>({
        resolver: zodResolver(productSchema) as any,
        defaultValues: {
            sku: initialData?.sku || "",
            name: initialData?.name || "",
            category: initialData?.category || "peripheral",
            price_public: initialData?.price_public || 0,
            price_cash: initialData?.price_cash || 0,
            cost_price: initialData?.cost_price || 0,
            stock_physical: initialData?.stock_physical || 0,
            min_stock_alert: initialData?.min_stock_alert || 0,
            is_active: initialData?.is_active ?? true,
            image_url: initialData?.image_url || "",
            description: initialData?.description || "",
            slug: initialData?.slug || "", // Added slug to default values
            specs: initialData?.specs || {},
        },
    })



    // Calculator States
    const [calcCost, setCalcCost] = useState<string>("")
    const [taxIncluded, setTaxIncluded] = useState<boolean>(true)
    const [profitMargin, setProfitMargin] = useState<string>("30")
    const [taxRate, setTaxRate] = useState<string>("15")

    const category = form.watch("category");

    // Calculator Logic
    useEffect(() => {
        const inputCost = parseFloat(calcCost)
        const margin = parseFloat(profitMargin)
        const tax = parseFloat(taxRate)

        if (!isNaN(inputCost) && !isNaN(margin) && !isNaN(tax)) {
            // 1. Normalize Cost (Net Cost)
            // If tax included: Net = Input / (1 + TaxRate)
            // If tax not included: Net = Input
            let netCost = inputCost
            if (taxIncluded) {
                netCost = inputCost / (1 + (tax / 100))
            }

            // 2. Calculate Gain
            // Gain = NetCost * (Margin / 100)
            const gain = netCost * (margin / 100)

            // 3. Base Price
            // Base = NetCost + Gain
            const basePrice = netCost + gain

            // 4. Final Price (PVP)
            // Final = Base * (1 + TaxRate)
            const finalPrice = basePrice * (1 + (tax / 100))

            // Update Form Fields
            // Rounding to 2 decimal places for storage, though UI might format differently
            form.setValue("cost_price", parseFloat(netCost.toFixed(2)))
            form.setValue("price_public", parseFloat(finalPrice.toFixed(2)))
            form.setValue("price_cash", parseFloat(finalPrice.toFixed(2))) // Assign same initially
        }
    }, [calcCost, taxIncluded, profitMargin, taxRate, form])

    function handleSubmit(values: ProductFormValues) {
        // Ensure specs is an object
        if (!values.specs) values.specs = {};
        onSubmit(values)
    }

    // Helper for rendering spec fields
    const renderSpecField = (name: string, label: string, placeholder: string, type: "text" | "number" = "text") => (
        <FormField
            control={form.control}
            // @ts-ignore
            name={`specs.${name}`}
            render={({ field }) => (
                <FormItem>
                    <FormLabel>{label}</FormLabel>
                    <FormControl>
                        <Input
                            type={type}
                            placeholder={placeholder}
                            {...field}
                            // @ts-ignore
                            value={field.value || ""}
                            onChange={(e) => {
                                const val = type === 'number' ? parseFloat(e.target.value) : e.target.value;
                                field.onChange(val);
                            }}
                        />
                    </FormControl>
                    <FormMessage />
                </FormItem>
            )}
        />
    );

    const renderSelectSpec = (name: string, label: string, options: { value: string, label: string }[]) => (
        <FormField
            control={form.control}
            // @ts-ignore
            name={`specs.${name}`}
            render={({ field }) => (
                <FormItem>
                    <FormLabel>{label}</FormLabel>
                    {/* @ts-ignore */}
                    <Select onValueChange={field.onChange} value={field.value?.toString() || ""}>
                        <FormControl>
                            <SelectTrigger>
                                <SelectValue placeholder={`Seleccionar ${label}`} />
                            </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                            {options.map(opt => (
                                <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <FormMessage />
                </FormItem>
            )}
        />
    );

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="sku"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>SKU</FormLabel>
                                <FormControl>
                                    <Input placeholder="PROD-001" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Nombre</FormLabel>
                                <FormControl>
                                    <Input placeholder="Nombre del producto" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="slug"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Slug (URL)</FormLabel>
                                <FormControl>
                                    <Input placeholder="nombre-producto-modelo" {...field} />
                                </FormControl>
                                <FormDescription>Identificador único en la URL.</FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="category"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Categoría</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Selecciona una categoría" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="laptop">Laptop</SelectItem>
                                        <SelectItem value="cpu">Procesador (CPU)</SelectItem>
                                        <SelectItem value="motherboard">Placa Madre</SelectItem>
                                        <SelectItem value="ram">Memoria RAM</SelectItem>
                                        <SelectItem value="gpu">Tarjeta de Video (GPU)</SelectItem>
                                        <SelectItem value="storage">Almacenamiento</SelectItem>
                                        <SelectItem value="psu">Fuente de Poder</SelectItem>
                                        <SelectItem value="case">Gabinete</SelectItem>
                                        <SelectItem value="cooling">Refrigeración</SelectItem>
                                        <SelectItem value="monitor">Monitor</SelectItem>
                                        <SelectItem value="peripheral">Periférico</SelectItem>
                                        <SelectItem value="service">Servicio</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                {/* DYNAMIC SPECS SECTION */}
                <div className="border p-4 rounded-lg bg-slate-50 dark:bg-slate-900/50">
                    <h3 className="font-semibold mb-4">Especificaciones Técnicas ({category})</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {category === 'cpu' && (
                            <>
                                {renderSpecField('socket', 'Socket', 'Ej: LGA1700, AM5')}
                                {renderSpecField('tdp', 'TDP (Watts)', 'Ej: 65, 125', 'number')}
                                {renderSpecField('cores', 'Núcleos', 'Ej: 6, 12', 'number')}
                                {renderSpecField('frequency', 'Frecuencia Base (GHz)', 'Ej: 3.5')}
                            </>
                        )}

                        {category === 'motherboard' && (
                            <>
                                {renderSpecField('socket', 'Socket', 'Ej: LGA1700, AM5')}
                                {renderSelectSpec('memory_type', 'Tipo de Memoria', [
                                    { value: 'ddr4', label: 'DDR4' },
                                    { value: 'ddr5', label: 'DDR5' }
                                ])}
                                {renderSelectSpec('form_factor', 'Formato', [
                                    { value: 'atx', label: 'ATX' },
                                    { value: 'matx', label: 'Micro-ATX' },
                                    { value: 'itx', label: 'Mini-ITX' }
                                ])}
                                {renderSpecField('max_memory', 'Max Memoria (GB)', 'Ej: 128', 'number')}
                                {renderSpecField('slots_ram', 'Slots RAM', 'Ej: 4', 'number')}
                            </>
                        )}

                        {category === 'ram' && (
                            <>
                                {renderSelectSpec('type', 'Tecnología', [
                                    { value: 'ddr4', label: 'DDR4' },
                                    { value: 'ddr5', label: 'DDR5' }
                                ])}
                                {renderSpecField('capacity', 'Capacidad Total (GB)', 'Ej: 16, 32', 'number')}
                                {renderSpecField('speed', 'Velocidad (MHz)', 'Ej: 3200, 5600', 'number')}
                                {renderSpecField('modules', 'Cantidad de Módulos', 'Ej: 2', 'number')}
                                {renderSelectSpec('format', 'Formato', [
                                    { value: 'dimm', label: 'DIMM (Escritorio)' },
                                    { value: 'sodimm', label: 'SO-DIMM (Laptop)' }
                                ])}
                            </>
                        )}

                        {category === 'gpu' && (
                            <>
                                {renderSpecField('length_mm', 'Largo (mm)', 'Ej: 300', 'number')}
                                {renderSpecField('tdp', 'TDP / Consumo (Watts)', 'Ej: 200', 'number')}
                                {renderSpecField('vram', 'VRAM (GB)', 'Ej: 8, 12, 16', 'number')}
                                {renderSpecField('recommended_psu', 'Fuente Recomendada (W)', 'Ej: 650', 'number')}
                            </>
                        )}

                        {category === 'psu' && (
                            <>
                                {renderSpecField('watts', 'Potencia (Watts)', 'Ej: 650, 750', 'number')}
                                {renderSelectSpec('certification', 'Certificación 80+', [
                                    { value: 'none', label: 'Sin Certificación' },
                                    { value: 'white', label: '80+ White' },
                                    { value: 'bronze', label: '80+ Bronze' },
                                    { value: 'gold', label: '80+ Gold' },
                                    { value: 'platinum', label: '80+ Platinum' }
                                ])}
                                {renderSelectSpec('modular', 'Modularidad', [
                                    { value: 'no', label: 'No Modular' },
                                    { value: 'semi', label: 'Semi Modular' },
                                    { value: 'full', label: 'Full Modular' }
                                ])}
                            </>
                        )}

                        {category === 'cooling' && (
                            <>
                                {renderSelectSpec('type', 'Tipo', [
                                    { value: 'air', label: 'Aire' },
                                    { value: 'aio', label: 'Líquida (AIO)' },
                                    { value: 'fan', label: 'Ventilador Caja' }
                                ])}
                                {renderSpecField('fan_size', 'Tamaño Ventilador (mm)', 'Ej: 120, 140', 'number')}
                                {renderSpecField('socket_support', 'Soportes', 'Ej: AM4, AM5, LGA1700')}
                            </>
                        )}

                        {category === 'case' && (
                            <>
                                {renderSpecField('max_gpu_length_mm', 'Largo Máx GPU (mm)', 'Ej: 320', 'number')}
                                {renderSelectSpec('form_factor_support', 'Soporte Placa Madre', [
                                    { value: 'atx', label: 'Hasta ATX' },
                                    { value: 'matx', label: 'Hasta Micro-ATX' },
                                    { value: 'eatx', label: 'Hasta E-ATX' }
                                ])}
                                {renderSpecField('included_fans', 'Ventiladores Incluidos', 'Ej: 3', 'number')}
                            </>
                        )}

                        {category === 'storage' && (
                            <>
                                {renderSelectSpec('type', 'Tipo', [
                                    { value: 'ssd', label: 'SSD' },
                                    { value: 'hdd', label: 'HDD Mecánico' }
                                ])}
                                {renderSelectSpec('interface', 'Interfaz', [
                                    { value: 'sata', label: 'SATA' },
                                    { value: 'nvme', label: 'NVMe M.2' }
                                ])}
                                {renderSpecField('capacity_gb', 'Capacidad (GB)', 'Ej: 1000', 'number')}
                                {renderSpecField('read_speed', 'Velocidad Lectura (MB/s)', 'Ej: 3500', 'number')}
                            </>
                        )}

                        {category === 'monitor' && (
                            <>
                                {renderSpecField('size', 'Tamaño (Pulgadas)', 'Ej: 24, 27', 'number')}
                                {renderSpecField('refresh_rate', 'Tasa de Refresco (Hz)', 'Ej: 144, 165', 'number')}
                                {renderSpecField('resolution', 'Resolución', 'Ej: 1920x1080')}
                                {renderSelectSpec('panel', 'Tipo Panel', [
                                    { value: 'ips', label: 'IPS' },
                                    { value: 'va', label: 'VA' },
                                    { value: 'tn', label: 'TN' },
                                    { value: 'oled', label: 'OLED' }
                                ])}
                            </>
                        )}

                        {!['cpu', 'motherboard', 'ram', 'gpu', 'psu', 'case', 'storage', 'monitor'].includes(category) && (
                            <div className="text-muted-foreground col-span-full italic">
                                Sin especificaciones avanzadas requeridas para esta categoría.
                            </div>
                        )}
                    </div>
                </div>

                <FormField
                    control={form.control}
                    name="image_url"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Imagen del Producto</FormLabel>
                            <FormControl>
                                <ImageUpload
                                    value={field.value || ""}
                                    onChange={field.onChange}
                                    disabled={isLoading}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Descripción</FormLabel>
                            <FormControl>
                                <Textarea
                                    placeholder="Detalles del producto..."
                                    className="resize-none"
                                    {...field}
                                    value={field.value || ""}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {/* PRICING CALCULATOR */}
                <div className="border border-blue-200 dark:border-blue-900 bg-blue-50/50 dark:bg-blue-900/10 rounded-lg p-4 space-y-4">
                    <div className="flex items-center gap-2 mb-2">
                        <Calculator className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                        <h3 className="font-semibold text-blue-900 dark:text-blue-100">Cálculo Automático de Precios</h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                        <div className="space-y-2">
                            <FormLabel className="text-xs">Costo Ingresado (Factura)</FormLabel>
                            <Input
                                type="number"
                                value={calcCost}
                                onChange={(e) => setCalcCost(e.target.value)}
                                placeholder="0"
                                className="bg-white dark:bg-slate-950"
                            />
                        </div>

                        <div className="flex items-center gap-2 pb-2">
                            <Switch
                                checked={taxIncluded}
                                onCheckedChange={setTaxIncluded}
                                id="tax-included"
                            />
                            <FormLabel htmlFor="tax-included" className="cursor-pointer text-xs">
                                ¿Impuesto Incluido?
                            </FormLabel>
                        </div>

                        <div className="space-y-2">
                            <FormLabel className="text-xs">Margen Ganancia (%)</FormLabel>
                            <Input
                                type="number"
                                value={profitMargin}
                                onChange={(e) => setProfitMargin(e.target.value)}
                                placeholder="30"
                                className="bg-white dark:bg-slate-950"
                            />
                        </div>

                        <div className="space-y-2">
                            <FormLabel className="text-xs">Tasa IVA (%)</FormLabel>
                            <Input
                                type="number"
                                value={taxRate}
                                onChange={(e) => setTaxRate(e.target.value)}
                                placeholder="15"
                                className="bg-white dark:bg-slate-950"
                            />
                        </div>
                    </div>
                    <div className="text-xs text-muted-foreground mt-2">
                        ℹ️ Esto calculará automáticamente el <strong>Costo Neto</strong> y el <strong>Precio Público</strong> abajo.
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormField
                        control={form.control}
                        name="price_public"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Precio Público</FormLabel>
                                <FormControl>
                                    <Input type="number" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="price_cash"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Precio Efectivo</FormLabel>
                                <FormControl>
                                    <Input type="number" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="cost_price"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Precio Costo</FormLabel>
                                <FormControl>
                                    <Input
                                        type="number"
                                        {...field}
                                        value={field.value || 0}
                                        onChange={e => field.onChange(parseFloat(e.target.value))}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="stock_physical"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Stock Físico</FormLabel>
                                <FormControl>
                                    <Input type="number" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="min_stock_alert"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Alerta Stock Mínimo</FormLabel>
                                <FormControl>
                                    <Input type="number" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <FormField
                    control={form.control}
                    name="is_active"
                    render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                                <FormLabel className="text-base">Producto Activo</FormLabel>
                                <FormDescription>
                                    Visible en la tienda y POS.
                                </FormDescription>
                            </div>
                            <FormControl>
                                <Switch
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                />
                            </FormControl>
                        </FormItem>
                    )}
                />

                <Button type="submit" disabled={isLoading}>{isLoading ? 'Guardando...' : 'Guardar Producto'}</Button>
            </form>
        </Form>
    )
}
