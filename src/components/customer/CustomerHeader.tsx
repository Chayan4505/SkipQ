import { Link, useNavigate } from "react-router-dom";
import { ShoppingCart, User } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { BRAND_CONFIG } from "@/config/branding";

export const CustomerHeader = () => {
    const navigate = useNavigate();
    const { items } = useCart();
    const cartItemCount = items.reduce((sum, item) => sum + item.quantity, 0);

    return (
        <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
            <div className="max-w-7xl mx-auto px-4 py-2">
                <div className="flex items-center justify-between">
                    {/* Logo */}
                    <Link to="/" className="flex items-center">
                        <img src="/logo-full.png" alt={BRAND_CONFIG.APP_NAME} className="h-10 w-auto object-contain" />
                    </Link>

                    {/* Navigation */}
                    <nav className="hidden md:flex items-center gap-6">
                        <Link
                            to="/shops"
                            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                        >
                            Shops
                        </Link>
                        <Link
                            to="/account"
                            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                        >
                            My Account
                        </Link>
                    </nav>

                    {/* Actions */}
                    <div className="flex items-center gap-3">
                        {/* Cart Button */}
                        <button
                            onClick={() => navigate("/cart")}
                            className="relative p-2 hover:bg-gray-100 rounded-full transition-colors"
                            aria-label="Shopping cart"
                        >
                            <ShoppingCart className="w-5 h-5 text-foreground" />
                            {cartItemCount > 0 && (
                                <span className="absolute -top-1 -right-1 bg-primary text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                                    {cartItemCount}
                                </span>
                            )}
                        </button>

                        {/* User Button */}
                        <button
                            onClick={() => navigate("/account")}
                            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                            aria-label="User account"
                        >
                            <User className="w-5 h-5 text-foreground" />
                        </button>
                    </div>
                </div>
            </div>
        </header>
    );
};
