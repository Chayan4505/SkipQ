import { MapPin, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BRAND_CONFIG } from "@/config/branding";

interface LocationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onEnableLocation: () => void;
    onSkip: () => void;
}

export const LocationModal = ({
    isOpen,
    onClose,
    onEnableLocation,
    onSkip,
}: LocationModalProps) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-card border border-border rounded-lg shadow-lg max-w-md w-full mx-4 p-6 space-y-6">
                <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                            <MapPin className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold">Enable Location</h3>
                            <p className="text-sm text-muted-foreground">
                                Find nearby stores
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-muted-foreground hover:text-foreground transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <p className="text-sm text-muted-foreground">
                    Allow {BRAND_CONFIG.APP_NAME} to access your location to show you kirana stores near
                    you. We'll only use your location to provide better service.
                </p>

                <div className="flex flex-col gap-3">
                    <Button onClick={onEnableLocation} className="w-full">
                        Enable Location
                    </Button>
                    <Button onClick={onSkip} variant="outline" className="w-full">
                        Skip for Now
                    </Button>
                </div>

                <p className="text-xs text-center text-muted-foreground">
                    You can change this setting anytime from your account settings
                </p>
            </div>
        </div>
    );
};
