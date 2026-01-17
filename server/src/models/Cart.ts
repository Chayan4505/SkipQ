// MongoDB model - Not used (migrated to Supabase)
// Keeping interfaces for type definitions

export interface ICartItem {
    productId: string;
    productName: string;
    price: number;
    quantity: number;
    shopId: string;
    shopName: string;
    image?: string;
    unit: string;
}

export interface ICart {
    userId: string;
    items: ICartItem[];
    updatedAt: Date;
}

// Mongoose schema and model commented out - using Supabase instead
