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

export function BuilderSummary() {
    const { addItem } = useCartStore();
    const { totalPrice, issues, selection } = useBuilderStore();

    // Count items selected
    const itemsCount = Object.values(selection).filter(Boolean).length;

    // Has critical errors?
    const hasErrors = issues.some(i => i.type === 'error');

    const handleAddToCart = () => {
        // Filter null values
        const components = Object.values(selection).filter((c): c is NonNullable<typeof c> => c !== null);

        if (components.length === 0) return;

        components.forEach(component => {
            addItem(component);
        });

        toast.success("PC agregado al carrito exitosamente");
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
                <CardFooter>
                    <Button
                        className="w-full"
                        disabled={itemsCount === 0 || hasErrors}
                        onClick={handleAddToCart}
                    >
                        <ShoppingCart className="mr-2 h-4 w-4" />
                        Agregar al Carrito
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
