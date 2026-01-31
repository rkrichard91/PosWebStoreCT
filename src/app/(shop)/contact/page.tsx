import { MapPin, Phone, Mail, Clock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export default function ContactPage() {
    return (
        <div className="container py-10 max-w-6xl animate__animated animate__fadeIn">
            {/* Header */}
            <div className="text-center mb-12">
                <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl mb-4 text-foreground">
                    Contáctanos
                </h1>
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                    Estamos aquí para ayudarte. Visítanos en nuestra tienda, llámanos o envíanos un mensaje.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                {/* Contact Info */}
                <div className="space-y-6">
                    <Card className="border-none shadow-md bg-card/60 backdrop-blur-sm">
                        <CardContent className="p-6 flex items-start space-x-4">
                            <div className="bg-primary/10 p-3 rounded-full">
                                <MapPin className="h-6 w-6 text-primary" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-lg mb-1">Ubicación</h3>
                                <p className="text-muted-foreground mb-2">
                                    Mucho Lote 2, Urb. Valle Victoria<br />
                                    Mz 2841 V1, Local 7<br />
                                    Guayaquil, Ecuador
                                </p>
                                <a
                                    href="https://share.google/VqWJvsfAw7THYI6M0"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-sm font-medium text-primary hover:underline flex items-center gap-1"
                                >
                                    Ver en Google Maps &rarr;
                                </a>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-none shadow-md bg-card/60 backdrop-blur-sm">
                        <CardContent className="p-6 flex items-start space-x-4">
                            <div className="bg-primary/10 p-3 rounded-full">
                                <Phone className="h-6 w-6 text-primary" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-lg mb-1">Teléfono</h3>
                                <p className="text-muted-foreground">
                                    <a href="https://wa.me/593998094487" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">
                                        +593 99 809 4487
                                    </a>
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-none shadow-md bg-card/60 backdrop-blur-sm">
                        <CardContent className="p-6 flex items-start space-x-4">
                            <div className="bg-primary/10 p-3 rounded-full">
                                <Mail className="h-6 w-6 text-primary" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-lg mb-1">Correo Electrónico</h3>
                                <p className="text-muted-foreground">
                                    <a href="mailto:admin@center-tecno.com" className="hover:text-primary transition-colors">
                                        admin@center-tecno.com
                                    </a>
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-none shadow-md bg-card/60 backdrop-blur-sm">
                        <CardContent className="p-6 flex items-start space-x-4">
                            <div className="bg-primary/10 p-3 rounded-full">
                                <Clock className="h-6 w-6 text-primary" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-lg mb-1">Horario de Atención</h3>
                                <p className="text-muted-foreground">
                                    Lunes - Viernes: 9:00 AM - 6:00 PM<br />
                                    Sábado: 9:00 AM - 1:00 PM
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Map Section */}
                <div className="h-full min-h-[400px] w-full bg-muted rounded-xl overflow-hidden shadow-lg border relative">
                    <iframe
                        src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3987.2312225769247!2d-79.89651602503258!3d-2.063435797918047!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x902d13be9b7e097b%3A0xb188906ee1b09ccd!2sCenter%20Tecno!5e0!3m2!1ses!2sec!4v1769877189639!5m2!1ses!2sec"
                        width="100%"
                        height="100%"
                        style={{ border: 0, minHeight: '400px' }}
                        allowFullScreen={true}
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                        className="absolute inset-0 w-full h-full"
                    />
                </div>
            </div>
        </div>
    );
}
