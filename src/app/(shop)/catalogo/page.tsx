
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { PackageOpen } from 'lucide-react';

export default function CatalogoPage() {
    return (
        <div className="container py-10 flex flex-col items-center justify-center min-h-[50vh] text-center space-y-4">
            <PackageOpen className="h-20 w-20 text-muted-foreground" />
            <h1 className="text-3xl font-bold">Catálogo de Productos</h1>
            <p className="text-muted-foreground max-w-md">
                Estamos cargando nuestro inventario. Mientras tanto, prueba nuestro armador de PCs.
            </p>
            <Button asChild>
                <Link href="/builder">Ir al PC Builder</Link>
            </Button>
        </div>
    );
}
