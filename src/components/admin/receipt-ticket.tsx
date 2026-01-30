
import { Order, OrderItem, Product } from "@/types";
import { formatCurrency } from "@/lib/utils";
import React from 'react';

// Extend Order type to include relation
export type OrderWithItems = Order & {
    order_items: (OrderItem & { products: Product | null })[]
};

interface ReceiptTicketProps {
    order: OrderWithItems;
    mode: 'thermal' | 'a4';
}

export const ReceiptTicket = React.forwardRef<HTMLDivElement, ReceiptTicketProps>(({ order, mode }, ref) => {

    // Base styles for thermal (default usually)
    const isThermal = mode === 'thermal';

    return (
        <div ref={ref} className={
            `p-4 bg-white text-black font-mono text-sm
             ${isThermal ? 'w-[80mm] max-w-[80mm]' : 'w-[210mm] max-w-[210mm]'} 
             mx-auto`
        } id="printable-ticket">

            {/* Header */}
            <div className="text-center mb-4">
                <h1 className="font-bold text-xl uppercase tracking-widest">Center Tecno</h1>
                <p>RUT: 76.123.456-K</p>
                <p>Av. Tecnología 123, Santiago</p>
                <p>Tel: +56 9 1234 5678</p>
                <hr className="my-2 border-black border-dashed" />
                <p className="font-bold">TICKET #{order.ticket_number}</p>
                <p>{new Date(order.created_at).toLocaleString()}</p>
                {order.customer_data ? (
                    <div className="mt-2 text-left border-t border-b border-black py-1">
                        <p>Cliente: {(order.customer_data as Record<string, unknown>).name as string || 'Consumidor Final'}</p>
                        <p>RUT/DNI: {(order.customer_data as Record<string, unknown>).rut as string || 'N/A'}</p>
                    </div>
                ) : (
                    <div className="mt-2 text-left border-t border-b border-black py-1">
                        <p>Cliente: Anónimo</p>
                    </div>
                )}
            </div>

            {/* Items */}
            <table className="w-full text-left mb-4">
                <thead>
                    <tr className="border-b border-black">
                        <th className="py-1 w-1/2">Item</th>
                        <th className="py-1 text-right">Cant</th>
                        <th className="py-1 text-right">Total</th>
                    </tr>
                </thead>
                <tbody>
                    {order.order_items.map((item, idx) => (
                        <tr key={idx} className="">
                            <td className="py-1 align-top">
                                <span className="block font-bold">{item.products?.name || 'Item eliminado'}</span>
                                <span className="text-xs text-gray-500">{item.products?.sku}</span>
                            </td>
                            <td className="py-1 text-right align-top">x{item.quantity}</td>
                            <td className="py-1 text-right align-top">{formatCurrency(item.subtotal || 0)}</td>
                        </tr>
                    ))}
                </tbody>
            </table>

            <hr className="my-2 border-black border-dashed" />

            {/* Totals */}
            <div className="flex justify-between font-bold text-lg">
                <span>TOTAL</span>
                <span>{formatCurrency(order.total)}</span>
            </div>

            <div className="flex justify-between text-xs mt-1">
                <span>Método:</span>
                <span className="uppercase">{order.payment_method}</span>
            </div>

            {/* Footer */}
            <div className="mt-8 text-center text-xs">
                <p>¡Gracias por su compra!</p>
                <p>Garantía legal de 6 meses.</p>
                <p>No se admiten devoluciones por incompatibilidad sin empaque original.</p>
            </div>
        </div>
    );
});
ReceiptTicket.displayName = 'ReceiptTicket';
