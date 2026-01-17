// MongoDB model - Not used (migrated to Supabase)
// Keeping interface for type definitions

export interface IProduct {
    shopId: string;
    name: string;
    description?: string;
    category: string;
    price: number;
    originalPrice?: number;
    unit: string;
    image?: string;
    inStock: boolean;
    stockQuantity?: number;
    createdAt: Date;
    updatedAt: Date;
}

// Mongoose schema and model commented out - using Supabase instead
