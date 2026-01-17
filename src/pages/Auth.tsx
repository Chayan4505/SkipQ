import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { RoleSelector, UserRole } from "@/components/auth/RoleSelector";
import { SignupForm, SignupData } from "@/components/auth/SignupForm";
import { LoginForm, LoginData } from "@/components/auth/LoginForm";
import { OTPVerification } from "@/components/auth/OTPVerification";
import { LocationModal } from "@/components/auth/LocationModal";
import { ShoppingBag, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { authAPI, usersAPI } from "@/lib/api";
import { supabaseAuth } from "@/lib/supabaseAuth";
import { BRAND_CONFIG } from "@/config/branding";

type AuthStep = "auth" | "otp" | "location";
type AuthMode = "login" | "signup";

const Auth = () => {
  const [role, setRole] = useState<UserRole>("buyer");
  const [mode, setMode] = useState<AuthMode>("signup");
  const [step, setStep] = useState<AuthStep>("auth");
  const [isLoading, setIsLoading] = useState(false);
  const [mobile, setMobile] = useState("");
  const [signupName, setSignupName] = useState("");
  const [showLocationModal, setShowLocationModal] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const roleContent = {
    buyer: {
      title: mode === "signup" ? `Join ${BRAND_CONFIG.APP_NAME}` : "Welcome Back",
      subtitle: mode === "signup"
        ? "Order from nearby kirana stores"
        : "Skip queues and save time",
      description: "Get groceries delivered to your doorstep in minutes",
    },
    shopowner: {
      title: mode === "signup" ? "Register Your Shop" : "Welcome Back",
      subtitle: mode === "signup"
        ? "Manage orders digitally"
        : "Grow your kirana business",
      description: "Reduce queues at your store and reach more customers",
    },
  };

  const handleSignup = async (data: SignupData) => {
    try {
      setIsLoading(true);
      setMobile(data.mobile);
      setSignupName(data.fullName);

      // For both buyers and shop owners: allow signup with password OR OTP
      if (data.password && data.password.length > 0) {
        // Signup with password
        const response = await authAPI.signup(
          data.mobile,
          data.password,
          data.fullName,
          data.email,
          role
        );

        // Store token and user data
        localStorage.setItem('token', response.token);
        localStorage.setItem('user', JSON.stringify(response.user));

        setIsLoading(false);
        setShowLocationModal(true);

        toast({
          title: "Signup Successful!",
          description: `Welcome to ${BRAND_CONFIG.APP_NAME}, ${response.user.name || response.user.mobile}!`,
        });
      } else {
        // Signup with OTP (for buyers and shop owners who don't want to set password)
        localStorage.setItem('signupName', data.fullName); // Store for OTP verification
        localStorage.setItem('signupEmail', data.email || ''); // Store email for shop owners
        localStorage.setItem('signupRole', role); // Store role for OTP verification

        // Use Supabase Phone OTP
        await supabaseAuth.sendOTP(data.mobile);

        setIsLoading(false);
        setStep("otp");

        toast({
          title: "OTP Sent!",
          description: "Please check your mobile for the verification code.",
        });
      }
    } catch (error: any) {
      setIsLoading(false);
      toast({
        title: "Error",
        description: error.message || "Failed to sign up",
        variant: "destructive",
      });
    }
  };

  const handleLogin = async (data: LoginData) => {
    try {
      setIsLoading(true);

      // Extract mobile from identifier (remove non-digits)
      const mobile = data.identifier.replace(/\D/g, '');

      if (!mobile || mobile.length !== 10) {
        throw new Error('Please enter a valid 10-digit mobile number');
      }

      // For both buyers and shop owners: if no password provided, use OTP flow
      if (!data.password) {
        // Use Supabase Phone OTP
        await supabaseAuth.sendOTP(mobile);
        setIsLoading(false);
        setMobile(mobile);
        setStep("otp");

        toast({
          title: "OTP Sent!",
          description: "Please check your mobile for the verification code.",
        });
        return;
      }

      // Password login (for buyers and shop owners with password)

      const response = await authAPI.login(mobile, data.password);

      // Store token
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));

      setIsLoading(false);
      setShowLocationModal(true);

      toast({
        title: "Login Successful!",
        description: `Welcome back, ${response.user.name || response.user.mobile}!`,
      });
    } catch (error: any) {
      setIsLoading(false);
      toast({
        title: "Error",
        description: error.message || "Failed to login",
        variant: "destructive",
      });
    }
  };

  const handleOTPLogin = async (identifier: string) => {
    try {
      setIsLoading(true);

      // Extract mobile from identifier (remove non-digits)
      const mobile = identifier.replace(/\D/g, '');

      if (!mobile || mobile.length !== 10) {
        throw new Error('Please enter a valid 10-digit mobile number');
      }

      // Use Supabase Phone OTP
      await supabaseAuth.sendOTP(mobile);
      setIsLoading(false);
      setMobile(mobile);
      setStep("otp");

      toast({
        title: "OTP Sent!",
        description: "Please check your mobile for the verification code.",
      });
    } catch (error: any) {
      setIsLoading(false);
      toast({
        title: "Error",
        description: error.message || "Failed to send OTP",
        variant: "destructive",
      });
    }
  };

  const handleVerifyOTP = async (otp: string) => {
    try {
      setIsLoading(true);

      // Verify OTP with Supabase
      const supabaseResponse = await supabaseAuth.verifyOTP(mobile, otp);

      if (!supabaseResponse.success || !supabaseResponse.user) {
        throw new Error('Invalid OTP');
      }

      // Get stored signup data
      const storedName = signupName || localStorage.getItem('signupName') || '';
      const storedEmail = localStorage.getItem('signupEmail') || '';
      const storedRole = (localStorage.getItem('signupRole') || role) as UserRole;

      // Supabase verified successfully, now create/login user in backend
      // Use a consistent password based on phone number for OTP auth
      const phonePassword = `phone_${mobile}`;

      let response;
      try {
        // Try to login first (user might already exist)
        response = await authAPI.login(mobile, phonePassword);
      } catch (loginError) {
        // If login fails, create new user
        response = await authAPI.signup(
          mobile,
          phonePassword,
          storedName || `User ${mobile}`,
          storedEmail,
          storedRole
        );
      }

      // Store token and user data
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));

      // Clean up stored signup data
      localStorage.removeItem('signupName');
      localStorage.removeItem('signupEmail');
      localStorage.removeItem('signupRole');

      // If it's a shop owner signup and we have email, update the user profile
      if (storedRole === 'shopowner' && storedEmail && response.user) {
        try {
          await usersAPI.updateProfile({ email: storedEmail });
        } catch (err) {
          console.error('Failed to update email:', err);
        }
      }

      setIsLoading(false);
      setShowLocationModal(true);

      toast({
        title: "Verification Successful!",
        description: `Welcome to ${BRAND_CONFIG.APP_NAME}, ${response.user.name || response.user.mobile}!`,
      });
    } catch (error: any) {
      setIsLoading(false);
      toast({
        title: "Verification Failed",
        description: error.message || "Invalid OTP. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleResendOTP = async () => {
    try {
      setIsLoading(true);

      // Use Supabase Phone OTP
      await supabaseAuth.sendOTP(mobile);
      setIsLoading(false);

      toast({
        title: "OTP Resent",
        description: "A new verification code has been sent to your mobile.",
      });
    } catch (error: any) {
      setIsLoading(false);
      toast({
        title: "Error",
        description: error.message || "Failed to resend OTP",
        variant: "destructive",
      });
    }
  };

  const handleEnableLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          toast({
            title: "Location Enabled",
            description: "We'll now show you nearby kirana stores!",
          });
          setShowLocationModal(false);
          navigate(role === "buyer" ? "/shops" : "/dashboard");
        },
        (error) => {
          toast({
            title: "Location Error",
            description: "Unable to get your location. You can enable it later from settings.",
            variant: "destructive",
          });
        }
      );
    }
  };

  const handleSkipLocation = () => {
    setShowLocationModal(false);
    navigate(role === "buyer" ? "/shops" : "/dashboard");
  };

  const content = roleContent[role];

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-yellow-100 via-amber-100/60 to-orange-100/50">
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-primary relative">
        <div className="relative z-10 flex flex-col justify-center p-12 lg:p-20">
          <div className="flex items-center gap-3 mb-8">
            <img src="/logo-icon.png" alt={BRAND_CONFIG.APP_NAME} className="w-16 h-16 object-contain" />
            <span className="text-2xl font-semibold text-primary-foreground">{BRAND_CONFIG.APP_NAME}</span>
          </div>

          <h1 className="text-3xl lg:text-4xl font-bold text-primary-foreground leading-tight mb-4">
            {role === "buyer"
              ? "Your Neighborhood Kirana, Now Online"
              : "Digitize Your Kirana Store"}
          </h1>

          <p className="text-primary-foreground/80 max-w-md">
            {role === "buyer"
              ? "Order groceries from trusted local shops. Fresh products, fair prices, delivered fast."
              : "Accept orders online, manage inventory, and grow your customer base effortlessly."}
          </p>

          <div className="mt-12 grid grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary-foreground">10K+</div>
              <div className="text-sm text-primary-foreground/70">
                {role === "buyer" ? "Products" : "Shop Owners"}
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary-foreground">500+</div>
              <div className="text-sm text-primary-foreground/70">
                {role === "buyer" ? "Stores" : "Cities"}
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary-foreground">4.8★</div>
              <div className="text-sm text-primary-foreground/70">Rating</div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Auth Forms */}
      <div className="w-full lg:w-1/2 flex flex-col">
        {/* Mobile Header */}
        <div className="lg:hidden p-4 flex items-center gap-3">
          <img src="/logo-icon.png" alt={BRAND_CONFIG.APP_NAME} className="w-12 h-12 object-contain" />
          <span className="text-lg font-semibold text-foreground">{BRAND_CONFIG.APP_NAME}</span>
        </div>

        <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
          <div className="w-full max-w-md space-y-6">
            {step === "otp" && (
              <button
                onClick={() => setStep("auth")}
                className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </button>
            )}

            {step === "auth" && (
              <>
                <div className="text-center lg:text-left space-y-1">
                  <h2 className="text-xl font-semibold text-foreground">{content.title}</h2>
                  <p className="text-muted-foreground text-sm">{content.subtitle}</p>
                </div>

                <RoleSelector value={role} onChange={setRole} />

                <div className="bg-card rounded-lg border border-border p-6 space-y-6">
                  <div className="flex rounded-md bg-secondary p-1 gap-1">
                    <button
                      onClick={() => setMode("signup")}
                      className={`flex-1 py-2 px-4 rounded text-sm font-medium transition-colors ${mode === "signup"
                        ? "bg-card text-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                        }`}
                    >
                      Sign Up
                    </button>
                    <button
                      onClick={() => setMode("login")}
                      className={`flex-1 py-2 px-4 rounded text-sm font-medium transition-colors ${mode === "login"
                        ? "bg-card text-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                        }`}
                    >
                      Sign In
                    </button>
                  </div>

                  {mode === "signup" ? (
                    <SignupForm role={role} onSubmit={handleSignup} isLoading={isLoading} />
                  ) : (
                    <LoginForm role={role} onSubmit={handleLogin} onOTPLogin={handleOTPLogin} isLoading={isLoading} />
                  )}
                </div>

                <p className="text-xs text-center text-muted-foreground">
                  By continuing, you agree to our{" "}
                  <a href="#" className="text-foreground hover:underline">Terms of Service</a>
                  {" "}and{" "}
                  <a href="#" className="text-foreground hover:underline">Privacy Policy</a>
                </p>
              </>
            )}

            {step === "otp" && (
              <div className="bg-card rounded-lg border border-border p-6">
                <OTPVerification
                  mobile={mobile}
                  onVerify={handleVerifyOTP}
                  onResend={handleResendOTP}
                  isLoading={isLoading}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      <LocationModal
        isOpen={showLocationModal}
        onClose={() => setShowLocationModal(false)}
        onEnableLocation={handleEnableLocation}
        onSkip={handleSkipLocation}
      />
    </div>
  );
};

export default Auth;
