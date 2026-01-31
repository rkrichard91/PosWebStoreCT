import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Wrench, Monitor, ShoppingCart, ArrowRight, CheckCircle2 } from "lucide-react";
import { PromoCarousel } from "@/components/shop/promo-carousel";

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

      {/* Promo Carousel Section */}
      <section className="container py-8">
        <PromoCarousel />
      </section>

      {/* Hero Text / Value Prop - Simplified below Carousel */}
      <section className="flex flex-col items-center justify-center space-y-6 px-4 pb-12 text-center">
        <div className="max-w-3xl space-y-4">
          <div className="mx-auto w-fit rounded-full border bg-background/50 px-4 py-1.5 text-sm font-medium backdrop-blur text-primary">
            🚀 Center Tecno - Lo mejor en tecnología, siempre
          </div>
          <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/60">
            Expertos en Hardware y Servicio Técnico
          </h1>
          <p className="mx-auto max-w-[700px] text-muted-foreground md:text-lg">
            Encuentra los mejores componentes para tu PC Gamer y confía en nuestros expertos para reparaciones de alto nivel.
          </p>
          <div className="flex flex-col gap-4 sm:flex-row justify-center">
            <Button size="lg" className="h-10 px-8" asChild>
              <Link href="/builder">
                <Monitor className="h-4 w-4 mr-2" />
                Armar PC Ahora
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="h-10 px-8" asChild>
              <Link href="/catalogo">
                Ver Catálogo
                <ArrowRight className="h-4 w-4 ml-2" />
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
            <Link href="/terms" className="hover:text-foreground transition-colors">Términos</Link>
            <Link href="/privacy" className="hover:text-foreground transition-colors">Privacidad</Link>
            <Link href="/contact" className="hover:text-foreground transition-colors">Contacto</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
