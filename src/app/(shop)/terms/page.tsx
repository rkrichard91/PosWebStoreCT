export default function TermsPage() {
    return (
        <div className="container py-10 max-w-4xl animate__animated animate__fadeIn">
            <h1 className="text-3xl font-bold mb-6">Términos y Condiciones</h1>
            <div className="prose dark:prose-invert max-w-none space-y-4">
                <p><strong>Última actualización:</strong> {new Date().toLocaleDateString()}</p>

                <h2 className="text-2xl font-semibold mt-6">1. Introducción</h2>
                <p>Bienvenido a Center Tecno. Al acceder a nuestro sitio web y utilizar nuestros servicios, aceptas cumplir con los siguientes términos y condiciones.</p>

                <h2 className="text-2xl font-semibold mt-6">2. Productos y Servicios</h2>
                <p>Nos esforzamos por mostrar con precisión los colores, características y especificaciones de nuestros productos. Sin embargo, no garantizamos que dicha información sea completa, precisa o libre de errores.</p>

                <h2 className="text-2xl font-semibold mt-6">3. Garantías</h2>
                <p>Todos nuestros productos de hardware cuentan con garantía limitada contra defectos de fábrica. Los servicios de reparación tienen una garantía de 30 días sobre la mano de obra realizada.</p>

                <h2 className="text-2xl font-semibold mt-6">4. Pagos</h2>
                <p>Aceptamos pagos mediante tarjeta de crédito, transferencia bancaria y efectivo en local. Todas las transacciones están sujetas a validación.</p>

                <h2 className="text-2xl font-semibold mt-6">5. Cambios en los Términos</h2>
                <p>Nos reservamos el derecho de modificar estos términos en cualquier momento. Los cambios entrarán en vigor inmediatamente después de su publicación en el sitio web.</p>
            </div>
        </div>
    );
}
