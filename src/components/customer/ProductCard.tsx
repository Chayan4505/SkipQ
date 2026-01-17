import { Product } from "@/types/shop";
import { Button } from "@/components/ui/button";
import { Plus, Minus } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { useToast } from "@/hooks/use-toast";

interface ProductCardProps {
    product: Product;
    shopId: string;
    shopName: string;
}

export const ProductCard = ({ product, shopId, shopName }: ProductCardProps) => {
    const { items, addToCart, updateQuantity } = useCart();
    const { toast } = useToast();

    const cartItem = items.find((item) => item.id === product.id);
    const quantity = cartItem?.quantity || 0;

    const handleAdd = () => {
        addToCart(product, shopId, shopName);
        toast({
            title: "Added to cart",
            description: `${product.name} has been added to your cart.`,
        });
    };

    const handleIncrement = () => {
        if (cartItem) {
            updateQuantity(product.id, quantity + 1);
        }
    };

    const handleDecrement = () => {
        if (cartItem && quantity > 1) {
            updateQuantity(product.id, quantity - 1);
        } else if (cartItem && quantity === 1) {
            updateQuantity(product.id, 0);
            toast({
                title: "Removed from cart",
                description: `${product.name} has been removed from your cart.`,
            });
        }
    };

    return (
        <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-200">
            {/* Product Image */}
            <div className="relative h-40 bg-gray-200">
                <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover"
                />
                {!product.inStock && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        <span className="bg-white px-3 py-1 rounded-full text-sm font-semibold text-gray-800">
                            Out of Stock
                        </span>
                    </div>
                )}
                {product.originalPrice && (
                    <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                        {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% OFF
                    </div>
                )}
            </div>

            {/* Product Info */}
            <div className="p-4">
                <h3 className="text-base font-semibold text-foreground mb-1 line-clamp-2">
                    {product.name}
                </h3>
                <p className="text-sm text-muted-foreground mb-2">{product.unit}</p>

                {/* Price */}
                <div className="flex items-center gap-2 mb-3">
                    <span className="text-lg font-bold text-foreground">₹{product.price}</span>
                    {product.originalPrice && (
                        <span className="text-sm text-muted-foreground line-through">
                            ₹{product.originalPrice}
                        </span>
                    )}
                </div>

                {/* Add to Cart Button */}
                {quantity === 0 ? (
                    <Button
                        onClick={handleAdd}
                        disabled={!product.inStock}
                        className="w-full"
                        size="sm"
                    >
                        Add to Cart
                    </Button>
                ) : (
                    <div className="flex items-center justify-between bg-primary rounded-md">
                        <button
                            onClick={handleDecrement}
                            className="p-2 text-white hover:bg-primary/90 rounded-l-md transition-colors"
                        >
                            <Minus className="w-4 h-4" />
                        </button>
                        <span className="text-white font-semibold px-4">{quantity}</span>
                        <button
                            onClick={handleIncrement}
                            className="p-2 text-white hover:bg-primary/90 rounded-r-md transition-colors"
                        >
                            <Plus className="w-4 h-4" />
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};
