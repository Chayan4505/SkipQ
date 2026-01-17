// MongoDB model - Not used (migrated to Supabase)
// Keeping interface for type definitions

export interface IUser {
    mobile: string;
    password?: string;
    name?: string;
    email?: string;
    role: 'buyer' | 'shopowner';
    isVerified: boolean;
    createdAt: Date;
    updatedAt: Date;
}

// Mongoose schema and model commented out - using Supabase instead
/*
import mongoose, { Document, Schema } from 'mongoose';

const userSchema = new Schema<IUser>(
    {
        mobile: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            match: /^[0-9]{10}$/,
        },
        password: {
            type: String,
            select: false,
        },
        name: {
            type: String,
            trim: true,
        },
        email: {
            type: String,
            trim: true,
            lowercase: true,
        },
        role: {
            type: String,
            enum: ['buyer', 'shopowner'],
            required: true,
            default: 'buyer',
        },
        isVerified: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: true,
    }
);

userSchema.index({ mobile: 1 });
userSchema.index({ email: 1 });

export const User = mongoose.model<IUser>('User', userSchema);
*/
