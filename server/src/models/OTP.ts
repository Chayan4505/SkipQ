// MongoDB model - Not used (migrated to Supabase)
// Keeping interface for type definitions

export interface IOTP {
    mobile: string;
    otp: string;
    expiresAt: Date;
    createdAt: Date;
}

// Mongoose schema and model commented out - using Supabase instead
/*
import mongoose, { Document, Schema } from 'mongoose';

const otpSchema = new Schema<IOTP>(
    {
        mobile: {
            type: String,
            required: true,
            trim: true,
            match: /^[0-9]{10}$/,
        },
        otp: {
            type: String,
            required: true,
        },
        expiresAt: {
            type: Date,
            required: true,
            default: () => new Date(Date.now() + 10 * 60 * 1000), // 10 minutes from now
        },
    },
    {
        timestamps: true,
    }
);

otpSchema.index({ mobile: 1 });
otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const OTP = mongoose.model<IOTP>('OTP', otpSchema);
*/
