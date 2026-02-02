"use client";

import { useBuilderStore } from "@/store/builder-store";
import { useCartStore } from "@/store/cart-store";
import { toast } from "sonner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, AlertTriangle, CheckCircle2, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { formatCurrency } from "@/lib/utils";
import { submitQuote } from "@/actions/quote-actions";
import { useState } from "react";
import { FileText } from "lucide-react";

export function BuilderSummary() {
    const { addItem } = useCartStore();
    const { totalPrice, issues, selection } = useBuilderStore();

    // Count items selected
    const itemsCount = Object.values(selection).filter(Boolean).length;

    // Has critical errors?
    const hasErrors = issues.some(i => i.type === 'error');

    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleAddToCart = () => {
        // Filter null values
        const components = Object.values(selection).filter((c): c is NonNullable<typeof c> => c !== null);

        if (components.length === 0) return;

        components.forEach(component => {
            addItem(component);
        });

        toast.success("PC agregado al carrito exitosamente");
    };

    const handleSendQuote = async () => {
        setIsSubmitting(true);
        try {
            // Filter null values for clean storage
            const components = Object.values(selection).filter((c): c is NonNullable<typeof c> => c !== null);

            if (components.length === 0) {
                toast.error("Selecciona al menos un componente");
                return;
            }

            const result = await submitQuote(selection, totalPrice);

            if (result.success) {
                toast.success(result.message);
            } else {
                toast.error(result.message);
            }
        } catch (error) {
            console.error(error);
            toast.error("Error al enviar la cotización");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="space-y-4">
            <Card>
                <CardHeader>
                    <CardTitle>Resumen de tu PC</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Componentes:</span>
                        <span className="font-medium">{itemsCount} seleccionados</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between items-center text-lg font-bold">
                        <span>Total Estimado:</span>
                        <span className="text-primary">{formatCurrency(totalPrice)}</span>
                    </div>
                </CardContent>
                <CardFooter className="flex flex-col gap-2">
                    <Button
                        className="w-full"
                        disabled={itemsCount === 0 || hasErrors}
                        onClick={handleAddToCart}
                    >
                        <ShoppingCart className="mr-2 h-4 w-4" />
                        Agregar al Carrito
                    </Button>
                    <Button
                        variant="outline"
                        className="w-full"
                        disabled={itemsCount === 0 || isSubmitting}
                        onClick={handleSendQuote}
                    >
                        <FileText className="mr-2 h-4 w-4" />
                        {isSubmitting ? 'Enviando...' : 'Solicitar Cotización'}
                    </Button>
                </CardFooter>
            </Card>

            {/* Compatibility Status */}
            <div className="space-y-3">
                {issues.length === 0 && itemsCount > 0 && (
                    <Alert className="border-green-500/50 bg-green-500/10 text-green-600 dark:text-green-400">
                        <CheckCircle2 className="h-4 w-4" />
                        <AlertTitle>Todo compatible</AlertTitle>
                        <AlertDescription>
                            Tus componentes funcionan bien juntos.
                        </AlertDescription>
                    </Alert>
                )}

                {issues.map((issue, idx) => (
                    <Alert
                        key={idx}
                        variant={issue.type === 'error' ? "destructive" : "default"}
                        className={issue.type === 'warning' ? "border-yellow-500/50 bg-yellow-500/10 text-yellow-600 dark:text-yellow-400" : ""}
                    >
                        {issue.type === 'error' ? <AlertCircle className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />}
                        <AlertTitle>
                            {issue.type === 'error' ? 'Incompatible' : 'Advertencia'}
                        </AlertTitle>
                        <AlertDescription>
                            {issue.message}
                        </AlertDescription>
                    </Alert>
                ))}
            </div>
        </div>
    );
}
