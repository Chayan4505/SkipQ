// MongoDB model - Not used (migrated to Supabase)
// Keeping interface for type definitions

export interface IShop {
    ownerId: string;
    name: string;
    description?: string;
    category: string;
    image?: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    pincode: string;
    coordinates?: {
        lat: number;
        lng: number;
    };
    openingTime?: string;
    closingTime?: string;
    isOpen: boolean;
    rating?: number;
    totalRatings?: number;
    createdAt: Date;
    updatedAt: Date;
}

// Mongoose schema and model commented out - using Supabase instead
