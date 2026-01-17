// MongoDB model - Not used (migrated to Supabase)
// Keeping interfaces for type definitions

export interface IOrderItem {
    productId: string;
    productName: string;
    quantity: number;
    price: number;
    total: number;
}

export interface IOrder {
    userId: string;
    shopId: string;
    shopName: string;
    items: IOrderItem[];
    totalAmount: number;
    status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'completed' | 'cancelled';
    paymentMethod: 'cash' | 'online';
    paymentStatus: 'pending' | 'paid' | 'refunded';
    deliveryAddress?: string;
    notes?: string;
    estimatedTime?: number; // in minutes
    createdAt: Date;
    updatedAt: Date;
}

// Mongoose schema and model commented out - using Supabase instead
