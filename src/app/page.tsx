import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Wrench, Monitor, ShoppingCart, ArrowRight, CheckCircle2, Sparkles } from "lucide-react";
import { PromoCarousel } from "@/components/shop/promo-carousel";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col aurora-bg">
      {/* Floating Orbs Background Decoration */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-gradient-to-br from-primary/20 to-primary-coral/10 blur-3xl animate-float" />
        <div className="absolute top-1/2 -left-20 h-60 w-60 rounded-full bg-gradient-to-br from-primary-coral/15 to-primary-pink/10 blur-3xl animate-float" style={{ animationDelay: '-2s' }} />
        <div className="absolute bottom-20 right-1/4 h-40 w-40 rounded-full bg-gradient-to-br from-primary-pink/10 to-primary/5 blur-3xl animate-float" style={{ animationDelay: '-4s' }} />
      </div>

      {/* Promo Carousel Section */}
      <section className="container py-8 relative z-10">
        <PromoCarousel />
      </section>

      {/* Hero Text / Value Prop */}
      <section className="flex flex-col items-center justify-center space-y-6 px-4 pb-16 text-center relative z-10">
        <div className="max-w-3xl space-y-6">
          {/* Animated Badge */}
          <div className="mx-auto w-fit rounded-full border border-primary/30 bg-primary/10 px-5 py-2 text-sm font-medium backdrop-blur-sm animate-pulse-glow">
            <span className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="gradient-text font-semibold">Center Tecno - Lo mejor en tecnología</span>
            </span>
          </div>

          {/* Gradient Title */}
          <h1 className="text-4xl font-bold tracking-tighter sm:text-6xl gradient-text glow-text">
            Expertos en Hardware y Servicio Técnico
          </h1>

          <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl leading-relaxed">
            Encuentra los mejores componentes para tu PC Gamer y confía en nuestros expertos para reparaciones de alto nivel.
          </p>

          {/* CTA Buttons with Glow */}
          <div className="flex flex-col gap-4 sm:flex-row justify-center pt-4">
            <Button size="lg" className="h-12 px-10 text-base font-semibold btn-gradient rounded-xl" asChild>
              <Link href="/builder">
                <Monitor className="h-5 w-5 mr-2" />
                Armar PC Ahora
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="h-12 px-10 text-base font-semibold rounded-xl border-primary/30 hover:border-primary/60 hover:bg-primary/10 transition-all duration-300" asChild>
              <Link href="/catalogo">
                Ver Catálogo
                <ArrowRight className="h-5 w-5 ml-2" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Grid with Glass Cards */}
      <section className="container py-16 md:py-24 space-y-12 relative z-10">
        <div className="grid gap-8 md:grid-cols-3">
          {/* Card 1 - PC Builder */}
          <div className="group glass-card gradient-border hover-3d rounded-2xl p-8">
            <div className="relative z-10">
              <div className="mb-6 inline-flex p-3 rounded-xl bg-gradient-to-br from-primary/20 to-primary-coral/10">
                <Monitor className="h-8 w-8 text-primary" />
              </div>
              <h3 className="font-bold text-xl mb-3 gradient-text">PC Builder Inteligente</h3>
              <p className="text-muted-foreground leading-relaxed">
                Nuestro asistente verifica la compatibilidad de cada componente para asegurar que tu build sea perfecto.
              </p>
            </div>
          </div>

          {/* Card 2 - Service */}
          <div className="group glass-card gradient-border hover-3d rounded-2xl p-8">
            <div className="relative z-10">
              <div className="mb-6 inline-flex p-3 rounded-xl bg-gradient-to-br from-primary-coral/20 to-primary-pink/10">
                <Wrench className="h-8 w-8 text-primary" />
              </div>
              <h3 className="font-bold text-xl mb-3 gradient-text">Servicio Técnico Pro</h3>
              <p className="text-muted-foreground leading-relaxed">
                Diagnóstico, reparación y mantención de equipos. Sigue el estado de tu reparación en tiempo real.
              </p>
            </div>
          </div>

          {/* Card 3 - Easy Buy */}
          <div className="group glass-card gradient-border hover-3d rounded-2xl p-8">
            <div className="relative z-10">
              <div className="mb-6 inline-flex p-3 rounded-xl bg-gradient-to-br from-primary-pink/20 to-primary/10">
                <ShoppingCart className="h-8 w-8 text-primary" />
              </div>
              <h3 className="font-bold text-xl mb-3 gradient-text">Compra Fácil</h3>
              <p className="text-muted-foreground leading-relaxed">
                Agrega al carrito y finaliza tu compra directamente por WhatsApp con atención personalizada.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Repair Check Section - CTA with Glow */}
      <section className="border-t border-border/50 bg-gradient-to-b from-transparent via-muted/20 to-muted/40 relative z-10">
        <div className="container py-24 flex flex-col md:flex-row items-center justify-between gap-12">
          <div className="space-y-6 max-w-xl">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight gradient-text">
              ¿Tienes un equipo en taller?
            </h2>
            <p className="text-xl text-muted-foreground leading-relaxed">
              Revisa el estado de tu orden, diagnóstico y costos en tiempo real con tu número de ticket.
            </p>
            <div className="flex gap-6 pt-2">
              <div className="flex items-center gap-2 text-sm">
                <div className="p-1 rounded-full bg-green-500/20">
                  <CheckCircle2 className="h-4 w-4 text-green-400" />
                </div>
                <span className="text-muted-foreground">Actualización Inmediata</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <div className="p-1 rounded-full bg-green-500/20">
                  <CheckCircle2 className="h-4 w-4 text-green-400" />
                </div>
                <span className="text-muted-foreground">Sin Iniciar Sesión</span>
              </div>
            </div>
          </div>
          <Button size="lg" className="h-16 px-12 text-lg font-semibold btn-gradient rounded-2xl glow" asChild>
            <Link href="/check-repair">
              Consultar Estado
            </Link>
          </Button>
        </div>
      </section>

      {/* Footer with subtle styling */}
      <footer className="border-t border-border/30 py-12 bg-background/80 backdrop-blur-sm relative z-10">
        <div className="container flex flex-col items-center justify-between gap-4 md:flex-row text-center md:text-left">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Center Tecno. Todos los derechos reservados.
          </p>
          <div className="flex gap-6 text-sm text-muted-foreground">
            <Link href="/terms" className="hover:text-primary transition-colors">Términos</Link>
            <Link href="/privacy" className="hover:text-primary transition-colors">Privacidad</Link>
            <Link href="/contact" className="hover:text-primary transition-colors">Contacto</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

