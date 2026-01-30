"use client";

import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { CartSheet } from './cart-sheet';
import { createClient } from '@/lib/supabase/client';
import { useEffect, useState } from 'react';
import { User, UserIcon } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

export function Navbar() {
    const [user, setUser] = useState<any>(null);
    const supabase = createClient();

    useEffect(() => {
        const getUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            setUser(user);
        };
        getUser();
    }, [supabase]);

    const handleLogout = async () => {
        await supabase.auth.signOut();
        window.location.href = "/";
    };

    return (
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container mx-auto flex h-16 items-center justify-between px-4">
                <Link href="/" className="flex items-center gap-2 transition-opacity hover:opacity-90">
                    <div className="relative h-8 w-8 overflow-hidden">
                        <Image src="/logo.png" alt="Center Tecno Logo" fill className="object-contain" />
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
                    {user ? (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="rounded-full">
                                    <User className="h-5 w-5" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem asChild>
                                    <Link href="/my-account">Mi Cuenta</Link>
                                </DropdownMenuItem>
                                {user.user_metadata?.role === 'admin' && (
                                    <DropdownMenuItem asChild>
                                        <Link href="/dashboard">Panel Admin</Link>
                                    </DropdownMenuItem>
                                )}
                                <DropdownMenuItem onClick={handleLogout} className="text-red-500 cursor-pointer">
                                    Cerrar Sesión
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    ) : (
                        <Button asChild variant="default" size="sm">
                            <Link href="/login">Ingresar</Link>
                        </Button>
                    )}
                </div>
            </div>
        </header>
    );
}
