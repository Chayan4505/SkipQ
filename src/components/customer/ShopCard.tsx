import { useNavigate } from "react-router-dom";
import { Star, Clock, MapPin, Store } from "lucide-react";

interface Shop {
    id: string;
    _id?: string;
    name: string;
    image?: string;
    rating?: number;
    category: string;
    city: string;
    address: string;
    isOpen: boolean;
    distance?: number; // Distance in km
}

interface ShopCardProps {
    shop: Shop;
}

export const ShopCard = ({ shop }: ShopCardProps) => {
    const navigate = useNavigate();

    // Fallback image if shop doesn't have one
    const shopImage = shop.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(shop.name)}&background=10b981&color=fff&size=400`;

    return (
        <div
            onClick={() => navigate(`/shop/${(shop as any).id || shop._id}`)}
            className="bg-white rounded-lg shadow-md overflow-hidden cursor-pointer hover:shadow-lg transition-shadow duration-200"
        >
            {/* Shop Image */}
            <div className="relative h-40 bg-gray-200">
                <img
                    src={shopImage}
                    alt={shop.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                        // Fallback if image fails to load
                        e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(shop.name)}&background=10b981&color=fff&size=400`;
                    }}
                />
                {/* Closed overlay - handle both isOpen and is_open */}
                {!(shop.isOpen !== undefined ? shop.isOpen : ((shop as any).is_open !== undefined ? (shop as any).is_open : true)) && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        <span className="bg-white px-3 py-1 rounded-full text-sm font-semibold text-gray-800">
                            Closed
                        </span>
                    </div>
                )}
            </div>

            {/* Shop Info */}
            <div className="p-4">
                <h3 className="text-lg font-semibold text-foreground mb-2">
                    {shop.name}
                </h3>

                {/* Category */}
                <div className="flex flex-wrap gap-1 mb-3">
                    <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full font-medium">
                        {shop.category}
                    </span>
                </div>

                {/* Stats */}
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        <span className="font-medium text-foreground">
                            {shop.rating ? shop.rating.toFixed(1) : '4.5'}
                        </span>
                    </div>
                    <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        <span>15-20 min</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        <span className="font-medium text-foreground">
                            {shop.city}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
};
