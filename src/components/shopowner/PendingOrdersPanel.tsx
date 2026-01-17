import { useEffect, useState } from "react";
import { ordersAPI } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, Package, User, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface PendingOrder {
    id: string;
    order_number: string;
    user_id: string;
    users?: {
        name: string;
        mobile: string;
    };
    total_amount: number;
    status: string;
    created_at: string;
    order_items?: Array<{
        name: string;
        quantity: number;
        price: number;
    }>;
}

interface PendingOrdersPanelProps {
    shopId: string;
}

export const PendingOrdersPanel = ({ shopId }: PendingOrdersPanelProps) => {
    const [orders, setOrders] = useState<PendingOrder[]>([]);
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();

    useEffect(() => {
        if (shopId) {
            loadPendingOrders();
        }
    }, [shopId]);

    const loadPendingOrders = async () => {
        try {
            setLoading(true);
            const response = await ordersAPI.getShopOrders(shopId, 'pending');
            setOrders(response.orders || []);
        } catch (error: any) {
            console.error("Failed to load pending orders:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleAcceptOrder = async (orderId: string) => {
        try {
            await ordersAPI.updateStatus(orderId, 'confirmed');
            toast({
                title: "Order Accepted",
                description: "Order has been confirmed",
            });
            loadPendingOrders();
        } catch (error: any) {
            toast({
                title: "Error",
                description: error.message || "Failed to accept order",
                variant: "destructive",
            });
        }
    };

    const formatTime = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);

        if (diffMins < 1) return "Just now";
        if (diffMins < 60) return `${diffMins}m ago`;
        const diffHours = Math.floor(diffMins / 60);
        if (diffHours < 24) return `${diffHours}h ago`;
        return date.toLocaleDateString();
    };

    if (loading) {
        return (
            <Card className="sticky top-6">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Clock className="w-5 h-5" />
                        Pending Orders
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground">Loading...</p>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="sticky top-6">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Clock className="w-5 h-5" />
                    Pending Orders
                    {orders.length > 0 && (
                        <Badge variant="destructive" className="ml-auto">
                            {orders.length}
                        </Badge>
                    )}
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 max-h-[600px] overflow-y-auto">
                {orders.length === 0 ? (
                    <div className="text-center py-8">
                        <Package className="w-12 h-12 text-muted-foreground/30 mx-auto mb-2" />
                        <p className="text-sm text-muted-foreground">No pending orders</p>
                    </div>
                ) : (
                    orders.map((order) => (
                        <div
                            key={order.id}
                            className="border border-border rounded-lg p-3 space-y-2 bg-card hover:bg-accent/50 transition-colors"
                        >
                            <div className="flex items-start justify-between">
                                <div className="space-y-1">
                                    <p className="text-sm font-semibold text-foreground">
                                        #{order.order_number}
                                    </p>
                                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                                        <Clock className="w-3 h-3" />
                                        {formatTime(order.created_at)}
                                    </p>
                                </div>
                                <Badge variant="outline" className="text-orange-600 border-orange-200">
                                    Pending
                                </Badge>
                            </div>

                            {order.users && (
                                <div className="space-y-1">
                                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                                        <User className="w-3 h-3" />
                                        {order.users.name}
                                    </p>
                                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                                        <Phone className="w-3 h-3" />
                                        {order.users.mobile}
                                    </p>
                                </div>
                            )}

                            <div className="border-t border-border pt-2">
                                <p className="text-xs text-muted-foreground mb-1">Items:</p>
                                {order.order_items?.slice(0, 2).map((item, idx) => (
                                    <p key={idx} className="text-xs text-foreground">
                                        • {item.name} × {item.quantity}
                                    </p>
                                ))}
                                {order.order_items && order.order_items.length > 2 && (
                                    <p className="text-xs text-muted-foreground">
                                        +{order.order_items.length - 2} more items
                                    </p>
                                )}
                            </div>

                            <div className="flex items-center justify-between pt-2 border-t border-border">
                                <p className="text-sm font-bold text-foreground">
                                    ₹{order.total_amount.toFixed(2)}
                                </p>
                                <Button
                                    size="sm"
                                    onClick={() => handleAcceptOrder(order.id)}
                                    className="h-7 text-xs"
                                >
                                    Accept
                                </Button>
                            </div>
                        </div>
                    ))
                )}
            </CardContent>
        </Card>
    );
};
