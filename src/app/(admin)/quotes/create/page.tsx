"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trash2, Plus, Search, Printer, Save, Eye, EyeOff, Image as ImageIcon } from "lucide-react";
import Image from "next/image";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";

// Schema for Customer Info
const customerSchema = z.object({
    name: z.string().min(1, "Nombre requerido"),
    doc_number: z.string().min(1, "RUC o Cédula requerido"), // RUC/Cedula
    phone: z.string().optional(),
    email: z.string().email("Email inválido").optional().or(z.literal("")),
    address: z.string().optional(),
});

// Schema for a Line Item
interface QuoteItem {
    id?: string; // Product ID if existing
    name: string;
    sku: string;
    cost: number;
    price: number;
    quantity: number;
    image_url?: string;
    margin?: string; // Stored as string to allow easy editing inputs
    is_custom: boolean;
    add_to_catalog?: boolean;
}

export default function CreateQuotePage() {
    const router = useRouter();
    const [items, setItems] = useState<QuoteItem[]>([]);
    const [isInternalView, setIsInternalView] = useState(true);

    // Search State
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [searchQuery, setSearchQuery] = useState("");

    // Custom Item State
    const [customItem, setCustomItem] = useState({
        name: "",
        sku: "",
        image_url: "",
        addToCatalog: false
    });

    // Calculator State (for manual items)
    const [calcCost, setCalcCost] = useState<string>("");
    const [taxIncluded, setTaxIncluded] = useState<boolean>(true);
    const [profitMargin, setProfitMargin] = useState<string>("30");
    const [calculatedNetCost, setCalculatedNetCost] = useState<number>(0);
    const [calculatedPrice, setCalculatedPrice] = useState<number>(0);

    const form = useForm<z.infer<typeof customerSchema>>({
        resolver: zodResolver(customerSchema),
        defaultValues: {
            name: "",
            doc_number: "",
            phone: "",
            email: "",
            address: "",
        },
    });

    // Calculator Logic (for manual items) - Auto-calculate price from cost + margin
    React.useEffect(() => {
        const inputCost = parseFloat(calcCost);
        const margin = parseFloat(profitMargin);
        const tax = 0.15; // 15% IVA

        if (!isNaN(inputCost) && !isNaN(margin) && inputCost > 0) {
            // 1. Normalize Cost (Net Cost)
            // If tax included: Net = Input / (1 + TaxRate)
            // If tax not included: Net = Input
            let netCost = inputCost;
            if (taxIncluded) {
                netCost = inputCost / (1 + tax);
            }

            // 2. Calculate Sale Price (Net)
            // Price = NetCost * (1 + Margin/100)
            const salePrice = netCost * (1 + (margin / 100));

            setCalculatedNetCost(parseFloat(netCost.toFixed(2)));
            setCalculatedPrice(parseFloat(salePrice.toFixed(2)));
        } else {
            setCalculatedNetCost(0);
            setCalculatedPrice(0);
        }
    }, [calcCost, taxIncluded, profitMargin]);

    // --- PERSISTENCE ---
    // Load draft on mount
    React.useEffect(() => {
        const savedDraft = localStorage.getItem("quote_draft");
        if (savedDraft) {
            try {
                const draft = JSON.parse(savedDraft);
                if (draft.items) setItems(draft.items);
                if (draft.customer) form.reset(draft.customer);
                toast.success("Borrador recuperado");
            } catch (e) {
                console.error("Error loading draft", e);
            }
        }
    }, [form]);

    // Save draft on change
    React.useEffect(() => {
        const subscription = form.watch((value) => {
            const draft = {
                items,
                customer: value
            };
            localStorage.setItem("quote_draft", JSON.stringify(draft));
        });

        // Also save when items change
        const currentForm = form.getValues();
        if (items.length > 0 || currentForm.name) {
            const draft = {
                items,
                customer: currentForm
            };
            localStorage.setItem("quote_draft", JSON.stringify(draft));
        }

        return () => subscription.unsubscribe();
    }, [items, form]);

    const clearDraft = () => {
        if (confirm("¿Estás seguro de limpiar la cotización actual?")) {
            setItems([]);
            form.reset({
                name: "",
                doc_number: "",
                phone: "",
                email: "",
                address: "",
            });
            localStorage.removeItem("quote_draft");
            toast.success("Cotización limpiada");
        }
    };

    // --- SEARCH FUNCTIONS ---
    const handleSearch = async () => {
        if (!searchQuery) return;
        const supabase = createClient();
        const { data } = await supabase
            .from("products")
            .select("*")
            .ilike("name", `%${searchQuery}%`)
            .eq("is_active", true)
            .limit(10);

        if (data) setSearchResults(data);
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const addProductItem = (product: any) => {
        const cost = product.cost_price || 0;
        const priceWithTax = product.price_public || 0;

        // Remove IVA (15%) from public price since IVA is added at the end of the quote
        const priceWithoutTax = priceWithTax / 1.15;

        // Calculate margin based on net price: (NetPrice - Cost) / Cost
        let marginVal = 0;
        if (cost > 0) {
            marginVal = ((priceWithoutTax - cost) / cost) * 100;
        }

        const newItem: QuoteItem = {
            id: product.id,
            name: product.name,
            sku: product.sku,
            cost: cost,
            price: parseFloat(priceWithoutTax.toFixed(2)), // Price without IVA
            quantity: 1,
            image_url: product.image_url,
            margin: marginVal.toFixed(2),
            is_custom: false,
        };
        setItems([...items, newItem]);
        setIsSearchOpen(false);
        toast.success("Producto agregado (precio sin IVA)");
    };

    // --- CUSTOM ITEM FUNCTIONS ---
    const addCustomItem = () => {
        if (!customItem.name || calculatedPrice <= 0) {
            toast.error("Nombre y costo son requeridos para ítems manuales");
            return;
        }

        const newItem: QuoteItem = {
            name: customItem.name,
            sku: customItem.sku || "MANUAL",
            cost: calculatedNetCost,
            price: calculatedPrice,
            quantity: 1,
            margin: profitMargin,
            image_url: customItem.image_url,
            is_custom: true,
            add_to_catalog: customItem.addToCatalog
        };
        setItems([...items, newItem]);

        // Reset all fields
        setCustomItem({ name: "", sku: "", image_url: "", addToCatalog: false });
        setCalcCost("");
        setProfitMargin("30");
        setTaxIncluded(true);

        toast.success("Ítem manual agregado");
    };

    // --- MANIPULATION FUNCTIONS ---
    const removeItem = (index: number) => {
        const newItems = [...items];
        newItems.splice(index, 1);
        setItems(newItems);
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updateItemField = (index: number, field: keyof QuoteItem, value: any) => {
        const newItems = [...items];
        const item = newItems[index];

        if (field === 'quantity') {
            item.quantity = Math.max(1, parseInt(value) || 1);
        } else if (field === 'price') {
            // Recalculate Margin: M = (P - C) / C
            const newPrice = parseFloat(value) || 0;
            item.price = newPrice;
            if (item.cost > 0) {
                const m = ((newPrice - item.cost) / item.cost) * 100;
                item.margin = m.toFixed(2);
            }
        } else if (field === 'margin') {
            // Recalculate Price: P = C * (1 + M)
            const newMargin = parseFloat(value) || 0;
            item.margin = value; // Keep string input
            if (item.cost > 0) {
                item.price = item.cost * (1 + (newMargin / 100));
            }
        } else if (field === 'cost') {
            // Keep margin, update price
            const newCost = parseFloat(value) || 0;
            item.cost = newCost;
            const currentMargin = parseFloat(item.margin || "0");
            item.price = newCost * (1 + (currentMargin / 100));
        }

        setItems(newItems);
    };

    const calculateTotals = () => {
        const subtotal = items.reduce((acc, item) => acc + (item.price * item.quantity), 0);
        const totalCost = items.reduce((acc, item) => acc + (item.cost * item.quantity), 0);
        const tax = subtotal * 0.15; // 15% IVA calculated at the end
        const total = subtotal + tax;
        const profit = subtotal - totalCost; // Net profit (Net Sale - Cost)
        const profitMargin = subtotal > 0 ? (profit / subtotal) * 100 : 0;

        return { subtotal, tax, total, totalCost, profit, profitMargin };
    };

    const { subtotal, tax, total, totalCost, profit } = calculateTotals();

    // --- SUBMIT ---
    const onSubmit = async (customerData: z.infer<typeof customerSchema>) => {
        if (items.length === 0) {
            toast.error("Agrega al menos un producto a la cotización");
            return;
        }

        try {
            const supabase = createClient();

            // 1. Process Custom Items
            const processedItems = await Promise.all(items.map(async (item) => {
                if (item.is_custom) {
                    // Generate unique SKU with timestamp + random suffix to avoid duplicates
                    const uniqueId = `${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
                    const generatedSku = item.sku && item.sku !== 'MANUAL' ? `${item.sku}-${uniqueId}` : `COT-${uniqueId}`;
                    const generatedSlug = generatedSku.toLowerCase().replace(/\s+/g, '-');

                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    const { data: newProd, error } = await (supabase.from('products') as any).insert({
                        name: item.name,
                        sku: generatedSku,
                        slug: generatedSlug,
                        price_public: item.price,
                        price_cash: item.price,
                        cost_price: item.cost,
                        stock_physical: 0,
                        min_stock_alert: 0,
                        image_url: item.image_url || null, // Save image if exists
                        category: 'service', // Default to service/other
                        is_active: item.add_to_catalog ? true : false, // Active ONLY if requested
                        description: "Ítem creado desde cotización",
                        specs: {}
                    }).select().single();

                    if (error) throw error;
                    return { ...item, id: newProd.id };
                }
                return item;
            }));

            // 2. Create Order (Status = 'quote')
            const { total, subtotal, tax } = calculateTotals(); // Use calculated totals
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const { data: order, error: orderError } = await (supabase.from('orders') as any).insert({
                status: 'quote',
                origin: 'web', // or 'admin' if we had it
                total: total, // Total with tax
                customer_data: customerData, // Storing full customer info in JSON column
                // We could also link customer_id if we had a customers table, but sticking to JSON for now
            }).select().single();

            if (orderError) throw orderError;

            // 3. Create Order Items
            const orderItems = processedItems.map(item => ({
                order_id: order.id,
                product_id: item.id, // Now all items have IDs
                quantity: item.quantity,
                unit_price: item.price
            }));



            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const { error: itemsError } = await (supabase.from('order_items') as any).insert(orderItems);
            if (itemsError) throw itemsError;

            toast.success("Cotización guardada exitosamente");
            toast.success("Cotización guardada exitosamente");
            localStorage.removeItem("quote_draft"); // Clear draft after save
            router.push('/quotes');

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (error: any) {
            console.error(error);
            toast.error("Error al guardar cotización: " + error.message);
        }
    };

    return (
        <div className="p-6 space-y-6 max-w-[1400px] mx-auto transition-all">
            <style jsx global>{`
                @media print {
                    body {
                        visibility: hidden;
                        background: white;
                    }
                    #printable-quote-section {
                        visibility: visible;
                        position: absolute;
                        left: 0;
                        top: 0;
                        width: 100%;
                        margin: 0;
                        padding: 0;
                        background: white;
                        color: black;
                        z-index: 9999;
                    }
                    #printable-quote-section * {
                        visibility: visible;
                    }
                    #printable-quote-section .card {
                        border: none !important;
                        box-shadow: none !important;
                    }
                    @page {
                        margin: 1.5cm;
                    }
                }
            `}</style>

            <div className="flex justify-between items-center print:hidden">
                <h1 className="text-3xl font-bold tracking-tight">Nueva Cotización</h1>
                <div className="flex items-center gap-4">
                    <div className="flex items-center space-x-2 bg-muted p-2 rounded-lg">
                        <Switch id="view-mode" checked={isInternalView} onCheckedChange={setIsInternalView} />
                        <Label htmlFor="view-mode" className="cursor-pointer flex items-center gap-2">
                            {isInternalView ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                            {isInternalView ? "Vista Interna (Admin)" : "Vista Cliente"}
                        </Label>
                    </div>
                    <Button variant="destructive" onClick={clearDraft} className="mr-2">Limpiar</Button>
                    <Button variant="outline" onClick={() => router.back()}>Cancelar</Button>
                </div>
            </div>

            <div className={`grid grid-cols-1 ${isInternalView ? 'lg:grid-cols-[350px_1fr]' : 'lg:grid-cols-1'} gap-6 print:block`}>

                {/* LEFT SIDEBAR: Controls (Hidden in Client View / Print) */}
                {isInternalView && (
                    <div className="space-y-6 print:hidden">
                        {/* CUSTOMER FORM */}
                        <Card>
                            <CardHeader className="py-4">
                                <CardTitle className="text-lg">Cliente</CardTitle>
                            </CardHeader>
                            <CardContent className="py-4">
                                <Form {...form}>
                                    <form className="space-y-3">
                                        <FormField control={form.control} name="doc_number" render={({ field }) => (
                                            <FormItem className="space-y-1"><FormLabel>RUC / CI</FormLabel><FormControl><Input {...field} className="h-8" /></FormControl><FormMessage /></FormItem>
                                        )} />
                                        <FormField control={form.control} name="name" render={({ field }) => (
                                            <FormItem className="space-y-1"><FormLabel>Nombre / Razón Social</FormLabel><FormControl><Input {...field} className="h-8" /></FormControl><FormMessage /></FormItem>
                                        )} />
                                        <div className="grid grid-cols-2 gap-2">
                                            <FormField control={form.control} name="phone" render={({ field }) => (
                                                <FormItem className="space-y-1"><FormLabel>Teléfono</FormLabel><FormControl><Input {...field} className="h-8" /></FormControl><FormMessage /></FormItem>
                                            )} />
                                            <FormField control={form.control} name="email" render={({ field }) => (
                                                <FormItem className="space-y-1"><FormLabel>Email</FormLabel><FormControl><Input {...field} className="h-8" /></FormControl><FormMessage /></FormItem>
                                            )} />
                                        </div>
                                        <FormField control={form.control} name="address" render={({ field }) => (
                                            <FormItem className="space-y-1"><FormLabel>Dirección</FormLabel><FormControl><Input {...field} className="h-8" /></FormControl><FormMessage /></FormItem>
                                        )} />
                                    </form>
                                </Form>
                            </CardContent>
                        </Card>

                        {/* ADD ITEM */}
                        <Card>
                            <CardHeader className="py-4">
                                <CardTitle className="text-lg">Agregar Productos</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4 py-4">
                                <Dialog open={isSearchOpen} onOpenChange={setIsSearchOpen}>
                                    <DialogTrigger asChild>
                                        <Button className="w-full" variant="default">
                                            <Search className="mr-2 h-4 w-4" /> Buscar en Catálogo
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent className="max-w-2xl">
                                        <DialogHeader><DialogTitle>Buscar Producto</DialogTitle></DialogHeader>
                                        <div className="flex gap-2">
                                            <Input
                                                placeholder="Buscar por nombre..."
                                                value={searchQuery}
                                                onChange={e => setSearchQuery(e.target.value)}
                                                onKeyDown={e => e.key === 'Enter' && handleSearch()}
                                            />
                                            <Button onClick={handleSearch}>Buscar</Button>
                                        </div>
                                        <div className="max-h-[400px] overflow-y-auto space-y-2 mt-4">
                                            {searchResults.map(prod => (
                                                <div key={prod.id} className="flex gap-4 items-center p-2 border rounded hover:bg-muted cursor-pointer transition-colors" onClick={() => addProductItem(prod)}>
                                                    <div className="h-12 w-12 bg-muted rounded overflow-hidden flex-shrink-0 relative">
                                                        {prod.image_url ? <Image src={prod.image_url} alt="" fill className="object-cover" /> : <ImageIcon className="p-2 opacity-50 w-full h-full" />}
                                                    </div>
                                                    <div className="flex-1">
                                                        <p className="font-medium">{prod.name}</p>
                                                        <div className="flex gap-4 text-xs text-muted-foreground">
                                                            <span>SKU: {prod.sku}</span>
                                                            <span>Stock: {prod.stock_physical}</span>
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <div className="font-bold text-primary">{formatCurrency(prod.price_public)}</div>
                                                        <div className="text-xs text-muted-foreground">Costo: {formatCurrency(prod.cost_price || 0)}</div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </DialogContent>
                                </Dialog>

                                <div className="relative">
                                    <div className="absolute inset-0 flex items-center"><span className="w-full border-t" /></div>
                                    <div className="relative flex justify-center text-xs uppercase"><span className="bg-background px-2 text-muted-foreground">Manual</span></div>
                                </div>

                                <div className="space-y-3">
                                    <Input placeholder="Descripción Ítem" value={customItem.name} onChange={e => setCustomItem({ ...customItem, name: e.target.value })} />

                                    {/* Calculator Section */}
                                    <div className="border border-blue-200 dark:border-blue-900 bg-blue-50/50 dark:bg-blue-900/10 rounded-lg p-3 space-y-3">
                                        <div className="space-y-1">
                                            <Label className="text-xs">Costo Ingresado (Factura) $</Label>
                                            <Input
                                                type="number"
                                                value={calcCost}
                                                onChange={e => setCalcCost(e.target.value)}
                                                placeholder="0.00"
                                                className="bg-white dark:bg-slate-950"
                                            />
                                        </div>

                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <Switch
                                                    checked={taxIncluded}
                                                    onCheckedChange={setTaxIncluded}
                                                    id="tax-included-quote"
                                                />
                                                <Label htmlFor="tax-included-quote" className="cursor-pointer text-xs">
                                                    ¿IVA Incluido en Costo?
                                                </Label>
                                            </div>
                                        </div>

                                        <div className="space-y-1">
                                            <Label className="text-xs">Margen Ganancia (%)</Label>
                                            <Input
                                                type="number"
                                                value={profitMargin}
                                                onChange={e => setProfitMargin(e.target.value)}
                                                placeholder="30"
                                                className="bg-white dark:bg-slate-950"
                                            />
                                        </div>

                                        {calculatedPrice > 0 && (
                                            <div className="pt-2 border-t border-blue-200 dark:border-blue-900 space-y-1 text-sm">
                                                <div className="flex justify-between">
                                                    <span className="text-muted-foreground">Costo Neto:</span>
                                                    <span className="font-medium">{formatCurrency(calculatedNetCost)}</span>
                                                </div>
                                                <div className="flex justify-between text-green-600 font-bold">
                                                    <span>Precio Venta:</span>
                                                    <span>{formatCurrency(calculatedPrice)}</span>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    <Input placeholder="URL de Imagen (Opcional)" value={customItem.image_url} onChange={e => setCustomItem({ ...customItem, image_url: e.target.value })} />
                                    <Input placeholder="SKU (Opcional)" value={customItem.sku} onChange={e => setCustomItem({ ...customItem, sku: e.target.value })} />

                                    <div className="flex items-center space-x-2 pt-2">
                                        <Switch id="add-catalog" checked={customItem.addToCatalog} onCheckedChange={c => setCustomItem({ ...customItem, addToCatalog: c })} />
                                        <Label htmlFor="add-catalog">Guardar en Catálogo</Label>
                                    </div>
                                    <Button onClick={addCustomItem} className="w-full" variant="outline"><Plus className="mr-2 h-4 w-4" /> Agregar Manual</Button>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                )}

                {/* RIGHT/Main Area: Quote Details */}
                <div className="space-y-6" id="printable-quote-section">
                    <Card className="h-full flex flex-col min-h-[500px] border shadow-sm print:border-none print:shadow-none">
                        <CardHeader className="border-b bg-muted/10 pb-6 print:pb-2 print:pt-0">
                            {/* Header con logo, título centrado y datos */}
                            <div className="flex items-start justify-between">
                                {/* Logo a la izquierda */}
                                <div className="flex-shrink-0">
                                    <img src="/logo.png" alt="Center Tecno" className="h-20 w-auto object-contain" />
                                </div>

                                {/* Título centrado */}
                                <div className="flex-1 text-center">
                                    <CardTitle className="text-3xl font-bold uppercase tracking-wide">Cotización</CardTitle>
                                    <p className="text-sm text-muted-foreground mt-1">Fecha: {new Date().toLocaleDateString()}</p>
                                </div>

                                {/* Datos del cliente a la derecha */}
                                <div className="text-right text-sm flex-shrink-0 max-w-[200px]">
                                    {form.getValues("name") ? (
                                        <div className="border rounded p-2 bg-muted/20 print:border-none print:px-0 print:bg-transparent">
                                            <p className="font-bold">{form.getValues("name")}</p>
                                            <p>{form.getValues("doc_number")}</p>
                                            <p>{form.getValues("email")}</p>
                                            <p>{form.getValues("phone")}</p>
                                        </div>
                                    ) : (
                                        <p className="text-muted-foreground italic">Cliente sin especificar</p>
                                    )}
                                </div>
                            </div>

                            {/* Datos de la empresa debajo del header */}
                            <div className="text-xs text-muted-foreground text-center mt-4 pt-4 border-t">
                                <p className="font-semibold">Center Tecno - Lo mejor en tecnología siempre</p>
                                <p>Mucho Lote 2, Urb. Valle Victoria, Mz 2841 V1, Local 7 | RUC: 0993404554001</p>
                                <p>Telf: +593 99 809 4487 | admin@center-tecno.com</p>
                            </div>
                        </CardHeader>

                        <CardContent className="flex-1 p-0">
                            <Table>
                                <TableHeader className="bg-muted/30">
                                    <TableRow>
                                        <TableHead className="w-[80px]">Img</TableHead>
                                        <TableHead>Producto</TableHead>
                                        {isInternalView && <TableHead className="text-right w-[100px] print:hidden">Costo</TableHead>}
                                        {isInternalView && <TableHead className="text-right w-[100px] print:hidden">Margen %</TableHead>}
                                        <TableHead className="text-center w-[100px]">Cant.</TableHead>
                                        <TableHead className="text-right w-[120px]">Precio Unit.</TableHead>
                                        <TableHead className="text-right w-[120px]">Total</TableHead>
                                        <TableHead className="w-[50px] print:hidden"></TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {items.length === 0 && (
                                        <TableRow>
                                            <TableCell colSpan={8} className="text-center text-muted-foreground h-32 italic">
                                                No hay ítems agregados a la cotización...
                                            </TableCell>
                                        </TableRow>
                                    )}
                                    {items.map((item, idx) => (
                                        <TableRow key={idx} className="group hover:bg-muted/10 transition-colors">
                                            {/* Image */}
                                            <TableCell className="py-2">
                                                <div className="h-12 w-12 bg-muted rounded overflow-hidden border relative flex-shrink-0">
                                                    {item.image_url ? (
                                                        <Image src={item.image_url} alt="" fill className="object-cover" sizes="48px" />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-muted-foreground"><ImageIcon className="h-4 w-4" /></div>
                                                    )}
                                                </div>
                                            </TableCell>

                                            {/* Name & SKU */}
                                            <TableCell>
                                                <div className="font-medium">{item.name}</div>
                                                <div className="text-xs text-muted-foreground">{item.sku}</div>
                                                {item.is_custom && <Badge variant="secondary" className="mt-1 text-[10px] h-4">Manual</Badge>}
                                            </TableCell>

                                            {/* INTERNAL: Cost */}
                                            {isInternalView && (
                                                <TableCell className="text-right print:hidden">
                                                    <Input
                                                        type="number"
                                                        value={item.cost}
                                                        onChange={e => updateItemField(idx, "cost", e.target.value)}
                                                        className="w-20 h-7 text-right ml-auto text-xs"
                                                    />
                                                </TableCell>
                                            )}

                                            {/* INTERNAL: Margin */}
                                            {isInternalView && (
                                                <TableCell className="text-right print:hidden">
                                                    <div className="relative w-20 ml-auto">
                                                        <Input
                                                            type="number"
                                                            value={item.margin}
                                                            onChange={e => updateItemField(idx, "margin", e.target.value)}
                                                            className={`w-full h-7 text-right text-xs pr-6 ${parseFloat(item.margin || "0") < 15 ? "text-red-500 border-red-200" : "text-green-600 border-green-200"}`}
                                                        />
                                                        <span className="absolute right-2 top-1.5 text-xs text-muted-foreground">%</span>
                                                    </div>
                                                </TableCell>
                                            )}

                                            {/* Quantity */}
                                            <TableCell className="text-center">
                                                {isInternalView ? (
                                                    <Input
                                                        type="number"
                                                        min="1"
                                                        value={item.quantity}
                                                        onChange={e => updateItemField(idx, "quantity", e.target.value)}
                                                        className="w-16 h-8 mx-auto text-center"
                                                    />
                                                ) : (
                                                    <span className="font-bold">{item.quantity}</span>
                                                )}
                                            </TableCell>

                                            {/* Unit Price */}
                                            <TableCell className="text-right">
                                                {isInternalView ? (
                                                    <Input
                                                        type="number"
                                                        value={item.price.toFixed(2)}
                                                        onChange={e => updateItemField(idx, "price", e.target.value)}
                                                        className="w-24 h-8 ml-auto text-right font-medium"
                                                    />
                                                ) : (
                                                    <span>{formatCurrency(item.price)}</span>
                                                )}
                                            </TableCell>

                                            {/* Total */}
                                            <TableCell className="text-right font-bold text-base">
                                                {formatCurrency(item.price * item.quantity)}
                                            </TableCell>

                                            {/* Actions */}
                                            <TableCell className="print:hidden">
                                                <Button variant="ghost" size="icon" onClick={() => removeItem(idx)} className="text-muted-foreground hover:text-destructive h-8 w-8">
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>

                            <div className="p-6 mt-4 space-y-4">
                                <div className="flex justify-end gap-12">
                                    {isInternalView && (
                                        <div className="space-y-1 text-right text-sm text-muted-foreground print:hidden">
                                            <p>Costo Total: {formatCurrency(totalCost)}</p>
                                            <p className="text-green-600 font-medium">Ganancia Estimada: {formatCurrency(profit)}</p>
                                        </div>
                                    )}
                                    <div className="text-right space-y-1">
                                        <div className="flex justify-end gap-4 text-sm text-muted-foreground">
                                            <span>Subtotal:</span>
                                            <span className="font-medium">{formatCurrency(subtotal)}</span>
                                        </div>
                                        <div className="flex justify-end gap-4 text-sm text-muted-foreground">
                                            <span>IVA (15%):</span>
                                            <span className="font-medium">{formatCurrency(tax)}</span>
                                        </div>
                                        <div className="pt-2 border-t mt-2">
                                            <p className="text-sm text-muted-foreground uppercase tracking-wider">Total a Pagar</p>
                                            <p className="text-4xl font-extrabold text-primary">{formatCurrency(total)}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </CardContent>

                        {/* Footer Controls */}
                        <div className="p-4 bg-muted/40 flex justify-between items-center border-t print:hidden">
                            <div className="text-xs text-muted-foreground">
                                * Los precios incluyen IVA si aplica.
                            </div>
                            <div className="flex gap-3">
                                <Button variant="outline" onClick={() => window.print()}>
                                    <Printer className="mr-2 h-4 w-4" /> Imprimir
                                </Button>
                                <Button onClick={form.handleSubmit(onSubmit)} disabled={items.length === 0} size="lg" className="px-8">
                                    <Save className="mr-2 h-4 w-4" /> Guardar
                                </Button>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
}
