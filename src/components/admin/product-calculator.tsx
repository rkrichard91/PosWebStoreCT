'use client';

import { useState, useEffect } from 'react';
import { calcularPrecioVenta, PricingResult } from '@/utils/pricing';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Calculator } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

export default function ProductCalculator() {
    const [costo, setCosto] = useState<string>('');
    const [margen, setMargen] = useState<string>('30');
    const [resultado, setResultado] = useState<PricingResult | null>(null);

    useEffect(() => {
        const valorCosto = parseFloat(costo);
        const valorMargen = parseFloat(margen);

        if (!isNaN(valorCosto) && valorCosto > 0 && !isNaN(valorMargen)) {
            const calculo = calcularPrecioVenta(valorCosto, valorMargen);
            setResultado(calculo);
        } else {
            setResultado(null);
        }
    }, [costo, margen]);

    return (
        <Card className="w-full max-w-md mx-auto border-blue-200 dark:border-blue-900 bg-blue-50/30 dark:bg-blue-900/10">
            <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-xl text-blue-900 dark:text-blue-100">
                    <Calculator className="h-6 w-6" />
                    Calculadora Center Tecno
                </CardTitle>
                <CardDescription>
                    Simulador de precios con Ajuste RIMPE (Gross Up)
                </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="costo-input">Costo (Sin IVA)</Label>
                        <div className="relative">
                            <span className="absolute left-3 top-2.5 text-muted-foreground">$</span>
                            <Input
                                id="costo-input"
                                type="number"
                                value={costo}
                                onChange={(e) => setCosto(e.target.value)}
                                className="pl-7 bg-background"
                                placeholder="0.00"
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="margen-input">Margen (%)</Label>
                        <div className="relative">
                            <Input
                                id="margen-input"
                                type="number"
                                value={margen}
                                onChange={(e) => setMargen(e.target.value)}
                                className="bg-background pr-8"
                                placeholder="30"
                            />
                            <span className="absolute right-3 top-2.5 text-muted-foreground">%</span>
                        </div>
                    </div>
                </div>

                {resultado && (
                    <div className="space-y-3 bg-white/50 dark:bg-black/20 p-4 rounded-lg border border-blue-100 dark:border-blue-800">

                        <div className="flex justify-between items-center pb-2 border-b border-dashed border-gray-300 dark:border-gray-700">
                            <span className="text-sm text-muted-foreground">Precio Base (Subtotal):</span>
                            <span className="font-semibold">{formatCurrency(resultado.subtotal)}</span>
                        </div>

                        <div className="flex justify-between items-center text-orange-600 dark:text-orange-400">
                            <span className="text-sm">IVA (15%):</span>
                            <span className="text-sm">+ {formatCurrency(resultado.montoIva)}</span>
                        </div>

                        <div className="flex justify-between items-center pt-2 border-t border-gray-300 dark:border-gray-700 mt-2">
                            <span className="font-bold text-lg">PVP (Etiqueta):</span>
                            <span className="font-bold text-lg text-blue-600 dark:text-blue-400">
                                {formatCurrency(resultado.pvp)}
                            </span>
                        </div>

                        <div className="mt-4 pt-3 border-t border-dashed border-gray-400 dark:border-gray-600">
                            <p className="text-[10px] text-muted-foreground uppercase font-semibold mb-2 tracking-wider">
                                Desglose Interno (Ganancia Real)
                            </p>
                            <div className="grid grid-cols-2 gap-2 text-xs">
                                <div className="flex justify-between">
                                    <span>Reserva RIMPE (2%):</span>
                                    <span className="text-orange-600 font-mono">{formatCurrency(resultado.impuestoRimpe)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Ganancia Neta:</span>
                                    <span className="text-green-600 font-bold font-mono">{formatCurrency(resultado.gananciaNeta)}</span>
                                </div>
                            </div>
                            <p className="text-right text-xs text-green-700 dark:text-green-400 mt-2 font-bold bg-green-100 dark:bg-green-900/30 py-1 px-2 rounded inline-block w-full">
                                Margen Real Efectivo: {resultado.margenReal}
                            </p>
                        </div>

                    </div>
                )}
            </CardContent>
        </Card>
    );
}
