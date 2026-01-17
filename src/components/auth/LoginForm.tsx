import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UserRole } from "./RoleSelector";

export interface LoginData {
    identifier: string;
    password?: string;
}

interface LoginFormProps {
    role: UserRole;
    onSubmit: (data: LoginData) => void;
    onOTPLogin: (identifier: string) => void;
    isLoading: boolean;
}

export const LoginForm = ({ role, onSubmit, onOTPLogin, isLoading }: LoginFormProps) => {
    const [formData, setFormData] = useState<LoginData>({
        identifier: "",
        password: "",
    });
    const [useOTP, setUseOTP] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (useOTP) {
            onOTPLogin(formData.identifier);
        } else {
            onSubmit(formData);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="identifier">Mobile Number</Label>
                <Input
                    id="identifier"
                    type="tel"
                    placeholder="10-digit mobile number"
                    value={formData.identifier}
                    onChange={(e) =>
                        setFormData({ ...formData, identifier: e.target.value })
                    }
                    maxLength={10}
                    pattern="[0-9]{10}"
                    required
                />
            </div>

            {!useOTP && (
                <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                        id="password"
                        type="password"
                        placeholder="Enter your password"
                        value={formData.password}
                        onChange={(e) =>
                            setFormData({ ...formData, password: e.target.value })
                        }
                        required={!useOTP}
                    />
                </div>
            )}

            <div className="flex items-center justify-between text-sm">
                <button
                    type="button"
                    onClick={() => setUseOTP(!useOTP)}
                    className="text-primary hover:underline"
                >
                    {useOTP ? "Use Password" : "Use OTP Instead"}
                </button>
                {!useOTP && (
                    <a href="#" className="text-muted-foreground hover:text-foreground">
                        Forgot Password?
                    </a>
                )}
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Signing In..." : useOTP ? "Send OTP" : "Sign In"}
            </Button>
        </form>
    );
};
