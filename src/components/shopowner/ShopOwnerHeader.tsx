import { Link, useNavigate } from "react-router-dom";
import { LogOut, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BRAND_CONFIG } from "@/config/branding";

export const ShopOwnerHeader = () => {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem("user");
        localStorage.removeItem("token");
        navigate("/auth");
    };

    return (
        <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
            <div className="max-w-7xl mx-auto px-4 py-2">
                <div className="flex items-center justify-between">
                    {/* Logo */}
                    <Link to="/dashboard" className="flex items-center gap-2">
                        <img src="/logo-full.png" alt={BRAND_CONFIG.APP_NAME} className="h-10 w-auto object-contain" />
                        <span className="text-sm font-normal text-muted-foreground border-l border-gray-300 pl-2 ml-1">Shop</span>
                    </Link>

                    {/* Navigation */}
                    <nav className="hidden md:flex items-center gap-6">
                        <Link
                            to="/dashboard"
                            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2"
                        >
                            <Package className="w-4 h-4" />
                            Dashboard
                        </Link>
                    </nav>

                    {/* Actions */}
                    <div className="flex items-center gap-3">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleLogout}
                            className="flex items-center gap-2"
                        >
                            <LogOut className="w-4 h-4" />
                            <span className="hidden sm:inline">Logout</span>
                        </Button>
                    </div>
                </div>
            </div>
        </header>
    );
};
