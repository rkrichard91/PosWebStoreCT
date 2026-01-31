"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, MessageCircle } from "lucide-react";

// Mock Data - Replace with real DB data if needed
const PROMOTIONS = [
    {
        id: "promo-1",
        title: "Gran Oferta en Tarjetas Gráficas",
        description: "Lleva tu gaming al siguiente nivel con RTX Series 40. ¡10% de descuento en efectivo!",
        imageUrl: "https://placehold.co/1200x400/1e1e2e/FFF?text=RTX+40+Series+Sale&font=montserrat", // Placeholder
        whatsappMessage: "Hola Center Tecno, vi la promoción de *Tarjetas Gráficas* en su web. Me interesa más información.",
        color: "from-purple-600 to-indigo-600"
    },
    {
        id: "promo-2",
        title: "Mantenimiento Preventivo 2x1",
        description: "Trae tu PC y la de un amigo. Mantenimiento completo con pasta térmica de alta gama.",
        imageUrl: "https://placehold.co/1200x400/2563eb/FFF?text=Mantenimiento+2x1&font=montserrat",
        whatsappMessage: "Hola Center Tecno, quiero agendar la promo de *Mantenimiento 2x1*.",
        color: "from-blue-600 to-cyan-600"
    },
    {
        id: "promo-3",
        title: "Arma tu PC Gamer",
        description: "Asesoría gratuita y ensamblaje premium incluido en builds completas.",
        imageUrl: "https://placehold.co/1200x400/ea580c/FFF?text=PC+Builder+Promo&font=montserrat",
        whatsappMessage: "Hola, quiero cotizar una *PC Gamer* completa con la promoción de ensamblaje incluido.",
        color: "from-orange-600 to-red-600"
    }
];

export function PromoCarousel() {
    const [current, setCurrent] = useState(0);

    // Auto-play
    useEffect(() => {
        const timer = setInterval(() => {
            setCurrent((prev) => (prev === PROMOTIONS.length - 1 ? 0 : prev + 1));
        }, 5000);
        return () => clearInterval(timer);
    }, []);

    const next = () => setCurrent((prev) => (prev === PROMOTIONS.length - 1 ? 0 : prev + 1));
    const prev = () => setCurrent((prev) => (prev === 0 ? PROMOTIONS.length - 1 : prev - 1));

    const handleWhatsAppClick = (message: string) => {
        const phone = "593998094487";
        const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
        window.open(url, "_blank");
    };

    return (
        <div className="relative w-full h-[300px] md:h-[400px] lg:h-[500px] overflow-hidden rounded-xl shadow-2xl group">
            {PROMOTIONS.map((promo, index) => (
                <div
                    key={promo.id}
                    className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${index === current ? "opacity-100 z-10" : "opacity-0 z-0"
                        }`}
                >
                    {/* Background Image / Placeholder */}
                    <div className="relative w-full h-full">
                        <Image
                            src={promo.imageUrl}
                            alt={promo.title}
                            fill
                            className="object-cover"
                            priority={index === 0}
                        />
                        {/* Gradient Overlay for Text Readability */}
                        <div className={`absolute inset-0 bg-gradient-to-r ${promo.color} opacity-70 mix-blend-multiply`} />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                    </div>

                    {/* Text Content */}
                    <div className="absolute bottom-0 left-0 p-8 md:p-16 text-white max-w-2xl animate__animated animate__fadeInUp">
                        <h2 className="text-3xl md:text-5xl font-bold mb-4 drop-shadow-md">{promo.title}</h2>
                        <p className="text-lg md:text-xl mb-6 drop-shadow-sm opacity-90">{promo.description}</p>
                        <Button
                            size="lg"
                            onClick={() => handleWhatsAppClick(promo.whatsappMessage)}
                            className="bg-green-500 hover:bg-green-600 text-white font-semibold border-none shadow-lg gap-2"
                        >
                            <MessageCircle className="h-5 w-5" />
                            ¡Lo quiero!
                        </Button>
                    </div>
                </div>
            ))}

            {/* Controls */}
            <button
                onClick={prev}
                className="absolute left-4 top-1/2 -translate-y-1/2 z-20 bg-black/30 hover:bg-black/50 text-white p-2 rounded-full backdrop-blur-sm transition-all opacity-0 group-hover:opacity-100"
            >
                <ChevronLeft className="h-8 w-8" />
            </button>
            <button
                onClick={next}
                className="absolute right-4 top-1/2 -translate-y-1/2 z-20 bg-black/30 hover:bg-black/50 text-white p-2 rounded-full backdrop-blur-sm transition-all opacity-0 group-hover:opacity-100"
            >
                <ChevronRight className="h-8 w-8" />
            </button>

            {/* Indicators */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex gap-2">
                {PROMOTIONS.map((_, idx) => (
                    <button
                        key={idx}
                        onClick={() => setCurrent(idx)}
                        className={`h-2.5 rounded-full transition-all shadow-sm ${idx === current ? "w-8 bg-white" : "w-2.5 bg-white/50 hover:bg-white/80"
                            }`}
                    />
                ))}
            </div>
        </div>
    );
}
