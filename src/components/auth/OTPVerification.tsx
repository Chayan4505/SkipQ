import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";

interface OTPVerificationProps {
    mobile: string;
    onVerify: (otp: string) => void;
    onResend: () => void;
    isLoading: boolean;
}

export const OTPVerification = ({
    mobile,
    onVerify,
    onResend,
    isLoading,
}: OTPVerificationProps) => {
    const [otp, setOtp] = useState(["", "", "", "", "", ""]);
    const [timer, setTimer] = useState(60);
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

    useEffect(() => {
        if (timer > 0) {
            const interval = setInterval(() => {
                setTimer((prev) => prev - 1);
            }, 1000);
            return () => clearInterval(interval);
        }
    }, [timer]);

    const handleChange = (index: number, value: string) => {
        if (value.length > 1) return;
        if (!/^\d*$/.test(value)) return;

        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);

        // Auto-focus next input
        if (value && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }

        // Auto-submit when all fields are filled
        if (newOtp.every((digit) => digit !== "") && index === 5) {
            onVerify(newOtp.join(""));
        }
    };

    const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
        if (e.key === "Backspace" && !otp[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    const handlePaste = (e: React.ClipboardEvent) => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData("text").slice(0, 6);
        if (!/^\d+$/.test(pastedData)) return;

        const newOtp = pastedData.split("").concat(Array(6).fill("")).slice(0, 6);
        setOtp(newOtp);

        if (pastedData.length === 6) {
            onVerify(pastedData);
        }
    };

    const handleResend = () => {
        setTimer(60);
        setOtp(["", "", "", "", "", ""]);
        onResend();
    };

    return (
        <div className="space-y-6">
            <div className="text-center space-y-2">
                <h3 className="text-lg font-semibold">Verify Mobile Number</h3>
                <p className="text-sm text-muted-foreground">
                    Enter the 6-digit code sent to{" "}
                    <span className="font-medium text-foreground">+91 {mobile}</span>
                </p>
            </div>

            <div className="flex gap-2 justify-center" onPaste={handlePaste}>
                {otp.map((digit, index) => (
                    <input
                        key={index}
                        ref={(el) => (inputRefs.current[index] = el)}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleChange(index, e.target.value)}
                        onKeyDown={(e) => handleKeyDown(index, e)}
                        className="w-12 h-12 text-center text-lg font-semibold border-2 border-border rounded-md focus:border-primary focus:outline-none transition-colors"
                        autoFocus={index === 0}
                    />
                ))}
            </div>

            <Button
                onClick={() => onVerify(otp.join(""))}
                className="w-full"
                disabled={otp.some((digit) => !digit) || isLoading}
            >
                {isLoading ? "Verifying..." : "Verify OTP"}
            </Button>

            <div className="text-center text-sm">
                {timer > 0 ? (
                    <p className="text-muted-foreground">
                        Resend OTP in <span className="font-medium">{timer}s</span>
                    </p>
                ) : (
                    <button
                        type="button"
                        onClick={handleResend}
                        className="text-primary hover:underline font-medium"
                        disabled={isLoading}
                    >
                        Resend OTP
                    </button>
                )}
            </div>
        </div>
    );
};
