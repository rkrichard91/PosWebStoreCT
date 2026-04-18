"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, MessageCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface Banner {
    id: string;
    title: string;
    description: string | null;
    image_url: string | null;
    whatsapp_message: string | null;
    gradient_color: string;
    is_active: boolean;
    sort_order: number;
}

// Fallback data if no banners in DB
const FALLBACK_PROMOTIONS = [
    {
        id: "fallback-1",
        title: "Bienvenido a Center Tecno",
        description: "Lo mejor en tecnología siempre. Visítanos en nuestro local.",
        image_url: "https://placehold.co/1200x400/1e1e2e/FFF?text=Center+Tecno&font=montserrat",
        whatsapp_message: "Hola Center Tecno, me gustaría más información.",
        gradient_color: "from-orange-600 to-red-600",
        is_active: true,
        sort_order: 1,
    }
];

export function PromoCarousel() {
    const [current, setCurrent] = useState(0);
    const [banners, setBanners] = useState<Banner[]>([]);
    const [loading, setLoading] = useState(true);

    const supabase = createClient();

    useEffect(() => {
        const fetchBanners = async () => {
            const { data, error } = await supabase
                .from("site_banners")
                .select("*")
                .eq("is_active", true)
                .order("sort_order", { ascending: true });

            if (error || !data || data.length === 0) {
                setBanners(FALLBACK_PROMOTIONS);
            } else {
                setBanners(data);
            }
            setLoading(false);
        };

        fetchBanners();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Auto-play
    useEffect(() => {
        if (banners.length <= 1) return;
        const timer = setInterval(() => {
            setCurrent((prev) => (prev === banners.length - 1 ? 0 : prev + 1));
        }, 5000);
        return () => clearInterval(timer);
    }, [banners.length]);

    const next = () => setCurrent((prev) => (prev === banners.length - 1 ? 0 : prev + 1));
    const prev = () => setCurrent((prev) => (prev === 0 ? banners.length - 1 : prev - 1));

    const handleWhatsAppClick = (message: string | null) => {
        const phone = "593998094487";
        const url = `https://wa.me/${phone}?text=${encodeURIComponent(message || "Hola, me interesa más información.")}`;
        window.open(url, "_blank");
    };

    if (loading) {
        return (
            <div className="w-full h-[300px] md:h-[400px] lg:h-[500px] bg-muted animate-pulse rounded-xl" />
        );
    }

    return (
        <div className="relative w-full h-[300px] md:h-[400px] lg:h-[500px] overflow-hidden rounded-xl shadow-2xl group">
            {banners.map((promo, index) => (
                <div
                    key={promo.id}
                    className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${index === current ? "opacity-100 z-10" : "opacity-0 z-0"
                        }`}
                >
                    {/* Background Image / Placeholder */}
                    <div className="relative w-full h-full">
                        <Image
                            src={promo.image_url || `https://placehold.co/1200x400/1e1e2e/FFF?text=${encodeURIComponent(promo.title)}&font=montserrat`}
                            alt={promo.title}
                            fill
                            className="object-cover"
                            priority={index === 0}
                        />
                        {/* Gradient Overlay for Text Readability */}
                        {promo.gradient_color !== 'none' && (
                            <div className={`absolute inset-0 bg-gradient-to-r ${promo.gradient_color} opacity-70 mix-blend-multiply`} />
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                    </div>

                    {/* Text Content */}
                    <div className="absolute bottom-0 left-0 p-8 md:p-16 text-white max-w-2xl animate__animated animate__fadeInUp">
                        <h2 className="text-3xl md:text-5xl font-bold mb-4 drop-shadow-md">{promo.title}</h2>
                        <p className="text-lg md:text-xl mb-6 drop-shadow-sm opacity-90">{promo.description}</p>
                        <Button
                            size="lg"
                            onClick={() => handleWhatsAppClick(promo.whatsapp_message)}
                            className="bg-green-500 hover:bg-green-600 text-white font-semibold border-none shadow-lg gap-2"
                        >
                            <MessageCircle className="h-5 w-5" />
                            ¡Lo quiero!
                        </Button>
                    </div>
                </div>
            ))}

            {/* Controls - Only show if more than 1 banner */}
            {banners.length > 1 && (
                <>
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
                        {banners.map((_, idx) => (
                            <button
                                key={idx}
                                onClick={() => setCurrent(idx)}
                                className={`h-2.5 rounded-full transition-all shadow-sm ${idx === current ? "w-8 bg-white" : "w-2.5 bg-white/50 hover:bg-white/80"
                                    }`}
                            />
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}
