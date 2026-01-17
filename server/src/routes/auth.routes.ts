import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { supabase } from '../config/supabase';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Helper function to generate OTP
function generateOTP(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

// Helper function to generate JWT token
function generateToken(userId: string): string {
    return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '30d' });
}

// POST /api/auth/send-otp - Send OTP to mobile
router.post('/send-otp', async (req, res) => {
    try {
        const { mobile, role } = req.body;

        if (!mobile || !/^[0-9]{10}$/.test(mobile)) {
            return res.status(400).json({
                success: false,
                message: 'Please provide a valid 10-digit mobile number',
            });
        }

        // Generate OTP
        const otpCode = generateOTP();

        // Delete any existing OTPs for this mobile
        await supabase
            .from('otps')
            .delete()
            .eq('mobile', mobile);

        // Save new OTP
        const { error } = await supabase
            .from('otps')
            .insert({
                mobile,
                otp: otpCode,
            });

        if (error) throw error;

        // In development, return OTP in response
        // In production, send via SMS service
        console.log(`OTP for ${mobile}: ${otpCode}`);

        res.json({
            success: true,
            message: 'OTP sent successfully',
            otp: process.env.NODE_ENV === 'development' ? otpCode : undefined,
        });
    } catch (error: any) {
        console.error('Send OTP error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to send OTP',
        });
    }
});

// POST /api/auth/verify-otp - Verify OTP and create/login user
router.post('/verify-otp', async (req, res) => {
    try {
        const { mobile, otp, name } = req.body;

        if (!mobile || !/^[0-9]{10}$/.test(mobile)) {
            return res.status(400).json({
                success: false,
                message: 'Please provide a valid 10-digit mobile number',
            });
        }

        if (!otp || otp.length !== 6) {
            return res.status(400).json({
                success: false,
                message: 'Please provide a valid 6-digit OTP',
            });
        }

        // Find OTP
        const { data: otpRecords, error: otpError } = await supabase
            .from('otps')
            .select('*')
            .eq('mobile', mobile)
            .eq('otp', otp)
            .gt('expires_at', new Date().toISOString())
            .limit(1);

        if (otpError) throw otpError;

        if (!otpRecords || otpRecords.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Invalid or expired OTP',
            });
        }

        const otpRecord = otpRecords[0];

        // Delete used OTP
        await supabase
            .from('otps')
            .delete()
            .eq('id', otpRecord.id);

        // Find or create user
        const { data: existingUsers } = await supabase
            .from('users')
            .select('*')
            .eq('mobile', mobile)
            .limit(1);

        let user;

        if (!existingUsers || existingUsers.length === 0) {
            // Create new user
            const { data: newUser, error: createError } = await supabase
                .from('users')
                .insert({
                    mobile,
                    name: name || null,
                    role: req.body.role || 'buyer',
                    is_verified: true,
                })
                .select()
                .single();

            if (createError) throw createError;
            user = newUser;
        } else {
            user = existingUsers[0];

            // Update verification status
            const updateData: any = { is_verified: true };
            if (name && !user.name) {
                updateData.name = name;
            }

            const { data: updatedUser, error: updateError } = await supabase
                .from('users')
                .update(updateData)
                .eq('id', user.id)
                .select()
                .single();

            if (updateError) throw updateError;
            user = updatedUser;
        }

        // Generate token
        const token = generateToken(user.id);

        res.json({
            success: true,
            message: 'OTP verified successfully',
            token,
            user: {
                id: user.id,
                mobile: user.mobile,
                name: user.name,
                email: user.email,
                role: user.role,
                isVerified: user.is_verified,
            },
        });
    } catch (error: any) {
        console.error('Verify OTP error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to verify OTP',
        });
    }
});

// POST /api/auth/signup - Register a new user with password
router.post('/signup', async (req, res) => {
    try {
        const { mobile, password, name, email, role } = req.body;

        if (!mobile || !/^[0-9]{10}$/.test(mobile)) {
            return res.status(400).json({
                success: false,
                message: 'Please provide a valid 10-digit mobile number',
            });
        }

        if (!password || password.length < 6) {
            return res.status(400).json({
                success: false,
                message: 'Password must be at least 6 characters long',
            });
        }

        // Check if user already exists
        const { data: existingUsers } = await supabase
            .from('users')
            .select('*')
            .eq('mobile', mobile)
            .limit(1);

        if (existingUsers && existingUsers.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'User with this mobile number already exists',
            });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user
        const { data: user, error } = await supabase
            .from('users')
            .insert({
                mobile,
                password: hashedPassword,
                name: name || null,
                email: email || null,
                role: role || 'buyer',
                is_verified: true,
            })
            .select()
            .single();

        if (error) throw error;

        // Generate token
        const token = generateToken(user.id);

        res.status(201).json({
            success: true,
            message: 'User registered successfully',
            token,
            user: {
                id: user.id,
                mobile: user.mobile,
                name: user.name,
                email: user.email,
                role: user.role,
                isVerified: user.is_verified,
            },
        });
    } catch (error: any) {
        console.error('Signup error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to register user',
        });
    }
});

// POST /api/auth/login - Login user with password
router.post('/login', async (req, res) => {
    try {
        const { mobile, password } = req.body;

        if (!mobile || !/^[0-9]{10}$/.test(mobile)) {
            return res.status(400).json({
                success: false,
                message: 'Please provide a valid 10-digit mobile number',
            });
        }

        if (!password) {
            return res.status(400).json({
                success: false,
                message: 'Please provide a password',
            });
        }

        // Find user with password field
        const { data: users, error } = await supabase
            .from('users')
            .select('*')
            .eq('mobile', mobile)
            .limit(1);

        if (error) throw error;

        if (!users || users.length === 0) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials',
            });
        }

        const user = users[0];

        if (!user.password) {
            return res.status(401).json({
                success: false,
                message: 'Please use OTP login for this account',
            });
        }

        // Verify password
        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials',
            });
        }

        // Generate token
        const token = generateToken(user.id);

        res.json({
            success: true,
            message: 'Login successful',
            token,
            user: {
                id: user.id,
                mobile: user.mobile,
                name: user.name,
                email: user.email,
                role: user.role,
                isVerified: user.is_verified,
            },
        });
    } catch (error: any) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to login',
        });
    }
});

// GET /api/auth/me - Get current user
router.get('/me', async (req, res) => {
    try {
        const token = req.headers.authorization?.replace('Bearer ', '');

        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'No token provided',
            });
        }

        const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };

        const { data: user, error } = await supabase
            .from('users')
            .select('*')
            .eq('id', decoded.userId)
            .single();

        if (error) throw error;

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found',
            });
        }

        res.json({
            success: true,
            user: {
                id: user.id,
                mobile: user.mobile,
                name: user.name,
                email: user.email,
                role: user.role,
                isVerified: user.is_verified,
            },
        });
    } catch (error: any) {
        console.error('Get user error:', error);
        res.status(401).json({
            success: false,
            message: 'Invalid token',
        });
    }
});

export default router;
