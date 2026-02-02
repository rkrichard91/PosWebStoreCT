export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export interface Database {
    public: {
        Tables: {
            products: {
                Row: {
                    id: string
                    sku: string
                    name: string
                    slug: string
                    description: string | null
                    category: 'laptop' | 'cpu' | 'gpu' | 'motherboard' | 'ram' | 'storage' | 'psu' | 'case' | 'peripheral' | 'monitor' | 'service'
                    price_public: number
                    price_cash: number
                    cost_price: number
                    stock_physical: number
                    min_stock_alert: number
                    image_url: string | null
                    is_active: boolean
                    specs: Json
                    created_at: string
                    updated_at: string
                }
                Insert: Omit<Database['public']['Tables']['products']['Row'], 'id' | 'created_at' | 'updated_at'> & {
                    id?: string
                    created_at?: string
                    updated_at?: string
                }
                Update: Partial<Database['public']['Tables']['products']['Insert']>
            }
            orders: {
                Row: {
                    id: string
                    ticket_number: number
                    customer_id: string | null
                    customer_data: Json | null
                    total: number
                    payment_method: string | null
                    status: string | null
                    origin: 'web' | 'pos' | null
                    created_by: string | null
                    created_at: string
                }
                Insert: Omit<Database['public']['Tables']['orders']['Row'], 'id' | 'ticket_number' | 'created_at'> & {
                    id?: string
                    ticket_number?: number
                    created_at?: string
                }
                Update: Partial<Database['public']['Tables']['orders']['Insert']>
            }
            order_items: {
                Row: {
                    id: string
                    order_id: string | null
                    product_id: string | null
                    quantity: number
                    unit_price: number
                    subtotal: number | null
                }
                Insert: Omit<Database['public']['Tables']['order_items']['Row'], 'id' | 'subtotal'> & {
                    id?: string
                }
                Update: Partial<Database['public']['Tables']['order_items']['Insert']>
            }
            repairs: {
                Row: {
                    id: string
                    ticket_number: number
                    customer_name: string
                    customer_contact: string | null
                    device_model: string | null
                    serial_number: string | null
                    issue_reported: string | null
                    diagnosis: string | null
                    status: 'received' | 'diagnosing' | 'waiting_parts' | 'approved' | 'repaired' | 'delivered' | null
                    technician_id: string | null
                    evidence_photos: string[] | null
                    cost_service: number | null
                    cost_parts: number | null
                    total: number | null
                    created_at: string
                    updated_at: string
                }
                Insert: Omit<Database['public']['Tables']['repairs']['Row'], 'id' | 'ticket_number' | 'total' | 'created_at' | 'updated_at'> & {
                    id?: string
                    ticket_number?: number
                    created_at?: string
                    updated_at?: string
                }
                Update: Partial<Database['public']['Tables']['repairs']['Insert']>
            }
            quotes: {
                Row: {
                    id: string
                    user_id: string
                    items: Json
                    total_price: number
                    status: string
                    created_at: string
                    updated_at: string
                }
                Insert: Omit<Database['public']['Tables']['quotes']['Row'], 'id' | 'created_at' | 'updated_at'> & {
                    id?: string
                    created_at?: string
                    updated_at?: string
                }
                Update: Partial<Database['public']['Tables']['quotes']['Insert']>
            }
        }
    }
}
