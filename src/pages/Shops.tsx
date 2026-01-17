import { useState, useEffect } from "react";
import { CustomerHeader } from "@/components/customer/CustomerHeader";
import { ShopCard } from "@/components/customer/ShopCard";
import { shopsAPI } from "@/lib/api";
import { Search, Filter, Loader2, MapPin, AlertCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { getUserLocation, calculateDistance } from "@/lib/location";
import { useToast } from "@/hooks/use-toast";

interface Shop {
  id: string;
  _id?: string;
  name: string;
  address: string;
  city: string;
  category: string;
  image?: string;
  rating?: number;
  isOpen: boolean;
  coordinates?: {
    lat: number;
    lng: number;
  } | null;
  distance?: number;
}

const Shops = () => {
  const [shops, setShops] = useState<Shop[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const { toast } = useToast();

  const categories = ["All", "Grocery", "Pharmacy", "Bakery", "Dairy", "Vegetables", "Meat", "General"];
  const MAX_DISTANCE_KM = 30;

  useEffect(() => {
    loadUserLocation();
    loadShops();
  }, []);

  const loadUserLocation = async () => {
    try {
      const location = await getUserLocation();
      setUserLocation(location);
      setLocationError(null);
      console.log('✅ User location:', location);
    } catch (error: any) {
      console.error("❌ Location error:", error);
      setLocationError(error.message || "Location access denied");
      toast({
        title: "Location Access Required",
        description: "Please enable location to see nearby shops within 30km.",
        variant: "destructive",
      });
    }
  };

  const loadShops = async () => {
    try {
      setLoading(true);
      const response = await shopsAPI.getAll();
      setShops(response.shops || []);
    } catch (error: any) {
      console.error("Failed to load shops:", error);
      setShops([]);
    } finally {
      setLoading(false);
    }
  };

  // Calculate distance and process shops
  const processedShops = shops
    .map((shop) => {
      // Calculate distance if both user location and shop coordinates exist
      if (userLocation && shop.coordinates?.lat && shop.coordinates?.lng) {
        console.log(`Calculating distance for ${shop.name}:`, {
          userLat: userLocation.lat,
          userLng: userLocation.lng,
          shopLat: shop.coordinates.lat,
          shopLng: shop.coordinates.lng
        });
        const distance = calculateDistance(
          userLocation.lat,
          userLocation.lng,
          shop.coordinates.lat,
          shop.coordinates.lng
        );
        console.log(`  → Distance: ${distance} km`);
        return { ...shop, distance };
      }
      return { ...shop, distance: undefined };
    })
    .filter((shop) => {
      // Filter by search query
      const matchesSearch = shop.name.toLowerCase().includes(searchQuery.toLowerCase());

      // Filter by category
      const matchesCategory = selectedCategory === "All" || shop.category === selectedCategory;

      // Don't filter by distance - show all shops
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      // Sort by distance (nearest first) if distances are available
      if (a.distance !== undefined && b.distance !== undefined) {
        return a.distance - b.distance;
      }
      // Shops with distance come first
      if (a.distance !== undefined) return -1;
      if (b.distance !== undefined) return 1;
      return 0;
    });

  return (
    <div className="min-h-screen bg-gradient-to-b from-yellow-100 via-amber-100/60 to-orange-100/50">
      <CustomerHeader />

      <main className="max-w-7xl mx-auto px-4 py-6">
        {/* Hero Section */}
        <div className="bg-primary rounded-lg p-5 mb-6">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-xl sm:text-2xl font-semibold text-white mb-1">
                Nearby Kirana Stores
              </h1>
              <p className="text-white/90 text-sm">
                {userLocation
                  ? `Showing all shops sorted by distance from your location`
                  : "Order from your favorite local shops and get delivered in minutes"
                }
              </p>
            </div>
            {userLocation && (
              <div className="flex items-center gap-1 bg-white/20 px-3 py-1 rounded-full">
                <MapPin className="w-4 h-4 text-white" />
                <span className="text-white text-sm font-medium">{MAX_DISTANCE_KM}km</span>
              </div>
            )}
          </div>
        </div>

        {/* Location Error Message */}
        {locationError && (
          <div className="mb-6 p-4 border border-orange-200 bg-orange-50 rounded-lg flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-orange-600 shrink-0 mt-0.5" />
            <p className="text-sm text-orange-800">
              Location access denied. Showing all shops. Enable location to filter by distance.
            </p>
          </div>
        )}

        {/* Search & Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              placeholder="Search stores..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0">
            <Filter className="w-5 h-5 text-muted-foreground shrink-0" />
            {categories.map((category) => {
              const categoryColors: { [key: string]: { active: string; inactive: string } } = {
                "All": { active: "bg-primary text-white", inactive: "bg-gray-100 text-gray-700 hover:bg-gray-200" },
                "Grocery": { active: "bg-blue-500 text-white", inactive: "bg-blue-50 text-blue-700 hover:bg-blue-100" },
                "Pharmacy": { active: "bg-red-500 text-white", inactive: "bg-red-50 text-red-700 hover:bg-red-100" },
                "Bakery": { active: "bg-orange-500 text-white", inactive: "bg-orange-50 text-orange-700 hover:bg-orange-100" },
                "Vegetables": { active: "bg-green-500 text-white", inactive: "bg-green-50 text-green-700 hover:bg-green-100" },
                "Dairy": { active: "bg-yellow-500 text-white", inactive: "bg-yellow-50 text-yellow-700 hover:bg-yellow-100" },
                "Meat": { active: "bg-pink-500 text-white", inactive: "bg-pink-50 text-pink-700 hover:bg-pink-100" },
                "General": { active: "bg-purple-500 text-white", inactive: "bg-purple-50 text-purple-700 hover:bg-purple-100" },
              };
              const colors = categoryColors[category] || categoryColors["All"];
              return (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium whitespace-nowrap transition-colors ${selectedCategory === category ? colors.active : colors.inactive
                    }`}
                >
                  {category}
                </button>
              );
            })}
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        )}

        {/* Shop Grid */}
        {!loading && (
          <>
            {processedShops.length > 0 && (
              <div className="mb-4 text-sm text-muted-foreground">
                Found {processedShops.length} shop{processedShops.length !== 1 ? 's' : ''}
                {userLocation && ` (sorted by distance)`}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {processedShops.map((shop) => (
                <ShopCard key={shop.id || shop._id} shop={shop} />
              ))}
            </div>

            {processedShops.length === 0 && (
              <div className="text-center py-12">
                <p className="text-muted-foreground">
                  No stores found matching your criteria
                </p>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
};

export default Shops;
