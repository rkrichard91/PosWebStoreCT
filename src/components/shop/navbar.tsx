
import Link from 'next/link';
import { ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CartSheet } from './cart-sheet';

export function Navbar() {
    return (
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container mx-auto flex h-16 items-center justify-between px-4">
                <Link href="/" className="flex items-center gap-2 transition-opacity hover:opacity-90">
                    <div className="relative h-8 w-8 overflow-hidden">
                        <img src="/logo.png" alt="Center Tecno Logo" className="object-contain h-full w-full" />
                    </div>
                    <span className="font-bold text-xl tracking-tight">Center Tecno</span>
                </Link>

                <nav className="hidden md:flex items-center space-x-6 text-sm font-medium">
                    <Link href="/builder" className="transition-colors hover:text-foreground/80 text-foreground/60">
                        PC Builder
                    </Link>
                    <Link href="/catalogo" className="transition-colors hover:text-foreground/80 text-foreground/60">
                        Catálogo
                    </Link>
                    <Link href="/servicios" className="transition-colors hover:text-foreground/80 text-foreground/60">
                        Servicios
                    </Link>
                    <Link href="/check-repair" className="transition-colors hover:text-foreground/80 text-foreground/60">
                        Estado Orden
                    </Link>
                </nav>
                <div className="flex items-center space-x-4">
                    <CartSheet />
                    <Button asChild variant="default" size="sm">
                        <Link href="/login">Ingresar</Link>
                    </Button>
                </div>
            </div>
        </header>
    );
}
