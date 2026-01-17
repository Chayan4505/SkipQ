import { supabase } from './supabase';

export const supabaseAuth = {
    // Send OTP to phone number
    sendOTP: async (phoneNumber: string) => {
        try {
            // Format phone number with + for international format
            // Twilio/Supabase needs: +916295222726
            const formattedPhone = phoneNumber.startsWith('+')
                ? phoneNumber // Already has +
                : phoneNumber.startsWith('91')
                    ? `+${phoneNumber}` // Add + to country code
                    : `+91${phoneNumber}`; // Add +91

            console.log('Sending OTP to:', formattedPhone);

            const { data, error } = await supabase.auth.signInWithOtp({
                phone: formattedPhone,
            });

            console.log('Supabase send OTP response:', { data, error });

            if (error) throw error;

            return {
                success: true,
                message: 'OTP sent successfully',
                session: data.session,
            };
        } catch (error: any) {
            console.error('Send OTP Error:', error);
            throw new Error(error.message || 'Failed to send OTP');
        }
    },

    // Verify OTP
    verifyOTP: async (phoneNumber: string, otp: string) => {
        try {
            // Format phone number (same as sendOTP)
            const formattedPhone = phoneNumber.startsWith('+')
                ? phoneNumber // Already has +
                : phoneNumber.startsWith('91')
                    ? `+${phoneNumber}` // Add + to country code
                    : `+91${phoneNumber}`; // Add +91

            console.log('Verifying OTP:', { formattedPhone, otp });

            const { data, error } = await supabase.auth.verifyOtp({
                phone: formattedPhone,
                token: otp,
                type: 'sms',
            });

            console.log('Supabase verify response:', { data, error });

            if (error) throw error;

            return {
                success: true,
                session: data.session,
                user: data.user,
            };
        } catch (error: any) {
            console.error('OTP Verification Error:', error);
            throw new Error(error.message || 'Invalid OTP');
        }
    },

    // Get current session
    getSession: async () => {
        try {
            const { data, error } = await supabase.auth.getSession();
            if (error) throw error;
            return data.session;
        } catch (error: any) {
            return null;
        }
    },

    // Sign out
    signOut: async () => {
        try {
            const { error } = await supabase.auth.signOut();
            if (error) throw error;
            return { success: true };
        } catch (error: any) {
            throw new Error(error.message || 'Failed to sign out');
        }
    },
};
