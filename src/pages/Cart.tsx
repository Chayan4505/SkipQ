import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { CustomerHeader } from "@/components/customer/CustomerHeader";
import { cartAPI, ordersAPI } from "@/lib/api";
import { ShoppingCart, Trash2, Plus, Minus, ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface CartItem {
    productId: string;
    productName: string;
    price: number;
    quantity: number;
    shopId: string;
    shopName: string;
    image?: string;
    unit: string;
}

const Cart = () => {
    const [cartItems, setCartItems] = useState<CartItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    const navigate = useNavigate();
    const { toast } = useToast();

    useEffect(() => {
        loadCart();
    }, []);

    const loadCart = async () => {
        try {
            setLoading(true);
            const response = await cartAPI.get();
            setCartItems(response.items || []);
        } catch (error: any) {
            console.error("Failed to load cart:", error);
            toast({
                title: "Error",
                description: "Failed to load cart",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    const updateQuantity = async (productId: string, newQuantity: number) => {
        if (newQuantity < 1) return;

        try {
            setUpdating(true);
            await cartAPI.update(productId, newQuantity);
            await loadCart();
        } catch (error: any) {
            toast({
                title: "Error",
                description: "Failed to update quantity",
                variant: "destructive",
            });
        } finally {
            setUpdating(false);
        }
    };

    const removeItem = async (productId: string) => {
        try {
            setUpdating(true);
            await cartAPI.remove(productId);
            await loadCart();
            toast({
                title: "Removed",
                description: "Item removed from cart",
            });
        } catch (error: any) {
            toast({
                title: "Error",
                description: "Failed to remove item",
                variant: "destructive",
            });
        } finally {
            setUpdating(false);
        }
    };

    const clearCart = async () => {
        try {
            setUpdating(true);
            await cartAPI.clear();
            await loadCart();
            toast({
                title: "Cart Cleared",
                description: "All items removed from cart",
            });
        } catch (error: any) {
            toast({
                title: "Error",
                description: "Failed to clear cart",
                variant: "destructive",
            });
        } finally {
            setUpdating(false);
        }
    };

    const continueToPayment = () => {
        if (cartItems.length === 0) return;

        // Group items by shop
        const shopId = cartItems[0].shopId;
        const items = cartItems.map(item => ({
            productId: item.productId,
            productName: item.productName,
            name: item.productName,
            quantity: item.quantity,
            price: item.price,
        }));

        const totalAmount = cartItems.reduce(
            (sum, item) => sum + item.price * item.quantity,
            0
        );

        const orderData = {
            shopId,
            items,
            totalAmount,
        };

        // Navigate to payment page with order data
        navigate("/payment", { state: { orderData } });
    };

    const totalAmount = cartItems.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
    );

    const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);

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

    return (
        <div className="min-h-screen bg-gradient-to-b from-yellow-100 via-amber-100/60 to-orange-100/50">
            <CustomerHeader />

            <main className="max-w-7xl mx-auto px-4 py-6">
                {/* Header */}
                <div className="mb-6">
                    <h1 className="text-2xl sm:text-3xl font-bold text-foreground flex items-center gap-2">
                        <ShoppingCart className="w-7 h-7" />
                        My Cart
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        {totalItems} {totalItems === 1 ? "item" : "items"} in your cart
                    </p>
                </div>

                {cartItems.length === 0 ? (
                    /* Empty Cart */
                    <div className="bg-card rounded-2xl shadow-soft p-12 text-center">
                        <ShoppingCart className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
                        <h2 className="text-xl font-semibold text-foreground mb-2">
                            Your cart is empty
                        </h2>
                        <p className="text-muted-foreground mb-6">
                            Add items from shops to get started
                        </p>
                        <Button onClick={() => navigate("/shops")}>
                            Browse Shops
                        </Button>
                    </div>
                ) : (
                    <div className="grid lg:grid-cols-3 gap-6">
                        {/* Cart Items */}
                        <div className="lg:col-span-2 space-y-4">
                            {cartItems.map((item) => (
                                <div
                                    key={item.productId}
                                    className="bg-card rounded-2xl shadow-soft p-4 sm:p-6"
                                >
                                    <div className="flex gap-4">
                                        {/* Product Image */}
                                        <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                                            {item.image ? (
                                                <img
                                                    src={item.image}
                                                    alt={item.productName}
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                                                    <ShoppingCart className="w-8 h-8" />
                                                </div>
                                            )}
                                        </div>

                                        {/* Product Info */}
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-semibold text-foreground mb-1 truncate">
                                                {item.productName}
                                            </h3>
                                            <p className="text-sm text-muted-foreground mb-2">
                                                {item.shopName}
                                            </p>
                                            <div className="flex items-center gap-4">
                                                <span className="text-lg font-bold text-primary">
                                                    ₹{item.price}
                                                    <span className="text-sm font-normal text-muted-foreground">
                                                        /{item.unit}
                                                    </span>
                                                </span>
                                            </div>
                                        </div>

                                        {/* Quantity Controls */}
                                        <div className="flex flex-col items-end gap-2">
                                            <button
                                                onClick={() => removeItem(item.productId)}
                                                disabled={updating}
                                                className="text-destructive hover:text-destructive/80 p-2"
                                            >
                                                <Trash2 className="w-5 h-5" />
                                            </button>
                                            <div className="flex items-center gap-2 bg-muted rounded-lg">
                                                <button
                                                    onClick={() =>
                                                        updateQuantity(item.productId, item.quantity - 1)
                                                    }
                                                    disabled={updating || item.quantity <= 1}
                                                    className="p-2 hover:bg-muted-foreground/10 rounded-l-lg disabled:opacity-50"
                                                >
                                                    <Minus className="w-4 h-4" />
                                                </button>
                                                <span className="w-8 text-center font-semibold">
                                                    {item.quantity}
                                                </span>
                                                <button
                                                    onClick={() =>
                                                        updateQuantity(item.productId, item.quantity + 1)
                                                    }
                                                    disabled={updating}
                                                    className="p-2 hover:bg-muted-foreground/10 rounded-r-lg"
                                                >
                                                    <Plus className="w-4 h-4" />
                                                </button>
                                            </div>
                                            <span className="text-sm font-semibold text-foreground">
                                                ₹{(item.price * item.quantity).toFixed(2)}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}

                            {/* Clear Cart Button */}
                            <Button
                                variant="outline"
                                onClick={clearCart}
                                disabled={updating}
                                className="w-full"
                            >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Clear Cart
                            </Button>
                        </div>

                        {/* Order Summary */}
                        <div className="lg:col-span-1">
                            <div className="bg-card rounded-2xl shadow-soft p-6 sticky top-6">
                                <h2 className="text-xl font-bold text-foreground mb-4">
                                    Order Summary
                                </h2>

                                <div className="space-y-3 mb-6">
                                    <div className="flex justify-between text-muted-foreground">
                                        <span>Subtotal ({totalItems} items)</span>
                                        <span>₹{totalAmount.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between text-muted-foreground">
                                        <span>Delivery Fee</span>
                                        <span className="text-green-600 font-medium">FREE</span>
                                    </div>
                                    <div className="border-t border-border pt-3">
                                        <div className="flex justify-between text-lg font-bold text-foreground">
                                            <span>Total</span>
                                            <span>₹{totalAmount.toFixed(2)}</span>
                                        </div>
                                    </div>
                                </div>

                                <Button
                                    onClick={continueToPayment}
                                    disabled={cartItems.length === 0}
                                    className="w-full"
                                    size="lg"
                                >
                                    Continue to Payment
                                    <ArrowRight className="w-4 h-4 ml-2" />
                                </Button>

                                <p className="text-xs text-muted-foreground text-center mt-4">
                                    Choose payment method on next page
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default Cart;
