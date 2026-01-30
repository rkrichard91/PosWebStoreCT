import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Wrench, Monitor, ShoppingCart, ArrowRight, CheckCircle2 } from "lucide-react";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Navbar is strictly imported here or in layout? Actually layout usually has it but let's check layout first. 
          If layout renders Navbar, I don't need it here. 
          Wait, layout.tsx (root) usually wraps everything. 
          Admin layout has sidebar, Shop layout has Navbar.
          Typically root layout is empty.
          Let's assume root layout is basic.
          I'll add Navbar here for now or verify if I should put it in a (shop) layout.
          Actually, previous steps showed (shop) folder has layout.
          Let's assume Home is under root layout. 
          I will just build the page content assuming a clear slate.
          Wait, I should probably put the Navbar if it's not global.
          Let's check layout.tsx.
      */}

      {/* Hero Section */}
      <section className="flex flex-col items-center justify-center space-y-10 px-4 py-24 text-center md:py-32 bg-background relative overflow-hidden">
        {/* Background Gradients */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-primary/20 blur-[120px] rounded-full pointer-events-none" />

        <div className="relative z-10 max-w-3xl space-y-6">
          <div className="mx-auto w-fit rounded-full border bg-background/50 px-4 py-1.5 text-sm font-medium backdrop-blur text-primary">
            🚀 Center Tecno - Lo mejor en tecnología, siempre
          </div>
          <h1 className="text-4xl font-bold tracking-tighter sm:text-6xl md:text-7xl bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/60">
            Construye la PC <br /> de tus Sueños
          </h1>
          <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
            Encuentra los mejores componentes y servicio técnico especializado en Center Tecno. Calidad y confianza en cada armado.
          </p>
          <div className="flex flex-col gap-4 sm:flex-row justify-center">
            <Button size="lg" className="h-12 px-8 text-base gap-2" asChild>
              <Link href="/builder">
                <Monitor className="h-5 w-5" />
                Armar PC Ahora
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="h-12 px-8 text-base gap-2" asChild>
              <Link href="/catalogo">
                Ver Catálogo
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="container py-12 md:py-24 space-y-12">
        <div className="grid gap-8 md:grid-cols-3">
          <div className="group relative overflow-hidden rounded-2xl border bg-card p-8 hover:border-primary/50 transition-colors">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <Monitor className="h-10 w-10 text-primary mb-4" />
            <h3 className="font-bold text-xl mb-2">PC Builder Inteligente</h3>
            <p className="text-muted-foreground">
              Nuestro asistente verifica la compatibilidad de cada componente para asegurar que tu build sea perfecto.
            </p>
          </div>

          <div className="group relative overflow-hidden rounded-2xl border bg-card p-8 hover:border-primary/50 transition-colors">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <Wrench className="h-10 w-10 text-primary mb-4" />
            <h3 className="font-bold text-xl mb-2">Servicio Técnico Pro</h3>
            <p className="text-muted-foreground">
              Diagnóstico, reparación y mantención de equipos. Sigue el estado de tu reparación en tiempo real.
            </p>
          </div>

          <div className="group relative overflow-hidden rounded-2xl border bg-card p-8 hover:border-primary/50 transition-colors">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <ShoppingCart className="h-10 w-10 text-primary mb-4" />
            <h3 className="font-bold text-xl mb-2">Compra Fácil</h3>
            <p className="text-muted-foreground">
              Agrega al carrito y finaliza tu compra directamente por WhatsApp con atención personalizada.
            </p>
          </div>
        </div>
      </section>

      {/* Repair Check Section - CTA */}
      <section className="border-t bg-muted/50">
        <div className="container py-24 flex flex-col md:flex-row items-center justify-between gap-12">
          <div className="space-y-4 max-w-xl">
            <h2 className="text-3xl font-bold tracking-tight">¿Tienes un equipo en taller?</h2>
            <p className="text-xl text-muted-foreground">
              Revisa el estado de tu orden, diagnóstico y costos en tiempo real con tu número de ticket.
            </p>
            <div className="flex gap-4 pt-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                <span>Actualización Inmediata</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                <span>Sin Iniciar Sesión</span>
              </div>
            </div>
          </div>
          <Button size="lg" className="h-16 px-10 text-lg shadow-xl" asChild>
            <Link href="/check-repair">
              Consultar Estado
            </Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-12 bg-background">
        <div className="container flex flex-col items-center justify-between gap-4 md:flex-row text-center md:text-left">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Center Tecno. Todos los derechos reservados.
          </p>
          <div className="flex gap-6 text-sm text-muted-foreground">
            <Link href="#" className="hover:text-foreground">Términos</Link>
            <Link href="#" className="hover:text-foreground">Privacidad</Link>
            <Link href="#" className="hover:text-foreground">Contacto</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
