'use server';

import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export async function checkRepairStatus(formData: FormData) {
    const ticketNumber = formData.get('ticketNumber')?.toString();
    const contact = formData.get('contact')?.toString();

    if (!ticketNumber || !contact) {
        return { error: 'Por favor ingrese el número de ticket y su contacto (email o teléfono)' };
    }

    const supabase = await createClient() as any;

    // Buscar la reparación por número de ticket
    const { data: repair, error } = await supabase
        .from('repairs')
        .select('*')
        .eq('ticket_number', parseInt(ticketNumber))
        .single();

    if (error || !repair) {
        return { error: 'No se encontró una reparación con ese número de ticket.' };
    }

    // Validación simple de contacto (puede ser email o teléfono parcial)
    // Convertimos ambos a minúsculas para comparar libremente
    const storedContact = (repair.customer_contact || '').toLowerCase();
    const inputContact = contact.toLowerCase();

    if (!storedContact.includes(inputContact)) {
        return { error: 'El contacto ingresado no coincide con nuestros registros para este ticket.' };
    }

    // Si pasa, retornamos los datos necesarios
    return {
        success: true,
        data: {
            id: repair.id,
            ticket_number: repair.ticket_number,
            device_model: repair.device_model,
            status: repair.status,
            diagnosis: repair.diagnosis,
            total: repair.total,
            created_at: repair.created_at
        }
    };
}
