export interface PricingResult {
    costo: number;
    subtotal: number;       // Precio de venta sugerido (Base Imponible)
    montoIva: number;       // El 15% del subtotal
    pvp: number;            // Precio Final al Público (Etiqueta)
    impuestoRimpe: number;  // Estimado del impuesto a la renta (2%)
    gananciaNeta: number;   // Tu ganancia real (30% limpio)
    margenReal: string;     // Porcentaje real verificado
}

/**
 * Calcula el PVP para garantizar un margen de ganancia neto después de impuestos RIMPE.
 * @param costoSinIva - El costo del producto (sin IVA)
 * @param margenPorcentaje - El margen deseado (ej: 30 para 30%)
 * @param tasaIvaPorcentaje - La tasa de IVA aplicable (ej: 15 para 15%)
 */
export const calcularPrecioVenta = (
    costoSinIva: number,
    margenPorcentaje: number = 30,
    tasaIvaPorcentaje: number = 15
): PricingResult => {

    // Constantes de Tributación Ecuador
    const TASA_IVA = tasaIvaPorcentaje / 100;
    const TASA_RIMPE = 0.02; // Colchón de seguridad del 2% sobre ventas brutas

    // 1. Definir cuánto queremos que nos quede en el bolsillo (Costo + Ganancia)
    const margenDecimal = margenPorcentaje / 100;
    const objetivoRetorno = costoSinIva * (1 + margenDecimal);

    // 2. GROSS UP: Calcular el Subtotal necesario.
    // La fórmula es: Subtotal = Objetivo / (1 - TasaRimpe)
    // Esto "infla" el precio justo lo necesario para que cuando el SRI quite el 2%,
    // no afecte tu ganancia del 30%.
    const subtotal = objetivoRetorno / (1 - TASA_RIMPE);

    // 3. Calcular impuestos sobre ese subtotal
    const montoIva = subtotal * TASA_IVA;
    const impuestoRimpeEstimado = subtotal * TASA_RIMPE;

    // 4. Calcular PVP Final
    const pvp = subtotal + montoIva;

    // 5. Verificación de Ganancia Neta
    const gananciaNeta = subtotal - costoSinIva - impuestoRimpeEstimado;
    const margenRealCalculado = (gananciaNeta / costoSinIva) * 100;

    // Helper para redondear a 2 decimales y devolver número
    const round = (num: number) => Math.round((num + Number.EPSILON) * 100) / 100;

    return {
        costo: round(costoSinIva),
        subtotal: round(subtotal),
        montoIva: round(montoIva),
        pvp: round(pvp),
        impuestoRimpe: round(impuestoRimpeEstimado),
        gananciaNeta: round(gananciaNeta),
        margenReal: `${margenRealCalculado.toFixed(2)}%`
    };
};
