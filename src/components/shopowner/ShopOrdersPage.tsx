import { useEffect, useState } from "react";
import { ordersAPI } from "@/lib/api";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Clock,
    Package,
    User,
    Phone,
    MapPin,
    CheckCircle,
    XCircle,
    Loader2
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Order {
    id: string;
    order_number: string;
    user_id: string;
    users?: {
        name: string;
        mobile: string;
    };
    total_amount: number;
    status: string;
    payment_method: string;
    payment_status: string;
    delivery_address?: {
        address: string;
        city: string;
        state: string;
        pincode: string;
    };
    created_at: string;
    order_items?: Array<{
        name: string;
        quantity: number;
        price: number;
    }>;
}

interface ShopOrdersPageProps {
    shopId: string;
}

export const ShopOrdersPage = ({ shopId }: ShopOrdersPageProps) => {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();

    useEffect(() => {
        if (shopId) {
            loadOrders();
        }
    }, [shopId]);

    const loadOrders = async () => {
        try {
            setLoading(true);
            const response = await ordersAPI.getShopOrders(shopId);
            // Sort: pending first, then by date
            const sorted = (response.orders || []).sort((a: Order, b: Order) => {
                if (a.status === 'pending' && b.status !== 'pending') return -1;
                if (a.status !== 'pending' && b.status === 'pending') return 1;
                return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
            });
            setOrders(sorted);
        } catch (error: any) {
            console.error("Failed to load orders:", error);
            toast({
                title: "Error",
                description: "Failed to load orders",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateStatus = async (orderId: string, newStatus: string) => {
        try {
            await ordersAPI.updateStatus(orderId, newStatus);
            toast({
                title: "Order Updated",
                description: `Order status changed to ${newStatus}`,
            });
            loadOrders();
        } catch (error: any) {
            toast({
                title: "Error",
                description: error.message || "Failed to update order",
                variant: "destructive",
            });
        }
    };

    const getStatusBadge = (status: string) => {
        const statusConfig: Record<string, { variant: "default" | "secondary" | "destructive" | "outline", label: string }> = {
            pending: { variant: "outline", label: "Pending" },
            confirmed: { variant: "default", label: "Confirmed" },
            preparing: { variant: "secondary", label: "Preparing" },
            ready: { variant: "default", label: "Ready" },
            completed: { variant: "default", label: "Completed" },
            cancelled: { variant: "destructive", label: "Cancelled" },
        };

        const config = statusConfig[status] || { variant: "outline" as const, label: status };
        return <Badge variant={config.variant}>{config.label}</Badge>;
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleString("en-IN", {
            day: "numeric",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    if (orders.length === 0) {
        return (
            <Card>
                <CardContent className="py-12 text-center">
                    <Package className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-foreground mb-2">No Orders Yet</h3>
                    <p className="text-muted-foreground">
                        Orders from customers will appear here
                    </p>
                </CardContent>
            </Card>
        );
    }

    // Separate pending and completed orders
    const pendingOrders = orders.filter(o => o.status === 'pending');
    const otherOrders = orders.filter(o => o.status !== 'pending');

    return (
        <div className="space-y-6">
            {/* Pending Orders Section */}
            {pendingOrders.length > 0 && (
                <div>
                    <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                        <Clock className="w-5 h-5" />
                        Pending Orders ({pendingOrders.length})
                    </h2>
                    <div className="grid gap-4">
                        {pendingOrders.map((order) => (
                            <OrderCard
                                key={order.id}
                                order={order}
                                onUpdateStatus={handleUpdateStatus}
                                getStatusBadge={getStatusBadge}
                                formatDate={formatDate}
                            />
                        ))}
                    </div>
                </div>
            )}

            {/* Other Orders Section */}
            {otherOrders.length > 0 && (
                <div>
                    <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                        <Package className="w-5 h-5" />
                        All Orders ({otherOrders.length})
                    </h2>
                    <div className="grid gap-4">
                        {otherOrders.map((order) => (
                            <OrderCard
                                key={order.id}
                                order={order}
                                onUpdateStatus={handleUpdateStatus}
                                getStatusBadge={getStatusBadge}
                                formatDate={formatDate}
                            />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

// Order Card Component
interface OrderCardProps {
    order: Order;
    onUpdateStatus: (orderId: string, status: string) => void;
    getStatusBadge: (status: string) => JSX.Element;
    formatDate: (date: string) => string;
}

const OrderCard = ({ order, onUpdateStatus, getStatusBadge, formatDate }: OrderCardProps) => {
    return (
        <Card>
            <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 mb-4">
                    <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-semibold text-foreground">
                                Order #{order.order_number}
                            </h3>
                            {getStatusBadge(order.status)}
                        </div>
                        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                                <Clock className="w-4 h-4" />
                                {formatDate(order.created_at)}
                            </div>
                            <div className="flex items-center gap-1">
                                <Package className="w-4 h-4" />
                                {order.order_items?.length || 0} items
                            </div>
                        </div>
                    </div>
                    <div className="text-right">
                        <div className="text-2xl font-bold text-foreground">
                            ₹{order.total_amount.toFixed(2)}
                        </div>
                        <div className="text-sm text-muted-foreground">
                            {order.payment_method === "cash" ? "Cash" : "Online"} • {order.payment_status}
                        </div>
                    </div>
                </div>

                {/* Customer Info */}
                {order.users && (
                    <div className="border-t border-border pt-4 mb-4">
                        <h4 className="text-sm font-semibold text-foreground mb-2">Customer Details</h4>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                            <div className="flex items-center gap-2 text-muted-foreground">
                                <User className="w-4 h-4" />
                                {order.users.name}
                            </div>
                            <div className="flex items-center gap-2 text-muted-foreground">
                                <Phone className="w-4 h-4" />
                                {order.users.mobile}
                            </div>
                        </div>
                    </div>
                )}

                {/* Order Items */}
                <div className="border-t border-border pt-4 mb-4">
                    <h4 className="text-sm font-semibold text-foreground mb-2">Order Items</h4>
                    <div className="space-y-2">
                        {order.order_items?.map((item, idx) => (
                            <div key={idx} className="flex items-center justify-between text-sm py-1">
                                <span className="text-foreground">
                                    {item.name} × {item.quantity}
                                </span>
                                <span className="text-muted-foreground">
                                    ₹{(item.price * item.quantity).toFixed(2)}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Delivery Address */}
                {order.delivery_address && (
                    <div className="border-t border-border pt-4 mb-4">
                        <h4 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
                            <MapPin className="w-4 h-4" />
                            Delivery Address
                        </h4>
                        <p className="text-sm text-muted-foreground">
                            {order.delivery_address.address}, {order.delivery_address.city},{" "}
                            {order.delivery_address.state} - {order.delivery_address.pincode}
                        </p>
                    </div>
                )}

                {/* Action Buttons */}
                {order.status === 'pending' && (
                    <div className="border-t border-border pt-4 flex gap-2">
                        <Button
                            size="sm"
                            onClick={() => onUpdateStatus(order.id, 'confirmed')}
                            className="flex-1"
                        >
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Accept Order
                        </Button>
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={() => onUpdateStatus(order.id, 'cancelled')}
                            className="flex-1 text-red-600 hover:text-red-700"
                        >
                            <XCircle className="w-4 h-4 mr-2" />
                            Reject
                        </Button>
                    </div>
                )}

                {order.status === 'confirmed' && (
                    <div className="border-t border-border pt-4">
                        <Button
                            size="sm"
                            onClick={() => onUpdateStatus(order.id, 'preparing')}
                            className="w-full"
                        >
                            Mark as Preparing
                        </Button>
                    </div>
                )}

                {order.status === 'preparing' && (
                    <div className="border-t border-border pt-4">
                        <Button
                            size="sm"
                            onClick={() => onUpdateStatus(order.id, 'ready')}
                            className="w-full"
                        >
                            Mark as Ready
                        </Button>
                    </div>
                )}

                {order.status === 'ready' && (
                    <div className="border-t border-border pt-4">
                        <Button
                            size="sm"
                            onClick={() => onUpdateStatus(order.id, 'completed')}
                            className="w-full"
                        >
                            Mark as Completed
                        </Button>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};
