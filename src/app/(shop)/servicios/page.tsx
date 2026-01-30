
import { Wrench } from 'lucide-react';

export default function ServiciosPage() {
    return (
        <div className="container py-10 flex flex-col items-center justify-center min-h-[50vh] text-center space-y-4">
            <Wrench className="h-20 w-20 text-muted-foreground" />
            <h1 className="text-3xl font-bold">Servicios Técnicos</h1>
            <p className="text-muted-foreground max-w-md">
                Ofrecemos mantenimiento, reparación y armado de equipos.
                Visítanos en tienda para una cotización.
            </p>
        </div>
    );
}
