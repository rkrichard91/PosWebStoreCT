"use client"

import { useState } from "react"
import { Upload, X, Image as ImageIcon } from "lucide-react"
import Image from "next/image"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"

interface MultiImageUploadProps {
    value: string[]
    onChange: (urls: string[]) => void
    disabled?: boolean
}

export function MultiImageUpload({ value = [], onChange, disabled }: MultiImageUploadProps) {
    const [isLoading, setIsLoading] = useState(false)
    const supabase = createClient()

    const onUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) {
            return
        }

        setIsLoading(true)
        const files = Array.from(e.target.files)
        const newUrls: string[] = []

        try {
            for (const file of files) {
                const fileExt = file.name.split('.').pop()
                const fileName = `evidence_${Math.random().toString(36).substring(2)}.${fileExt}`
                const filePath = `repairs/${fileName}`

                const { error: uploadError } = await supabase.storage
                    .from('products') // Using products bucket as general storage for now
                    .upload(filePath, file)

                if (uploadError) {
                    throw uploadError
                }

                const { data: { publicUrl } } = supabase.storage
                    .from('products')
                    .getPublicUrl(filePath)

                newUrls.push(publicUrl)
            }

            onChange([...value, ...newUrls])
            toast.success("Imágenes subidas correctamente")
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (error: any) {
            toast.error("Error al subir imagen", { description: error.message })
        } finally {
            setIsLoading(false)
        }
    }

    const onRemove = (urlToRemove: string) => {
        onChange(value.filter(url => url !== urlToRemove))
    }

    return (
        <div className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {value.map((url) => (
                    <div key={url} className="relative aspect-square rounded-md overflow-hidden border bg-muted">
                        <div className="absolute top-2 right-2 z-10">
                            <Button
                                type="button"
                                onClick={() => onRemove(url)}
                                variant="destructive"
                                size="icon"
                                className="h-6 w-6"
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        </div>
                        <Image
                            src={url}
                            alt="Evidence"
                            fill
                            className="object-cover"
                        />
                    </div>
                ))}
                <div className="flex flex-col items-center justify-center aspect-square rounded-md border border-dashed bg-muted/50 hover:bg-muted/70 transition cursor-pointer relative">
                    <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={onUpload}
                        disabled={disabled || isLoading}
                        className="absolute inset-0 opacity-0 cursor-pointer"
                    />
                    {isLoading ? (
                        <div className="animate-pulse flex flex-col items-center">
                            <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                            <span className="text-xs text-muted-foreground">Subiendo...</span>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center">
                            <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                            <span className="text-xs text-muted-foreground">Subir Fotos</span>
                        </div>
                    )}
                </div>
            </div>

            <div className="flex items-center gap-2">
                <Input
                    placeholder="O pegar URL de imagen..."
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                            e.preventDefault();
                            const val = e.currentTarget.value;
                            if (val.trim()) {
                                onChange([...value, val.trim()]);
                                e.currentTarget.value = "";
                            }
                        }
                    }}
                    disabled={disabled || isLoading}
                />
                <Button type="button" variant="outline" size="icon" disabled>
                    <ImageIcon className="h-4 w-4" />
                </Button>
            </div>
            <p className="text-xs text-muted-foreground">Presiona Enter para agregar URL manualmente.</p>
        </div>
    )
}
