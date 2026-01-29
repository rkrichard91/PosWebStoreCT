"use client"

import { useState } from "react"
import { Upload, X } from "lucide-react"
import Image from "next/image"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"

interface ImageUploadProps {
    value: string | null
    onChange: (url: string) => void
    disabled?: boolean
}

export function ImageUpload({ value, onChange, disabled }: ImageUploadProps) {
    const [isLoading, setIsLoading] = useState(false)
    const supabase = createClient()

    const onUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) {
            return
        }

        setIsLoading(true)
        const file = e.target.files[0]
        const fileExt = file.name.split('.').pop()
        const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`
        const filePath = `${fileName}`

        try {
            const { error: uploadError } = await supabase.storage
                .from('products')
                .upload(filePath, file)

            if (uploadError) {
                throw uploadError
            }

            const { data: { publicUrl } } = supabase.storage
                .from('products')
                .getPublicUrl(filePath)

            onChange(publicUrl)
            toast.success("Imagen subida correctamente")
        } catch (error: any) {
            toast.error("Error al subir imagen", { description: error.message })
        } finally {
            setIsLoading(false)
        }
    }

    const onRemove = () => {
        onChange("")
    }

    return (
        <div className="flex flex-col md:flex-row items-start gap-4">
            <div className="relative w-40 h-40 shrink-0 rounded-md overflow-hidden border border-input bg-muted flex items-center justify-center">
                {value ? (
                    <>
                        <div className="absolute top-2 right-2 z-10">
                            <Button type="button" onClick={onRemove} variant="destructive" size="icon" className="h-6 w-6">
                                <X className="h-4 w-4" />
                            </Button>
                        </div>
                        <Image
                            src={value}
                            alt="Product Image"
                            fill
                            className="object-cover"
                        />
                    </>
                ) : (
                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                        <Upload className="h-8 w-8" />
                        <span className="text-xs">Sin imagen</span>
                    </div>
                )}
            </div>
            <div className="flex-1 w-full space-y-4">
                <div className="space-y-2">
                    <span className="text-sm font-medium">Subir desde dispositivo</span>
                    <Input
                        type="file"
                        accept="image/*"
                        onChange={onUpload}
                        disabled={disabled || isLoading}
                    />
                </div>

                <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-background px-2 text-muted-foreground">
                            O pegar URL
                        </span>
                    </div>
                </div>

                <div className="space-y-2">
                    <span className="text-sm font-medium">URL de la imagen</span>
                    <Input
                        type="text"
                        placeholder="https://ejemplo.com/imagen.jpg"
                        value={value || ""}
                        onChange={(e) => onChange(e.target.value)}
                        disabled={disabled || isLoading}
                    />
                </div>

                {isLoading && (
                    <p className="text-sm text-muted-foreground animate-pulse">
                        Subiendo imagen...
                    </p>
                )}
            </div>
        </div>
    )
}
