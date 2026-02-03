import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Image, Building2, MessageCircle, CreditCard, Mail, Printer, BarChart3 } from "lucide-react";

export const metadata = {
    title: "Configuración | Admin Dashboard",
    description: "Configuración del sistema",
};

const settingsModules = [
    {
        title: "Banners Promocionales",
        description: "Gestiona los banners del carrusel de la página de inicio",
        icon: Image,
        href: "/settings/banners",
        available: true,
    },
    {
        title: "Datos de la Empresa",
        description: "Logo, dirección, teléfono, redes sociales",
        icon: Building2,
        href: "/settings/company",
        available: false,
    },
    {
        title: "WhatsApp",
        description: "Número de contacto y mensajes predeterminados",
        icon: MessageCircle,
        href: "/settings/whatsapp",
        available: false,
    },
    {
        title: "Métodos de Pago",
        description: "Configurar métodos de pago y cuentas bancarias",
        icon: CreditCard,
        href: "/settings/payments",
        available: false,
    },
    {
        title: "Notificaciones",
        description: "Emails y plantillas de notificación",
        icon: Mail,
        href: "/settings/notifications",
        available: false,
    },
    {
        title: "Impresión POS",
        description: "Configuración de impresora y formato de tickets",
        icon: Printer,
        href: "/settings/pos",
        available: false,
    },
    {
        title: "SEO y Analytics",
        description: "Meta tags y Google Analytics",
        icon: BarChart3,
        href: "/settings/seo",
        available: false,
    },
];

export default function SettingsPage() {
    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">Configuración</h2>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {settingsModules.map((module) => (
                    <Card
                        key={module.title}
                        className={`relative ${!module.available ? 'opacity-60' : 'hover:shadow-md transition-shadow cursor-pointer'}`}
                    >
                        {!module.available && (
                            <div className="absolute top-2 right-2 bg-muted text-muted-foreground text-xs px-2 py-1 rounded">
                                Próximamente
                            </div>
                        )}
                        <CardHeader className="flex flex-row items-center gap-4">
                            <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                                <module.icon className="h-6 w-6 text-primary" />
                            </div>
                            <div className="flex-1">
                                <CardTitle className="text-lg">{module.title}</CardTitle>
                                <CardDescription>{module.description}</CardDescription>
                            </div>
                        </CardHeader>
                        <CardContent>
                            {module.available ? (
                                <Link href={module.href}>
                                    <Button className="w-full">Configurar</Button>
                                </Link>
                            ) : (
                                <Button className="w-full" disabled>
                                    No disponible
                                </Button>
                            )}
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
