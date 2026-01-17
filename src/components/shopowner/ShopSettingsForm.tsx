import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Save, Store } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { shopsAPI } from "@/lib/api";

interface ShopSettingsFormProps {
    shopId?: string;
    onSuccess: () => void;
}

export const ShopSettingsForm = ({ shopId, onSuccess }: ShopSettingsFormProps) => {
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        image: "",
        category: "",
        address: "",
        city: "",
        state: "",
        pincode: "",
        phone: "",
        isOpen: true,
    });
    const { toast } = useToast();

    useEffect(() => {
        if (shopId) {
            loadShopData();
        }
    }, [shopId]);

    const loadShopData = async () => {
        try {
            setIsLoading(true);
            const response = await shopsAPI.getById(shopId!);
            const shop = response.shop;
            setFormData({
                name: shop.name || "",
                image: shop.image || "",
                category: shop.category || "",
                address: shop.address || "",
                city: shop.city || "",
                state: shop.state || "",
                pincode: shop.pincode || "",
                phone: shop.phone || "",
                isOpen: shop.isOpen !== undefined ? shop.isOpen : (shop.is_open !== undefined ? shop.is_open : true),
            });
        } catch (error: any) {
            console.log("Error loading shop:", error.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setIsSaving(true);

            const shopData = {
                name: formData.name,
                image: formData.image,
                category: formData.category,
                address: formData.address,
                city: formData.city,
                state: formData.state,
                pincode: formData.pincode,
                phone: formData.phone,
                isOpen: formData.isOpen,
            };

            if (shopId) {
                await shopsAPI.update(shopId, shopData);
            } else {
                await shopsAPI.create(shopData);
            }

            onSuccess();
        } catch (error: any) {
            toast({
                title: "Error",
                description: error.message || "Failed to save shop details",
                variant: "destructive",
            });
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Shop Settings</CardTitle>
                <CardDescription>
                    {shopId ? "Update your shop information" : "Create your shop profile"}
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="shopName">Shop Name *</Label>
                        <Input
                            id="shopName"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            placeholder="Enter shop name"
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="shopImage">Shop Image URL</Label>
                        <Input
                            id="shopImage"
                            value={formData.image}
                            onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                            placeholder="https://example.com/shop-image.jpg"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="category">Category *</Label>
                        <select
                            id="category"
                            value={formData.category}
                            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            required
                        >
                            <option value="">Select a category</option>
                            <option value="Grocery">Grocery</option>
                            <option value="Pharmacy">Pharmacy</option>
                            <option value="Bakery">Bakery</option>
                            <option value="Dairy">Dairy</option>
                            <option value="Vegetables">Vegetables & Fruits</option>
                            <option value="Meat">Meat & Seafood</option>
                            <option value="General">General Store</option>
                            <option value="Other">Other</option>
                        </select>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="phone">Phone Number *</Label>
                        <Input
                            id="phone"
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            placeholder="Enter phone number"
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="address">Address *</Label>
                        <Input
                            id="address"
                            value={formData.address}
                            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                            placeholder="Street address"
                            required
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="city">City *</Label>
                            <Input
                                id="city"
                                value={formData.city}
                                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                                placeholder="City"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="state">State *</Label>
                            <Input
                                id="state"
                                value={formData.state}
                                onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                                placeholder="State"
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="pincode">Pincode *</Label>
                        <Input
                            id="pincode"
                            value={formData.pincode}
                            onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                            placeholder="Pincode"
                            required
                        />
                    </div>

                    {/* Open/Closed Toggle */}
                    <div className="space-y-3 p-4 bg-muted/30 rounded-lg border border-border">
                        <div className="flex items-center justify-between">
                            <div className="space-y-1">
                                <Label htmlFor="isOpen" className="text-base font-semibold flex items-center gap-2">
                                    <Store className="w-4 h-4" />
                                    Shop Status
                                </Label>
                                <p className="text-sm text-muted-foreground">
                                    {formData.isOpen ? "Your shop is currently open for orders" : "Your shop is currently closed"}
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setFormData({ ...formData, isOpen: !formData.isOpen })}
                                className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${formData.isOpen ? 'bg-green-500' : 'bg-gray-300'
                                    }`}
                                role="switch"
                                aria-checked={formData.isOpen}
                                id="isOpen"
                            >
                                <span
                                    className={`inline-block h-6 w-6 transform rounded-full bg-white shadow-lg transition-transform ${formData.isOpen ? 'translate-x-7' : 'translate-x-1'
                                        }`}
                                />
                            </button>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                            <div className={`w-2 h-2 rounded-full ${formData.isOpen ? 'bg-green-500 animate-pulse' : 'bg-gray-400'
                                }`} />
                            <span className={formData.isOpen ? 'text-green-600 font-medium' : 'text-muted-foreground'}>
                                {formData.isOpen ? 'Open' : 'Closed'}
                            </span>
                        </div>
                    </div>

                    <Button type="submit" disabled={isSaving} className="w-full">
                        {isSaving ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Saving...
                            </>
                        ) : (
                            <>
                                <Save className="w-4 h-4 mr-2" />
                                {shopId ? "Update Shop" : "Create Shop"}
                            </>
                        )}
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
};
