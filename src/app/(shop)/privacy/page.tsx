export default function PrivacyPage() {
    return (
        <div className="container py-10 max-w-4xl animate__animated animate__fadeIn">
            <h1 className="text-3xl font-bold mb-6">Política de Privacidad</h1>
            <div className="prose dark:prose-invert max-w-none space-y-4">
                <p><strong>Última actualización:</strong> {new Date().toLocaleDateString()}</p>

                <h2 className="text-2xl font-semibold mt-6">1. Información que Recopilamos</h2>
                <p>Recopilamos información personal que nos proporcionas voluntariamente al registrarte, realizar una compra o contactarnos, incluyendo nombre, correo electrónico, dirección y número de teléfono.</p>

                <h2 className="text-2xl font-semibold mt-6">2. Uso de la Información</h2>
                <p>Utilizamos tu información para procesar pedidos, gestionar reparaciones, mejorar nuestro servicio al cliente y enviarte actualizaciones sobre tus transacciones.</p>

                <h2 className="text-2xl font-semibold mt-6">3. Protección de Datos</h2>
                <p>Implementamos medidas de seguridad diseñadas para proteger tu información personal contra acceso no autorizado y uso indebido.</p>

                <h2 className="text-2xl font-semibold mt-6">4. Cookies</h2>
                <p>Utilizamos cookies para mejorar la experiencia de navegación y analizar el tráfico del sitio. Puedes configurar tu navegador para rechazar las cookies si lo prefieres.</p>

                <h2 className="text-2xl font-semibold mt-6">5. Contacto</h2>
                <p>Si tienes preguntas sobre nuestra política de privacidad, contáctanos a través de admin@center-tecno.com.</p>
            </div>
        </div>
    );
}
