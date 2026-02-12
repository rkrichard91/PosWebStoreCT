import { calcularPrecioVenta } from './src/utils/pricing';

const testCases = [
    { costo: 100, margen: 30, tasa: 15 },
    { costo: 50, margen: 20, tasa: 12 }, // Test different tax
    { costo: 200, margen: 40, tasa: 0 },  // Test 0 tax
];

console.log("--- Verificación Lógica de Precios (Gross Up) ---");

testCases.forEach(({ costo, margen, tasa }) => {
    const resultado = calcularPrecioVenta(costo, margen, tasa);
    console.log(`\nCosto: $${costo} | Margen Deseado: ${margen}% | Tasa IVA: ${tasa}%`);
    console.log(`  -> Subtotal (Precio Sugerido): $${resultado.subtotal}`);
    console.log(`  -> IVA (15%): $${resultado.montoIva}`);
    console.log(`  -> PVP (Etiqueta): $${resultado.pvp}`);
    console.log(`  --- Validación ---`);
    console.log(`  -> Ganancia Neta Calculada: $${resultado.gananciaNeta}`);
    console.log(`  -> Margen Real Obt.: ${resultado.margenReal}`);

    const gananciaEsperada = costo * (margen / 100);
    // Margen de error pequeño por redondeo es aceptable
    const diff = Math.abs(resultado.gananciaNeta - gananciaEsperada);
    if (diff < 0.05) {
        console.log(`  ✅ CORRECTO (Ganancia esperada: $${gananciaEsperada.toFixed(2)})`);
    } else {
        console.log(`  ❌ DISCREPANCIA (Ganancia esperada: $${gananciaEsperada.toFixed(2)}, Diff: ${diff.toFixed(4)})`);
    }
});
