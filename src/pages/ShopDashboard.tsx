import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ShopOwnerHeader } from "@/components/shopowner/ShopOwnerHeader";
import { ProductForm } from "@/components/shopowner/ProductForm";
import { ProductTableRow } from "@/components/shopowner/ProductTableRow";
import { ShopSettingsForm } from "@/components/shopowner/ShopSettingsForm";
import { PendingOrdersPanel } from "@/components/shopowner/PendingOrdersPanel";
import { ShopOrdersPage } from "@/components/shopowner/ShopOrdersPage";
import { Product } from "@/types/shop";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Search, Package, TrendingUp, ShoppingBag, Settings, Loader2, ClipboardList } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { shopsAPI, productsAPI, ordersAPI } from "@/lib/api";

const ShopDashboard = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | undefined>();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("products");
  const [shopId, setShopId] = useState<string | undefined>();
  const [shopName, setShopName] = useState<string>("");
  const [isLoadingShop, setIsLoadingShop] = useState(true);
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);
  const [isCheckingRole, setIsCheckingRole] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Check user role first
    const checkUserRole = () => {
      try {
        const userStr = localStorage.getItem('user');
        if (!userStr) {
          toast({
            title: "Please Login",
            description: "You need to login to access the shop dashboard",
            variant: "destructive",
          });
          navigate('/auth');
          return false;
        }

        const user = JSON.parse(userStr);
        if (user.role !== 'shopowner') {
          toast({
            title: "Access Denied",
            description: "This page is only for shop owners. You are logged in as a buyer.",
            variant: "destructive",
          });
          navigate('/shops');
          return false;
        }
        return true;
      } catch (error) {
        toast({
          title: "Error",
          description: "Unable to verify your account. Please login again.",
          variant: "destructive",
        });
        navigate('/auth');
        return false;
      }
    };

    if (checkUserRole()) {
      setIsCheckingRole(false);
      loadShopData();
    }
  }, [navigate, toast]);

  // Load products when shopId changes
  useEffect(() => {
    if (shopId) {
      loadProducts();
    }
  }, [shopId]);

  const loadShopData = async () => {
    try {
      setIsLoadingShop(true);
      const response = await shopsAPI.getMyShops();
      if (response.shops && response.shops.length > 0) {
        setShopId(response.shops[0]._id || response.shops[0].id);
        setShopName(response.shops[0].name || "Shop Owner");
      }
    } catch (error: any) {
      // Shop might not exist yet, that's okay - user can create one
      console.log("No shop found yet or error:", error.message);
      // Don't show error toast - it's normal for new shop owners
    } finally {
      setIsLoadingShop(false);
    }
  };

  const loadProducts = async () => {
    if (!shopId) return;

    try {
      setIsLoadingProducts(true);
      const response = await productsAPI.getByShop(shopId);
      // Map database products to match Product type
      const mappedProducts = (response.products || []).map((p: any) => ({
        id: p.id || p._id,
        name: p.name,
        image: p.image,
        price: p.price,
        originalPrice: p.original_price || p.originalPrice,
        unit: p.unit,
        category: p.category,
        inStock: p.is_available !== undefined ? p.is_available : p.inStock,
      }));
      setProducts(mappedProducts);
    } catch (error: any) {
      console.error("Failed to load products:", error);
      toast({
        title: "Error",
        description: "Failed to load products",
        variant: "destructive",
      });
    } finally {
      setIsLoadingProducts(false);
    }
  };

  const handleShopUpdate = () => {
    loadShopData();
    toast({
      title: "Success",
      description: "Shop details saved successfully!",
    });
  };

  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const stats = {
    totalProducts: products.length,
    inStock: products.filter((p) => p.inStock).length,
    outOfStock: products.filter((p) => !p.inStock).length,
    totalOrders: 24, // Demo value
  };

  const handleAddProduct = async (data: Omit<Product, "id">) => {
    if (!shopId) {
      toast({
        title: "Error",
        description: "Please create your shop first in the Shop Settings tab",
        variant: "destructive",
      });
      return;
    }

    try {
      const productData = {
        shopId,
        name: data.name,
        description: data.name, // Add description if needed
        category: data.category,
        price: data.price,
        originalPrice: data.originalPrice,
        unit: data.unit,
        image: data.image,
        isAvailable: data.inStock,
        stock: data.inStock ? 100 : 0, // Default stock quantity
      };

      await productsAPI.create(productData);
      await loadProducts(); // Reload products from database
      setShowForm(false);
      toast({
        title: "Product Added",
        description: `${data.name} has been added to your inventory.`,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to add product",
        variant: "destructive",
      });
    }
  };

  const handleEditProduct = async (data: Omit<Product, "id">) => {
    if (!editingProduct) return;

    try {
      const productData = {
        name: data.name,
        category: data.category,
        price: data.price,
        originalPrice: data.originalPrice,
        unit: data.unit,
        image: data.image,
        isAvailable: data.inStock,
        stock: data.inStock ? 100 : 0,
      };

      await productsAPI.update(editingProduct.id, productData);
      await loadProducts(); // Reload products from database
      setEditingProduct(undefined);
      toast({
        title: "Product Updated",
        description: `${data.name} has been updated.`,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update product",
        variant: "destructive",
      });
    }
  };

  const handleDeleteProduct = async (id: string) => {
    const product = products.find((p) => p.id === id);

    try {
      await productsAPI.delete(id);
      await loadProducts(); // Reload products from database
      toast({
        title: "Product Deleted",
        description: `${product?.name} has been removed.`,
        variant: "destructive",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete product",
        variant: "destructive",
      });
    }
  };

  const handleToggleStock = async (id: string, inStock: boolean) => {
    try {
      await productsAPI.update(id, { isAvailable: inStock, stock: inStock ? 100 : 0 });
      await loadProducts(); // Reload products from database
      toast({
        title: inStock ? "Product Available" : "Product Unavailable",
        description: `Stock status updated.`,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update stock status",
        variant: "destructive",
      });
    }
  };

  // Show loading only for shop data, not for the whole page
  // Show loading while checking role
  if (isCheckingRole) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-yellow-100 via-amber-100/60 to-orange-100/50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-yellow-100 via-amber-100/60 to-orange-100/50">
      <ShopOwnerHeader />

      <main className="max-w-7xl mx-auto px-4 py-6">
        {/* Welcome Section */}
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">
            Welcome back, {shopName}! 👋
          </h1>
          <p className="text-muted-foreground">
            Manage your shop, products, and track your orders
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full max-w-2xl grid-cols-3 mb-6">
            <TabsTrigger value="products" className="flex items-center gap-2">
              <Package className="w-4 h-4" />
              Products
            </TabsTrigger>
            <TabsTrigger value="orders" className="flex items-center gap-2">
              <ClipboardList className="w-4 h-4" />
              Orders
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Shop Settings
            </TabsTrigger>
          </TabsList>

          {/* Products Tab */}
          <TabsContent value="products" className="space-y-6">

            {/* Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-card rounded-2xl p-5 shadow-soft border border-orange-100">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center">
                    <Package className="w-5 h-5 text-orange-600" />
                  </div>
                  <span className="text-sm text-muted-foreground">Total Products</span>
                </div>
                <p className="text-2xl font-bold text-foreground">{stats.totalProducts}</p>
              </div>
              <div className="bg-card rounded-2xl p-5 shadow-soft border border-green-100">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-green-600" />
                  </div>
                  <span className="text-sm text-muted-foreground">In Stock</span>
                </div>
                <p className="text-2xl font-bold text-green-600">{stats.inStock}</p>
              </div>
              <div className="bg-card rounded-2xl p-5 shadow-soft border border-red-100">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center">
                    <Package className="w-5 h-5 text-red-600" />
                  </div>
                  <span className="text-sm text-muted-foreground">Out of Stock</span>
                </div>
                <p className="text-2xl font-bold text-red-600">{stats.outOfStock}</p>
              </div>
              <div className="bg-card rounded-2xl p-5 shadow-soft border border-purple-100">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center">
                    <ShoppingBag className="w-5 h-5 text-purple-600" />
                  </div>
                  <span className="text-sm text-muted-foreground">Today's Orders</span>
                </div>
                <p className="text-2xl font-bold text-purple-600">{stats.totalOrders}</p>
              </div>
            </div>

            {/* Products and Pending Orders Grid */}
            <div className="grid lg:grid-cols-3 gap-6">
              {/* Products Section - Takes 2 columns */}
              <div className="lg:col-span-2">
                <div className="bg-card rounded-2xl shadow-soft">
                  <div className="p-4 sm:p-6 border-b border-border flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                    <h2 className="text-xl font-bold text-foreground">Your Products</h2>
                    <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                      <div className="relative flex-1 sm:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          placeholder="Search products..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="pl-10"
                        />
                      </div>
                      <Button onClick={() => setShowForm(true)}>
                        <Plus className="w-4 h-4 mr-2" />
                        Add Product
                      </Button>
                    </div>
                  </div>

                  {/* Products Table */}
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-muted/50">
                        <tr>
                          <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">
                            Product
                          </th>
                          <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">
                            Category
                          </th>
                          <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">
                            Price
                          </th>
                          <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">
                            In Stock
                          </th>
                          <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredProducts.map((product) => (
                          <ProductTableRow
                            key={product.id}
                            product={product}
                            onEdit={setEditingProduct}
                            onDelete={handleDeleteProduct}
                            onToggleStock={handleToggleStock}
                          />
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {filteredProducts.length === 0 && (
                    <div className="p-12 text-center">
                      <Package className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
                      <p className="text-muted-foreground">
                        {searchQuery ? "No products found" : "No products yet. Add your first product!"}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Pending Orders Panel - Takes 1 column */}
              <div className="lg:col-span-1">
                {shopId && <PendingOrdersPanel shopId={shopId} />}
              </div>
            </div>
          </TabsContent>

          {/* Orders Tab */}
          <TabsContent value="orders" className="space-y-6">
            {shopId ? (
              <ShopOrdersPage shopId={shopId} />
            ) : (
              <div className="text-center py-12">
                <Package className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
                <p className="text-muted-foreground">Please set up your shop first in Shop Settings</p>
              </div>
            )}
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            {isLoadingShop ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : (
              <ShopSettingsForm shopId={shopId} onSuccess={handleShopUpdate} />
            )}
          </TabsContent>
        </Tabs>
      </main>

      {/* Product Form Modal */}
      {showForm && (
        <ProductForm
          onSubmit={handleAddProduct}
          onCancel={() => setShowForm(false)}
        />
      )}
      {editingProduct && (
        <ProductForm
          product={editingProduct}
          onSubmit={handleEditProduct}
          onCancel={() => setEditingProduct(undefined)}
        />
      )}
    </div>
  );
};

export default ShopDashboard;
