import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { CustomerHeader } from "@/components/customer/CustomerHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Wallet, Banknote, CheckCircle, QrCode, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ordersAPI, cartAPI } from "@/lib/api";

const Payment = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { toast } = useToast();

    const { orderData } = location.state || {};

    const [paymentMethod, setPaymentMethod] = useState<"cash" | "upi">("cash");
    const [showQR, setShowQR] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);

    if (!orderData) {
        navigate("/cart");
        return null;
    }

    const handlePayment = async () => {
        try {
            setIsProcessing(true);

            if (paymentMethod === "upi") {
                // Show QR code for UPI payment
                setShowQR(true);
                return;
            }

            // For Cash on Delivery, place order directly
            await ordersAPI.create({
                ...orderData,
                paymentMethod: "cash",
            });

            await cartAPI.clear();

            toast({
                title: "Order Placed Successfully!",
                description: "Your order has been confirmed. Pay on delivery.",
            });

            navigate("/shops");
        } catch (error: any) {
            toast({
                title: "Error",
                description: error.message || "Failed to place order",
                variant: "destructive",
            });
        } finally {
            setIsProcessing(false);
        }
    };

    const handleUPIPaymentComplete = async () => {
        try {
            setIsProcessing(true);

            await ordersAPI.create({
                ...orderData,
                paymentMethod: "upi",
            });

            await cartAPI.clear();

            toast({
                title: "Order Placed Successfully!",
                description: "Payment received. Your order is confirmed.",
            });

            navigate("/shops");
        } catch (error: any) {
            toast({
                title: "Error",
                description: error.message || "Failed to place order",
                variant: "destructive",
            });
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-yellow-100 via-amber-100/60 to-orange-100/50">
            <CustomerHeader />

            <main className="max-w-2xl mx-auto px-4 py-6">
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-foreground mb-2">Payment</h1>
                    <p className="text-muted-foreground">Choose your payment method</p>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Select Payment Method</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {/* Order Summary */}
                        <div className="bg-muted/50 rounded-lg p-4">
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-sm text-muted-foreground">Total Amount</span>
                                <span className="text-2xl font-bold text-foreground">
                                    ₹{orderData.totalAmount.toFixed(2)}
                                </span>
                            </div>
                            <div className="text-xs text-muted-foreground">
                                {orderData.items.length} item(s) • Free Delivery
                            </div>
                        </div>

                        {/* Payment Options */}
                        <RadioGroup value={paymentMethod} onValueChange={(value: any) => setPaymentMethod(value)}>
                            {/* Cash on Delivery */}
                            <div
                                className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${paymentMethod === "cash"
                                    ? "border-primary bg-primary/5"
                                    : "border-border hover:border-primary/50"
                                    }`}
                                onClick={() => setPaymentMethod("cash")}
                            >
                                <div className="flex items-center space-x-3">
                                    <RadioGroupItem value="cash" id="cash" />
                                    <Label htmlFor="cash" className="flex items-center gap-3 cursor-pointer flex-1">
                                        <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                                            <Banknote className="w-6 h-6 text-green-600" />
                                        </div>
                                        <div className="flex-1">
                                            <div className="font-semibold text-foreground">Pay on Delivery</div>
                                            <div className="text-sm text-muted-foreground">Cash on Delivery (COD)</div>
                                        </div>
                                        {paymentMethod === "cash" && (
                                            <CheckCircle className="w-5 h-5 text-primary" />
                                        )}
                                    </Label>
                                </div>
                            </div>

                            {/* UPI Payment */}
                            <div
                                className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${paymentMethod === "upi"
                                    ? "border-primary bg-primary/5"
                                    : "border-border hover:border-primary/50"
                                    }`}
                                onClick={() => setPaymentMethod("upi")}
                            >
                                <div className="flex items-center space-x-3">
                                    <RadioGroupItem value="upi" id="upi" />
                                    <Label htmlFor="upi" className="flex items-center gap-3 cursor-pointer flex-1">
                                        <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
                                            <Wallet className="w-6 h-6 text-purple-600" />
                                        </div>
                                        <div className="flex-1">
                                            <div className="font-semibold text-foreground flex items-center gap-2">
                                                UPI
                                                <img
                                                    src="https://upload.wikimedia.org/wikipedia/commons/e/e1/UPI-Logo-vector.svg"
                                                    alt="UPI"
                                                    className="h-5"
                                                />
                                            </div>
                                            <div className="text-sm text-muted-foreground">Pay using UPI apps</div>
                                        </div>
                                        {paymentMethod === "upi" && (
                                            <CheckCircle className="w-5 h-5 text-primary" />
                                        )}
                                    </Label>
                                </div>
                            </div>
                        </RadioGroup>

                        {/* UPI QR Code Display */}
                        {showQR && paymentMethod === "upi" && (
                            <div className="border-2 border-primary rounded-lg p-6 bg-primary/5 space-y-4">
                                <div className="flex items-center justify-between">
                                    <h3 className="font-semibold text-foreground flex items-center gap-2">
                                        <QrCode className="w-5 h-5" />
                                        Scan QR Code to Pay
                                    </h3>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => setShowQR(false)}
                                    >
                                        <X className="w-4 h-4" />
                                    </Button>
                                </div>

                                <div className="bg-white p-4 rounded-lg flex justify-center">
                                    <img
                                        src="/qr-code.png"
                                        alt="UPI QR Code"
                                        className="w-64 h-64 object-contain"
                                    />
                                </div>

                                <div className="text-center space-y-2">
                                    <p className="text-sm text-muted-foreground">
                                        Scan this QR code with any UPI app
                                    </p>
                                    <p className="text-lg font-bold text-foreground">
                                        ₹{orderData.totalAmount.toFixed(2)}
                                    </p>
                                </div>

                                <Button
                                    onClick={handleUPIPaymentComplete}
                                    disabled={isProcessing}
                                    className="w-full"
                                >
                                    {isProcessing ? "Processing..." : "I have paid"}
                                </Button>
                            </div>
                        )}

                        {/* Continue Button */}
                        {!showQR && (
                            <Button
                                onClick={handlePayment}
                                disabled={isProcessing}
                                className="w-full"
                                size="lg"
                            >
                                {isProcessing
                                    ? "Processing..."
                                    : paymentMethod === "cash"
                                        ? "Place Order"
                                        : "Show QR Code"}
                            </Button>
                        )}

                        <p className="text-xs text-center text-muted-foreground">
                            By placing this order, you agree to our terms and conditions
                        </p>
                    </CardContent>
                </Card>
            </main>
        </div>
    );
};

export default Payment;
