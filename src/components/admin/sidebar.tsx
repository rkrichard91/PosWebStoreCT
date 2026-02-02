"use client"

import Image from 'next/image';
import Link from 'next/link';
import { LayoutDashboard, ShoppingCart, Package, Wrench, Settings, LogOut, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

const menuItems = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/pos', label: 'Punto de Venta', icon: ShoppingCart },
    { href: '/inventory', label: 'Inventario', icon: Package },
    { href: '/quotes', label: 'Cotizaciones', icon: FileText },
    { href: '/taller', label: 'Taller', icon: Wrench },
    { href: '/settings', label: 'Configuración', icon: Settings },
];

export function AdminSidebar() {
    const router = useRouter();
    const supabase = createClient();

    const handleLogout = async () => {
        try {
            const { error } = await supabase.auth.signOut();
            if (error) throw error;
            toast.success("Sesión cerrada correctamente");
            router.push('/login');
            router.refresh();
        } catch (error) {
            console.error("Error logging out:", error);
            toast.error("Error al cerrar sesión");
        }
    };

    return (
        <aside className="w-64 border-r bg-muted/40 hidden md:block print:hidden">
            <div className="flex h-full max-h-screen flex-col gap-2">
                <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
                    <Link href="/dashboard" className="flex items-center gap-2 font-semibold">
                        <div className="relative h-6 w-6 overflow-hidden">
                            <Image src="/logo.png" alt="Logo" fill className="object-contain" />
                        </div>
                        <span className="">Center Tecno Admin</span>
                    </Link>
                </div>
                <div className="flex-1">
                    <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
                        {menuItems.map((item) => (
                            <Link
                                key={item.href}
                                href={item.href}
                                className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
                            >
                                <item.icon className="h-4 w-4" />
                                {item.label}
                            </Link>
                        ))}
                    </nav>
                </div>
                <div className="mt-auto p-4">
                    <Button
                        variant="outline"
                        className="w-full gap-2 justify-start"
                        size="sm"
                        onClick={handleLogout}
                    >
                        <LogOut className="h-4 w-4" />
                        Cerrar Sesión
                    </Button>
                </div>
            </div>
        </aside>
    );
}
