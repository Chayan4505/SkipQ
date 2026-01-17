import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { CustomerHeader } from "@/components/customer/CustomerHeader";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { authAPI, ordersAPI, usersAPI } from "@/lib/api";
import {
  User,
  Settings,
  ShoppingBag,
  MapPin,
  Phone,
  Mail,
  Calendar,
  Package,
  CheckCircle2,
  XCircle,
  Clock,
  Loader2,
  Edit2,
  Save,
  X,
  LogOut
} from "lucide-react";

type TabValue = "account" | "settings" | "orders";

interface UserProfile {
  id: string;
  name: string;
  mobile: string;
  email?: string;
  role: string;
  location?: {
    address: string;
    city: string;
    state: string;
    pincode: string;
  };
}

interface Order {
  _id?: string;
  id?: string;
  shops?: {
    name: string;
    image?: string;
  };
  shopId?: {
    name: string;
    image?: string;
  };
  order_items?: Array<{
    product_id: string;
    name: string;
    quantity: number;
    price: number;
  }>;
  items?: Array<{
    productId: string;
    name: string;
    quantity: number;
    price: number;
  }>;
  total_amount?: number;
  totalAmount?: number;
  status: string;
  payment_method?: string;
  paymentMethod?: string;
  payment_status?: string;
  paymentStatus?: string;
  delivery_address?: {
    address: string;
    city: string;
    state: string;
    pincode: string;
  };
  deliveryAddress?: {
    address: string;
    city: string;
    state: string;
    pincode: string;
  };
  created_at?: string;
  createdAt?: string;
}

const MyAccount = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabValue>("account");
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editForm, setEditForm] = useState({
    name: "",
    email: "",
  });
  const { toast } = useToast();

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('token');
    if (!token) {
      toast({
        title: "Please Login",
        description: "You need to login to access your account",
        variant: "destructive",
      });
      navigate('/auth');
      return;
    }
    loadData();
  }, [navigate, toast]);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [profileRes, ordersRes] = await Promise.all([
        usersAPI.getProfile(),
        ordersAPI.getMyOrders(),
      ]);
      setProfile(profileRes.user);
      setOrders(ordersRes.orders || []);
      setEditForm({
        name: profileRes.user.name || "",
        email: profileRes.user.email || "",
      });
    } catch (error: any) {
      console.error("Failed to load account data:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to load account data",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    try {
      setIsSaving(true);
      const response = await usersAPI.updateProfile({
        name: editForm.name,
        email: editForm.email,
      });
      setProfile(response.user);
      setIsEditing(false);
      toast({
        title: "Profile Updated",
        description: "Your profile has been updated successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update profile",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelEdit = () => {
    setEditForm({
      name: profile?.name || "",
      email: profile?.email || "",
    });
    setIsEditing(false);
  };

  const handleLogout = () => {
    // Clear all auth data
    localStorage.removeItem('token');
    localStorage.removeItem('user');

    toast({
      title: "Logged Out",
      description: "You have been logged out successfully.",
    });

    // Redirect to home page
    navigate("/");
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "text-yellow-600 bg-yellow-50 border-yellow-200";
      case "confirmed":
        return "text-blue-600 bg-blue-50 border-blue-200";
      case "preparing":
        return "text-purple-600 bg-purple-50 border-purple-200";
      case "out_for_delivery":
        return "text-orange-600 bg-orange-50 border-orange-200";
      case "delivered":
        return "text-green-600 bg-green-50 border-green-200";
      case "cancelled":
        return "text-red-600 bg-red-50 border-red-200";
      default:
        return "text-gray-600 bg-gray-50 border-gray-200";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "delivered":
        return <CheckCircle2 className="w-4 h-4" />;
      case "cancelled":
        return <XCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  // Helper functions to handle both MongoDB and Supabase formats
  const getOrderId = (order: Order) => order.id || order._id || '';
  const getShopName = (order: Order) => order.shops?.name || order.shopId?.name || 'Unknown Shop';
  const getOrderItems = (order: Order) => order.order_items || order.items || [];
  const getTotalAmount = (order: Order) => order.total_amount || order.totalAmount || 0;
  const getPaymentMethod = (order: Order) => order.payment_method || order.paymentMethod || 'cash';
  const getPaymentStatus = (order: Order) => order.payment_status || order.paymentStatus || 'pending';
  const getDeliveryAddress = (order: Order) => order.delivery_address || order.deliveryAddress;
  const getCreatedAt = (order: Order) => order.created_at || order.createdAt || '';

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-yellow-100 via-amber-100/60 to-orange-100/50">
        <CustomerHeader />
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-yellow-100 via-amber-100/60 to-orange-100/50">
      <CustomerHeader />

      <main className="max-w-7xl mx-auto px-4 py-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-foreground mb-2">My Account</h1>
          <p className="text-muted-foreground">Manage your profile, settings, and orders</p>
        </div>

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as TabValue)} className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-3 mb-6">
            <TabsTrigger value="account" className="flex items-center gap-2">
              <User className="w-4 h-4" />
              Account
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Settings
            </TabsTrigger>
            <TabsTrigger value="orders" className="flex items-center gap-2">
              <ShoppingBag className="w-4 h-4" />
              Orders
            </TabsTrigger>
          </TabsList>

          {/* Account Tab */}
          <TabsContent value="account" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
                <CardDescription>Your account details and statistics</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center gap-4 pb-6 border-b">
                  <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="w-10 h-10 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-foreground">
                      {profile?.name || "User"}
                    </h3>
                    <p className="text-sm text-muted-foreground">{profile?.mobile}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Phone className="w-4 h-4" />
                      Mobile Number
                    </div>
                    <p className="text-foreground font-medium">{profile?.mobile}</p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Mail className="w-4 h-4" />
                      Email Address
                    </div>
                    <p className="text-foreground font-medium">
                      {profile?.email || "Not provided"}
                    </p>
                  </div>

                  {profile?.location && (
                    <>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <MapPin className="w-4 h-4" />
                          Address
                        </div>
                        <p className="text-foreground font-medium">
                          {profile.location.address}
                        </p>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <MapPin className="w-4 h-4" />
                          City, State
                        </div>
                        <p className="text-foreground font-medium">
                          {profile.location.city}, {profile.location.state} - {profile.location.pincode}
                        </p>
                      </div>
                    </>
                  )}
                </div>

                <div className="grid grid-cols-3 gap-4 pt-6 border-t">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">{orders.length}</div>
                    <div className="text-sm text-muted-foreground">Total Orders</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {orders.filter((o) => o.status === "delivered").length}
                    </div>
                    <div className="text-sm text-muted-foreground">Delivered</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-600">
                      {orders.filter((o) =>
                        ["pending", "confirmed", "preparing", "out_for_delivery"].includes(o.status)
                      ).length}
                    </div>
                    <div className="text-sm text-muted-foreground">Active</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Logout Card */}
            <Card>
              <CardHeader>
                <CardTitle>Account Actions</CardTitle>
                <CardDescription>Manage your session</CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  variant="destructive"
                  onClick={handleLogout}
                  className="w-full"
                  size="lg"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Profile Settings</CardTitle>
                <CardDescription>Update your personal information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {!isEditing ? (
                  <>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label>Full Name</Label>
                        <div className="p-3 bg-secondary rounded-md text-foreground">
                          {profile?.name || "Not set"}
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label>Email Address</Label>
                        <div className="p-3 bg-secondary rounded-md text-foreground">
                          {profile?.email || "Not set"}
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label>Mobile Number</Label>
                        <div className="p-3 bg-secondary rounded-md text-foreground">
                          {profile?.mobile}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Mobile number cannot be changed
                        </p>
                      </div>
                    </div>
                    <Button onClick={() => setIsEditing(true)} className="w-full sm:w-auto">
                      <Edit2 className="w-4 h-4 mr-2" />
                      Edit Profile
                    </Button>
                  </>
                ) : (
                  <>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Full Name</Label>
                        <Input
                          id="name"
                          value={editForm.name}
                          onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                          placeholder="Enter your full name"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email Address</Label>
                        <Input
                          id="email"
                          type="email"
                          value={editForm.email}
                          onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                          placeholder="Enter your email"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Mobile Number</Label>
                        <div className="p-3 bg-secondary rounded-md text-foreground">
                          {profile?.mobile}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Mobile number cannot be changed
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={handleSaveProfile}
                        disabled={isSaving}
                        className="flex-1 sm:flex-none"
                      >
                        {isSaving ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Saving...
                          </>
                        ) : (
                          <>
                            <Save className="w-4 h-4 mr-2" />
                            Save Changes
                          </>
                        )}
                      </Button>
                      <Button
                        variant="outline"
                        onClick={handleCancelEdit}
                        disabled={isSaving}
                        className="flex-1 sm:flex-none"
                      >
                        <X className="w-4 h-4 mr-2" />
                        Cancel
                      </Button>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Orders Tab */}
          <TabsContent value="orders" className="space-y-6">
            {orders.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Package className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">No Orders Yet</h3>
                  <p className="text-muted-foreground mb-4">
                    Start shopping to see your order history here
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {orders.map((order) => {
                  const orderId = getOrderId(order);
                  const shopName = getShopName(order);
                  const orderItems = getOrderItems(order);
                  const totalAmount = getTotalAmount(order);
                  const paymentMethod = getPaymentMethod(order);
                  const paymentStatus = getPaymentStatus(order);
                  const deliveryAddress = getDeliveryAddress(order);
                  const createdAt = getCreatedAt(order);

                  return (
                    <Card key={orderId}>
                      <CardContent className="p-6">
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="text-lg font-semibold text-foreground">
                                {shopName}
                              </h3>
                              <span
                                className={`px-2.5 py-1 rounded-full text-xs font-medium border flex items-center gap-1 ${getStatusColor(
                                  order.status
                                )}`}
                              >
                                {getStatusIcon(order.status)}
                                {order.status.replace("_", " ").toUpperCase()}
                              </span>
                            </div>
                            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <Calendar className="w-4 h-4" />
                                {formatDate(createdAt)}
                              </div>
                              <div className="flex items-center gap-1">
                                <Package className="w-4 h-4" />
                                {orderItems.length} item{orderItems.length > 1 ? "s" : ""}
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-2xl font-bold text-foreground">
                              ₹{totalAmount.toFixed(2)}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {paymentMethod === "cash" ? "Cash" : "Online"} •{" "}
                              {paymentStatus}
                            </div>
                          </div>
                        </div>

                        <div className="border-t pt-4 mt-4">
                          <h4 className="text-sm font-semibold text-foreground mb-2">Order Items</h4>
                          <div className="space-y-2">
                            {orderItems.map((item: any, idx: number) => (
                              <div
                                key={idx}
                                className="flex items-center justify-between text-sm py-1"
                              >
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

                        {deliveryAddress && (
                          <div className="border-t pt-4 mt-4">
                            <h4 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
                              <MapPin className="w-4 h-4" />
                              Delivery Address
                            </h4>
                            <p className="text-sm text-muted-foreground">
                              {deliveryAddress.address}, {deliveryAddress.city},{" "}
                              {deliveryAddress.state} - {deliveryAddress.pincode}
                            </p>
                          </div>
                        )}

                        {order.status !== "delivered" && order.status !== "cancelled" && (
                          <div className="border-t pt-4 mt-4">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={async () => {
                                try {
                                  await ordersAPI.cancel(orderId);
                                  toast({
                                    title: "Order Cancelled",
                                    description: "Your order has been cancelled successfully.",
                                  });
                                  loadData();
                                } catch (error: any) {
                                  toast({
                                    title: "Error",
                                    description: error.message || "Failed to cancel order",
                                    variant: "destructive",
                                  });
                                }
                              }}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              Cancel Order
                            </Button>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default MyAccount;

