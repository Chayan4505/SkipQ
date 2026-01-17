import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  ShoppingBag,
  MapPin,
  Clock,
  Store,
  ArrowRight,
  Package,
  Truck,
  Shield,
  Bell
} from "lucide-react";
import { useState, useEffect } from "react";
import { BRAND_CONFIG } from "@/config/branding";

const Index = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('token');
    setIsLoggedIn(!!token);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-yellow-100 via-amber-100/60 to-orange-100/50">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-orange-500/90 backdrop-blur-sm border-b border-orange-400 shadow-sm">
        <div className="container mx-auto px-4 h-14 flex items-center justify-between">
          <Link to="/" className="flex items-center">
            <img src="/logo-full.png" alt={BRAND_CONFIG.APP_NAME} className="h-12 w-auto object-contain" />
          </Link>

          <div className="flex items-center gap-2">
            {isLoggedIn ? (
              <Link to="/shops">
                <Button size="sm" className="bg-green-500 text-white hover:bg-green-600 border border-green-400">Explore Shops</Button>
              </Link>
            ) : (
              <>
                <Link to="/auth">
                  <Button size="sm" className="bg-blue-500 text-white hover:bg-blue-600 border border-blue-400">Sign In</Button>
                </Link>
                <Link to="/auth">
                  <Button size="sm" className="bg-green-500 text-white hover:bg-green-600 border border-green-400">Get Started</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-16 lg:py-24 bg-gradient-to-b from-yellow-100/50 via-amber-100/40 to-white">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-yellow-100 border border-yellow-200">
              <span className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse"></span>
              <p className="text-sm text-yellow-700 font-medium">
                Trusted by 10,000+ customers
              </p>
            </div>

            <h1 className="text-4xl md:text-5xl font-semibold leading-tight text-foreground">
              Your Neighborhood Kirana Store is Now Online
            </h1>

            <p className="text-base text-muted-foreground max-w-xl mx-auto">
              Skip the queues, order fresh groceries from trusted local shops.
              Get everything delivered to your doorstep in minutes.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <Link to={isLoggedIn ? "/shops" : "/auth"}>
                <Button size="lg" className="shadow-md hover:shadow-lg">
                  Start Shopping
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
              {!isLoggedIn && (
                <Link to="/auth">
                  <Button variant="outline" size="lg" className="border-2 border-primary hover:bg-primary hover:text-white">
                    <Store className="w-4 h-4 mr-2" />
                    Register Your Shop
                  </Button>
                </Link>
              )}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-6 pt-16 max-w-md mx-auto">
              <div className="text-center p-4 rounded-lg bg-blue-50 border border-blue-100">
                <div className="text-2xl font-semibold text-blue-600">500+</div>
                <div className="text-sm text-blue-600/70 mt-1 font-medium">Stores</div>
              </div>
              <div className="text-center p-4 rounded-lg bg-green-50 border border-green-100">
                <div className="text-2xl font-semibold text-green-600">10K+</div>
                <div className="text-sm text-green-600/70 mt-1 font-medium">Products</div>
              </div>
              <div className="text-center p-4 rounded-lg bg-orange-50 border border-orange-100">
                <div className="text-2xl font-semibold text-orange-600">Lightning</div>
                <div className="text-sm text-orange-600/70 mt-1 font-medium">Fast Ready</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-16 bg-gradient-to-b from-yellow-100/50 to-amber-100/50">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-2xl md:text-3xl font-semibold text-foreground mb-2">
              Why Choose {BRAND_CONFIG.APP_NAME}?
            </h2>
            <p className="text-muted-foreground">
              Experience the convenience of online shopping with the trust of your local kirana
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              {
                icon: MapPin,
                title: "Nearby Stores",
                description: "Find and order from kirana stores in your neighborhood",
                color: "bg-blue-100 text-blue-600",
              },
              {
                icon: Clock,
                title: BRAND_CONFIG.APP_NAME,
                description: "No need to stand in Queue",
                color: "bg-green-100 text-green-600",
              },
              {
                icon: Package,
                title: "Fresh Products",
                description: "Quality groceries sourced directly from trusted shops",
                color: "bg-orange-100 text-orange-600",
              },
              {
                icon: Shield,
                title: "Secure Payments",
                description: "Pay securely with UPI, cards, or cash on delivery",
                color: "bg-purple-100 text-purple-600",
              },
            ].map((feature, index) => (
              <div
                key={index}
                className="bg-card rounded-lg p-5 border border-border hover:shadow-md transition-shadow"
              >
                <div className={`w-10 h-10 rounded-lg ${feature.color} flex items-center justify-center mb-3`}>
                  <feature.icon className="w-5 h-5" />
                </div>
                <h3 className="text-base font-semibold text-foreground mb-1">{feature.title}</h3>
                <p className="text-muted-foreground text-sm">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section id="how-it-works" className="py-16 bg-gradient-to-b from-white to-yellow-100/40">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-2xl md:text-3xl font-semibold text-foreground mb-2">
              How It Works
            </h2>
            <p className="text-muted-foreground">
              Order your groceries in just 3 simple steps
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-3xl mx-auto">
            {[
              {
                step: "01",
                title: "Find Nearby Stores",
                description: "Enable location to discover kirana stores near you",
                icon: MapPin,
                color: "bg-blue-500",
              },
              {
                step: "02",
                title: "Add to Cart",
                description: "Browse products and add your favorites to cart",
                icon: ShoppingBag,
                color: "bg-green-500",
              },
              {
                step: "03",
                title: "Get Notified",
                description: "Come, Pay and take your order whenever you want",
                icon: Bell,
                color: "bg-orange-500",
              },
            ].map((item, index) => (
              <div key={index} className="text-center">
                <div className={`w-12 h-12 rounded-lg ${item.color} flex items-center justify-center mx-auto mb-3 shadow-sm`}>
                  <item.icon className="w-6 h-6 text-white" />
                </div>
                <div className="text-xs font-medium text-muted-foreground mb-1">{item.step}</div>
                <h3 className="text-lg font-semibold text-foreground mb-2">{item.title}</h3>
                <p className="text-muted-foreground text-sm">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* For Shop Owners */}
      <section id="for-shops" className="py-16 bg-gradient-to-b from-orange-100/50 to-yellow-100/40">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="space-y-4">
                <p className="text-sm font-medium text-muted-foreground">
                  For Shop Owners
                </p>

                <h2 className="text-2xl md:text-3xl font-semibold text-foreground">
                  Grow Your Kirana Business Digitally
                </h2>

                <p className="text-muted-foreground">
                  Join {BRAND_CONFIG.APP_NAME} to reach more customers, manage orders efficiently,
                  and reduce queues at your store.
                </p>

                <ul className="space-y-2.5">
                  {[
                    "Accept orders online 24/7",
                    "Manage inventory digitally",
                    "Reduce waiting queues at your store",
                    "Reach customers in your area",
                    "Easy payment collection",
                  ].map((item, index) => (
                    <li key={index} className="flex items-center gap-2.5">
                      <div className="w-4 h-4 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                        <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <span className="text-foreground text-sm">{item}</span>
                    </li>
                  ))}
                </ul>

                <Link to="/auth">
                  <Button size="lg" className="mt-4">
                    Register Your Shop
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
              </div>

              <div className="bg-card rounded-lg p-6 border border-border">
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-secondary rounded-md p-4 text-center">
                    <div className="text-xl font-semibold text-foreground">30%</div>
                    <div className="text-xs text-muted-foreground mt-1">More Orders</div>
                  </div>
                  <div className="bg-secondary rounded-md p-4 text-center">
                    <div className="text-xl font-semibold text-foreground">50%</div>
                    <div className="text-xs text-muted-foreground mt-1">Less Queues</div>
                  </div>
                  <div className="bg-secondary rounded-md p-4 text-center">
                    <div className="text-xl font-semibold text-foreground">2X</div>
                    <div className="text-xs text-muted-foreground mt-1">Customer Reach</div>
                  </div>
                  <div className="bg-secondary rounded-md p-4 text-center">
                    <div className="text-xl font-semibold text-foreground">Free</div>
                    <div className="text-xs text-muted-foreground mt-1">To Join</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center bg-primary rounded-lg p-8">
            <h2 className="text-2xl md:text-3xl font-semibold text-white mb-2">
              Ready to Skip the Queue?
            </h2>
            <p className="text-white/90 mb-6 max-w-lg mx-auto">
              Join thousands of happy customers who order their daily essentials
              from trusted local kirana stores.
            </p>
            <Link to="/auth">
              <Button variant="outline" size="lg" className="bg-white text-primary border-white hover:bg-white/90">
                Get Started Now
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gradient-to-b from-blue-50 to-blue-100 py-12 border-t border-blue-200">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <img src="/logo-icon.png" alt={BRAND_CONFIG.APP_NAME} className="w-12 h-12 object-contain" />
                <span className="text-lg font-semibold text-foreground">{BRAND_CONFIG.APP_NAME}</span>
              </div>
              <p className="text-muted-foreground text-sm">
                Your trusted partner for quick and convenient grocery shopping.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-3">Company</h4>
              <ul className="space-y-2">
                {["About Us", "Careers", "Blog", "Press"].map((item) => (
                  <li key={item}>
                    <a href="#" className="text-muted-foreground hover:text-foreground text-sm transition-colors">
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-3">Support</h4>
              <ul className="space-y-2">
                {["Help Center", "Contact Us", "FAQs", "Delivery Info"].map((item) => (
                  <li key={item}>
                    <a href="#" className="text-muted-foreground hover:text-foreground text-sm transition-colors">
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-3">Legal</h4>
              <ul className="space-y-2">
                {["Privacy Policy", "Terms of Service", "Refund Policy"].map((item) => (
                  <li key={item}>
                    <a href="#" className="text-muted-foreground hover:text-foreground text-sm transition-colors">
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="border-t border-border mt-8 pt-6 text-center">
            <p className="text-muted-foreground text-sm">
              © {BRAND_CONFIG.COPYRIGHT_YEAR} {BRAND_CONFIG.COMPANY_NAME}. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;