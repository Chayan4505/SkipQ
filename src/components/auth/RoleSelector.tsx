import { User, Store } from "lucide-react";

export type UserRole = "buyer" | "shopowner";

interface RoleSelectorProps {
    value: UserRole;
    onChange: (role: UserRole) => void;
}

export const RoleSelector = ({ value, onChange }: RoleSelectorProps) => {
    return (
        <div className="grid grid-cols-2 gap-3">
            <button
                type="button"
                onClick={() => onChange("buyer")}
                className={`p-4 rounded-lg border-2 transition-all ${value === "buyer"
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50"
                    }`}
            >
                <div className="flex flex-col items-center gap-2">
                    <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center ${value === "buyer"
                                ? "bg-primary text-primary-foreground"
                                : "bg-secondary text-muted-foreground"
                            }`}
                    >
                        <User className="w-5 h-5" />
                    </div>
                    <span
                        className={`text-sm font-medium ${value === "buyer" ? "text-foreground" : "text-muted-foreground"
                            }`}
                    >
                        I'm a Buyer
                    </span>
                </div>
            </button>

            <button
                type="button"
                onClick={() => onChange("shopowner")}
                className={`p-4 rounded-lg border-2 transition-all ${value === "shopowner"
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50"
                    }`}
            >
                <div className="flex flex-col items-center gap-2">
                    <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center ${value === "shopowner"
                                ? "bg-primary text-primary-foreground"
                                : "bg-secondary text-muted-foreground"
                            }`}
                    >
                        <Store className="w-5 h-5" />
                    </div>
                    <span
                        className={`text-sm font-medium ${value === "shopowner" ? "text-foreground" : "text-muted-foreground"
                            }`}
                    >
                        I'm a Shop Owner
                    </span>
                </div>
            </button>
        </div>
    );
};
