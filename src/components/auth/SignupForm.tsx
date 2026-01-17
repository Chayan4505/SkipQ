import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UserRole } from "./RoleSelector";

export interface SignupData {
    mobile: string;
    password?: string;
    fullName: string;
    email?: string;
}

interface SignupFormProps {
    role: UserRole;
    onSubmit: (data: SignupData) => void;
    isLoading: boolean;
}

export const SignupForm = ({ role, onSubmit, isLoading }: SignupFormProps) => {
    const [formData, setFormData] = useState<SignupData>({
        mobile: "",
        password: "",
        fullName: "",
        email: "",
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(formData);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                    id="fullName"
                    type="text"
                    placeholder="Enter your full name"
                    value={formData.fullName}
                    onChange={(e) =>
                        setFormData({ ...formData, fullName: e.target.value })
                    }
                    required
                />
            </div>

            <div className="space-y-2">
                <Label htmlFor="mobile">Mobile Number</Label>
                <Input
                    id="mobile"
                    type="tel"
                    placeholder="10-digit mobile number"
                    value={formData.mobile}
                    onChange={(e) =>
                        setFormData({ ...formData, mobile: e.target.value })
                    }
                    maxLength={10}
                    pattern="[0-9]{10}"
                    required
                />
            </div>

            {role === "shopowner" && (
                <div className="space-y-2">
                    <Label htmlFor="email">Email (Optional)</Label>
                    <Input
                        id="email"
                        type="email"
                        placeholder="your@email.com"
                        value={formData.email}
                        onChange={(e) =>
                            setFormData({ ...formData, email: e.target.value })
                        }
                    />
                </div>
            )}

            <div className="space-y-2">
                <Label htmlFor="password">Password (Optional)</Label>
                <Input
                    id="password"
                    type="password"
                    placeholder="Leave empty to use OTP"
                    value={formData.password}
                    onChange={(e) =>
                        setFormData({ ...formData, password: e.target.value })
                    }
                />
                <p className="text-xs text-muted-foreground">
                    Leave blank to sign up with OTP verification
                </p>
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Creating Account..." : "Sign Up"}
            </Button>
        </form>
    );
};
