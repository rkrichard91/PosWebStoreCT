"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, ArrowLeft, Eye, EyeOff, Upload, X, ImageIcon } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

interface Banner {
    id: string;
    title: string;
    description: string | null;
    image_url: string | null;
    whatsapp_message: string | null;
    gradient_color: string;
    is_active: boolean;
    sort_order: number;
    created_at: string;
}

const GRADIENT_OPTIONS = [
    { value: "none", label: "Ninguno (Sin color)" },
    { value: "from-purple-600 to-indigo-600", label: "Púrpura → Índigo" },
    { value: "from-blue-600 to-cyan-600", label: "Azul → Cian" },
    { value: "from-orange-600 to-red-600", label: "Naranja → Rojo" },
    { value: "from-green-600 to-teal-600", label: "Verde → Teal" },
    { value: "from-pink-600 to-rose-600", label: "Rosa → Rose" },
    { value: "from-yellow-500 to-orange-500", label: "Amarillo → Naranja" },
];

const emptyBanner = {
    title: "",
    description: "",
    image_url: "",
    whatsapp_message: "",
    gradient_color: "from-purple-600 to-indigo-600",
    is_active: true,
    sort_order: 0,
};

export default function BannersPage() {
    const [banners, setBanners] = useState<Banner[]>([]);
    const [loading, setLoading] = useState(true);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingBanner, setEditingBanner] = useState<Banner | null>(null);
    const [formData, setFormData] = useState(emptyBanner);
    const [uploading, setUploading] = useState(false);
    const [isDragging, setIsDragging] = useState(false);

    const supabase = createClient();

    const fetchBanners = async () => {
        setLoading(true);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data, error } = await (supabase as any)
            .from("site_banners")
            .select("*")
            .order("sort_order", { ascending: true });

        if (error) {
            toast.error("Error al cargar banners");
            console.error(error);
        } else {
            setBanners(data || []);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchBanners();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const uploadImage = async (file: File) => {
        if (!file.type.startsWith("image/")) {
            toast.error("Solo se permiten imágenes");
            return null;
        }

        if (file.size > 5 * 1024 * 1024) {
            toast.error("La imagen no debe superar 5MB");
            return null;
        }

        setUploading(true);
        try {
            const fileExt = file.name.split(".").pop();
            const fileName = `banner_${Date.now()}.${fileExt}`;
            const filePath = `banners/${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from("products")
                .upload(filePath, file, { upsert: true });

            if (uploadError) {
                console.error(uploadError);
                toast.error("Error al subir la imagen");
                return null;
            }

            const { data: urlData } = supabase.storage
                .from("products")
                .getPublicUrl(filePath);

            return urlData.publicUrl;
        } catch (error) {
            console.error(error);
            toast.error("Error al subir la imagen");
            return null;
        } finally {
            setUploading(false);
        }
    };

    const handleFileSelect = async (file: File) => {
        const url = await uploadImage(file);
        if (url) {
            setFormData({ ...formData, image_url: url });
            toast.success("Imagen subida correctamente");
        }
    };

    const handleDrop = useCallback(async (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);

        const file = e.dataTransfer.files[0];
        if (file) {
            await handleFileSelect(file);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [formData]);

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.title.trim()) {
            toast.error("El título es requerido");
            return;
        }

        try {
            if (editingBanner) {
                // Update
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const { error } = await (supabase as any)
                    .from("site_banners")
                    .update({ ...formData, updated_at: new Date().toISOString() })
                    .eq("id", editingBanner.id);

                if (error) throw error;
                toast.success("Banner actualizado");
            } else {
                // Create
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const { error } = await (supabase as any)
                    .from("site_banners")
                    .insert([formData]);

                if (error) throw error;
                toast.success("Banner creado");
            }

            setDialogOpen(false);
            setEditingBanner(null);
            setFormData(emptyBanner);
            fetchBanners();
        } catch (error) {
            console.error(error);
            toast.error("Error al guardar el banner");
        }
    };

    const handleEdit = (banner: Banner) => {
        setEditingBanner(banner);
        setFormData({
            title: banner.title,
            description: banner.description || "",
            image_url: banner.image_url || "",
            whatsapp_message: banner.whatsapp_message || "",
            gradient_color: banner.gradient_color,
            is_active: banner.is_active,
            sort_order: banner.sort_order,
        });
        setDialogOpen(true);
    };

    const handleDelete = async (id: string) => {
        if (!confirm("¿Estás seguro de eliminar este banner?")) return;

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { error } = await (supabase as any)
            .from("site_banners")
            .delete()
            .eq("id", id);

        if (error) {
            toast.error("Error al eliminar el banner");
        } else {
            toast.success("Banner eliminado");
            fetchBanners();
        }
    };

    const toggleActive = async (banner: Banner) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { error } = await (supabase as any)
            .from("site_banners")
            .update({ is_active: !banner.is_active, updated_at: new Date().toISOString() })
            .eq("id", banner.id);

        if (error) {
            toast.error("Error al actualizar el banner");
        } else {
            fetchBanners();
        }
    };

    const handleNewBanner = () => {
        setEditingBanner(null);
        setFormData({ ...emptyBanner, sort_order: banners.length + 1 });
        setDialogOpen(true);
    };

    const clearImage = () => {
        setFormData({ ...formData, image_url: "" });
    };

    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/settings">
                        <Button variant="outline" size="icon">
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                    </Link>
                    <h2 className="text-3xl font-bold tracking-tight">Banners Promocionales</h2>
                </div>
                <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                    <DialogTrigger asChild>
                        <Button onClick={handleNewBanner}>
                            <Plus className="mr-2 h-4 w-4" />
                            Nuevo Banner
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>
                                {editingBanner ? "Editar Banner" : "Nuevo Banner"}
                            </DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="title">Título *</Label>
                                <Input
                                    id="title"
                                    placeholder="Ej: Gran Oferta en GPUs"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="description">Descripción</Label>
                                <Textarea
                                    id="description"
                                    placeholder="Descripción de la promoción"
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                />
                            </div>

                            {/* Image Upload Section */}
                            <div className="space-y-2">
                                <Label>Imagen del Banner</Label>

                                {formData.image_url ? (
                                    <div className="relative rounded-lg overflow-hidden border">
                                        <div className="relative h-40 w-full">
                                            <Image
                                                src={formData.image_url}
                                                alt="Banner preview"
                                                fill
                                                className="object-cover"
                                            />
                                        </div>
                                        <div className="absolute top-2 right-2 flex gap-2">
                                            <Button
                                                type="button"
                                                size="icon"
                                                variant="destructive"
                                                onClick={clearImage}
                                            >
                                                <X className="h-4 w-4" />
                                            </Button>
                                        </div>
                                        <div className="p-2 bg-muted/80 text-xs truncate">
                                            {formData.image_url}
                                        </div>
                                    </div>
                                ) : (
                                    <div
                                        onDrop={handleDrop}
                                        onDragOver={handleDragOver}
                                        onDragLeave={handleDragLeave}
                                        className={`
                                            border-2 border-dashed rounded-lg p-8 text-center cursor-pointer
                                            transition-colors duration-200
                                            ${isDragging ? 'border-primary bg-primary/5' : 'border-muted-foreground/25 hover:border-primary/50'}
                                            ${uploading ? 'pointer-events-none opacity-50' : ''}
                                        `}
                                    >
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={(e) => {
                                                const file = e.target.files?.[0];
                                                if (file) handleFileSelect(file);
                                            }}
                                            className="hidden"
                                            id="banner-image-input"
                                        />
                                        <label htmlFor="banner-image-input" className="cursor-pointer">
                                            <div className="flex flex-col items-center gap-2">
                                                {uploading ? (
                                                    <>
                                                        <div className="animate-spin h-10 w-10 border-2 border-primary border-t-transparent rounded-full" />
                                                        <p className="text-sm text-muted-foreground">Subiendo...</p>
                                                    </>
                                                ) : (
                                                    <>
                                                        <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                                                            <Upload className="h-6 w-6 text-primary" />
                                                        </div>
                                                        <p className="text-sm font-medium">Arrastra una imagen aquí</p>
                                                        <p className="text-xs text-muted-foreground">
                                                            o haz clic para seleccionar (máx. 5MB)
                                                        </p>
                                                    </>
                                                )}
                                            </div>
                                        </label>
                                    </div>
                                )}

                                {/* URL Input as alternative */}
                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                    <span>— o usa una URL directa —</span>
                                </div>
                                <Input
                                    placeholder="https://ejemplo.com/imagen.jpg"
                                    value={formData.image_url}
                                    onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="whatsapp_message">Mensaje de WhatsApp</Label>
                                <Textarea
                                    id="whatsapp_message"
                                    placeholder="Hola, vi la promoción de..."
                                    value={formData.whatsapp_message}
                                    onChange={(e) => setFormData({ ...formData, whatsapp_message: e.target.value })}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Color de Fondo</Label>
                                    <Select
                                        value={formData.gradient_color}
                                        onValueChange={(value) => setFormData({ ...formData, gradient_color: value })}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {GRADIENT_OPTIONS.map((opt) => (
                                                <SelectItem key={opt.value} value={opt.value}>
                                                    <div className="flex items-center gap-2">
                                                        <div className={`h-4 w-8 rounded bg-gradient-to-r ${opt.value}`} />
                                                        {opt.label}
                                                    </div>
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="sort_order">Orden</Label>
                                    <Input
                                        id="sort_order"
                                        type="number"
                                        value={formData.sort_order}
                                        onChange={(e) => setFormData({ ...formData, sort_order: parseInt(e.target.value) || 0 })}
                                    />
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                <Switch
                                    id="is_active"
                                    checked={formData.is_active}
                                    onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                                />
                                <Label htmlFor="is_active">Activo</Label>
                            </div>

                            <div className="flex justify-end gap-2">
                                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                                    Cancelar
                                </Button>
                                <Button type="submit" disabled={uploading}>
                                    {editingBanner ? "Guardar Cambios" : "Crear Banner"}
                                </Button>
                            </div>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Banners del Carrusel</CardTitle>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <p className="text-center py-8 text-muted-foreground">Cargando...</p>
                    ) : banners.length === 0 ? (
                        <p className="text-center py-8 text-muted-foreground">No hay banners. Crea el primero.</p>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[50px]">Orden</TableHead>
                                    <TableHead className="w-[80px]">Imagen</TableHead>
                                    <TableHead>Título</TableHead>
                                    <TableHead>Color</TableHead>
                                    <TableHead>Estado</TableHead>
                                    <TableHead className="text-right">Acciones</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {banners.map((banner) => (
                                    <TableRow key={banner.id}>
                                        <TableCell className="font-mono">{banner.sort_order}</TableCell>
                                        <TableCell>
                                            {banner.image_url ? (
                                                <div className="relative h-10 w-16 rounded overflow-hidden">
                                                    <Image
                                                        src={banner.image_url}
                                                        alt={banner.title}
                                                        fill
                                                        className="object-cover"
                                                    />
                                                </div>
                                            ) : (
                                                <div className="h-10 w-16 rounded bg-muted flex items-center justify-center">
                                                    <ImageIcon className="h-4 w-4 text-muted-foreground" />
                                                </div>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <div>
                                                <p className="font-medium">{banner.title}</p>
                                                <p className="text-xs text-muted-foreground truncate max-w-[200px]">
                                                    {banner.description}
                                                </p>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            {banner.gradient_color === 'none' ? (
                                                <div className="text-xs text-muted-foreground border rounded px-2 py-1 inline-block">Ninguno</div>
                                            ) : (
                                                <div className={`h-6 w-16 rounded bg-gradient-to-r ${banner.gradient_color}`} />
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => toggleActive(banner)}
                                                className={banner.is_active ? "text-green-600" : "text-muted-foreground"}
                                            >
                                                {banner.is_active ? (
                                                    <><Eye className="h-4 w-4 mr-1" /> Activo</>
                                                ) : (
                                                    <><EyeOff className="h-4 w-4 mr-1" /> Oculto</>
                                                )}
                                            </Button>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Button variant="ghost" size="icon" onClick={() => handleEdit(banner)}>
                                                <Pencil className="h-4 w-4" />
                                            </Button>
                                            <Button variant="ghost" size="icon" onClick={() => handleDelete(banner.id)}>
                                                <Trash2 className="h-4 w-4 text-destructive" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
