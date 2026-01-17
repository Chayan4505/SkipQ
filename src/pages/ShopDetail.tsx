import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { CustomerHeader } from "@/components/customer/CustomerHeader";
import { ProductCard } from "@/components/customer/ProductCard";
import { shopsAPI, productsAPI } from "@/lib/api";
import { ArrowLeft, Star, Clock, MapPin, Search, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";

const ShopDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [shop, setShop] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  useEffect(() => {
    if (id) {
      loadShopData();
    }
  }, [id]);

  const loadShopData = async () => {
    try {
      setLoading(true);
      // Load shop details and products in parallel
      const [shopResponse, productsResponse] = await Promise.all([
        shopsAPI.getById(id!),
        productsAPI.getByShop(id!),
      ]);

      setShop(shopResponse.shop);

      // Map products to handle both MongoDB and Supabase formats
      const mappedProducts = (productsResponse.products || []).map((p: any) => ({
        ...p,
        _id: p.id || p._id,
        id: p.id || p._id,
        inStock: p.is_available !== undefined ? p.is_available : p.inStock,
        originalPrice: p.original_price || p.originalPrice,
      }));

      setProducts(mappedProducts);
    } catch (error: any) {
      console.error("Failed to load shop:", error);
      setShop(null);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const availableCategories = [
    "All",
    ...new Set(products.map((p) => p.category)),
  ];

  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === "All" || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-yellow-100 via-amber-100/60 to-orange-100/50">
        <CustomerHeader />
        <div className="max-w-7xl mx-auto px-4 py-12 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (!shop) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-yellow-100 via-amber-100/60 to-orange-100/50">
        <CustomerHeader />
        <div className="max-w-7xl mx-auto px-4 py-12 text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">Shop not found</h1>
          <Link to="/shops" className="text-primary hover:underline">
            Back to shops
          </Link>
        </div>
      </div>
    );
  }

  // Fallback image if shop doesn't have one
  const shopImage = shop.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(shop.name)}&background=10b981&color=fff&size=800`;

  return (
    <div className="min-h-screen bg-gradient-to-b from-yellow-100 via-amber-100/60 to-orange-100/50">
      <CustomerHeader />

      <main className="max-w-7xl mx-auto px-4 py-6">
        {/* Back Button */}
        <Link
          to="/shops"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to shops
        </Link>

        {/* Shop Header */}
        <div className="bg-card rounded-2xl overflow-hidden shadow-soft mb-8">
          <div className="relative h-48 sm:h-64">
            <img
              src={shopImage}
              alt={shop.name}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(shop.name)}&background=10b981&color=fff&size=800`;
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-6 text-card">
              <h1 className="text-2xl sm:text-3xl font-bold mb-2">{shop.name}</h1>
              <div className="flex flex-wrap items-center gap-4 text-sm">
                <span className="flex items-center gap-1">
                  <Star className="w-4 h-4 text-accent fill-accent" />
                  {shop.rating ? shop.rating.toFixed(1) : '4.5'} Rating
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  15-20 min
                </span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  {shop.city}
                </span>
                <span
                  className={`px-2 py-0.5 rounded-full text-xs font-semibold ${(
                    shop.isOpen !== undefined ? shop.isOpen : (shop.is_open !== undefined ? shop.is_open : true)
                  )
                    ? "bg-primary text-primary-foreground"
                    : "bg-destructive text-destructive-foreground"
                    }`}
                >
                  {(shop.isOpen !== undefined ? shop.isOpen : (shop.is_open !== undefined ? shop.is_open : true)) ? "Open" : "Closed"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Search & Category Filter */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Category Pills */}
        {availableCategories.length > 1 && (
          <div className="flex gap-2 overflow-x-auto pb-4 mb-6 scrollbar-hide">
            {availableCategories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${selectedCategory === category
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-secondary-foreground hover:bg-muted"
                  }`}
              >
                {category}
              </button>
            ))}
          </div>
        )}

        {/* Products Grid */}
        {products.length > 0 ? (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {filteredProducts.map((product) => (
                <ProductCard
                  key={product.id || product._id}
                  product={product}
                  shopId={shop.id || shop._id}
                  shopName={shop.name}
                />
              ))}
            </div>

            {filteredProducts.length === 0 && (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No products found matching your criteria</p>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-12 bg-card rounded-lg">
            <p className="text-muted-foreground mb-2">No products available yet</p>
            <p className="text-sm text-muted-foreground">The shop owner hasn't added any products yet.</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default ShopDetail;
