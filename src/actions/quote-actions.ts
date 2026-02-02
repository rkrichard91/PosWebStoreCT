"use server"

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function submitQuote(items: any, totalPrice: number) {
    const supabase = await createClient();

    // Check if user is logged in
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { success: false, message: "Debes iniciar sesión para solicitar una cotización." };
    }

    try {
        const { error } = await supabase
            .from('quotes')
            .insert({
                user_id: user.id,
                items: items,
                total_price: totalPrice,
                status: 'pending'
            });

        if (error) {
            console.error("Error creating quote:", error);
            return { success: false, message: "Error al guardar la cotización. Inténtalo nuevamente." };
        }

        revalidatePath('/quotes');
        return { success: true, message: "Cotización enviada exitosamente. Te contactaremos pronto." };

    } catch (error) {
        console.error("Unexpected error:", error);
        return { success: false, message: "Ocurrió un error inesperado." };
    }
}
