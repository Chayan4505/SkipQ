import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { supabase } from '../config/supabase';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

// GET /api/users/profile - Get current user profile
router.get('/profile', authenticate, async (req, res) => {
    try {
        const { data: user, error } = await supabase
            .from('users')
            .select('*')
            .eq('id', req.userId)
            .single();

        if (error || !user) {
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
                createdAt: user.created_at,
            },
        });
    } catch (error: any) {
        console.error('Get profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get profile',
        });
    }
});

// PUT /api/users/profile - Update user profile
router.put('/profile', authenticate, async (req, res) => {
    try {
        const { name, email } = req.body;

        const { data: user, error: fetchError } = await supabase
            .from('users')
            .select('*')
            .eq('id', req.userId)
            .single();

        if (fetchError || !user) {
            return res.status(404).json({
                success: false,
                message: 'User not found',
            });
        }

        // Build update object
        const updateData: any = {};
        if (name !== undefined) updateData.name = name;
        if (email !== undefined) updateData.email = email;

        const { data: updatedUser, error: updateError } = await supabase
            .from('users')
            .update(updateData)
            .eq('id', req.userId)
            .select()
            .single();

        if (updateError) throw updateError;

        res.json({
            success: true,
            message: 'Profile updated successfully',
            user: {
                id: updatedUser.id,
                mobile: updatedUser.mobile,
                name: updatedUser.name,
                email: updatedUser.email,
                role: updatedUser.role,
                isVerified: updatedUser.is_verified,
            },
        });
    } catch (error: any) {
        console.error('Update profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update profile',
        });
    }
});

// PUT /api/users/password - Update user password
router.put('/password', authenticate, async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({
                success: false,
                message: 'Please provide both current and new password',
            });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({
                success: false,
                message: 'New password must be at least 6 characters long',
            });
        }

        const { data: user, error } = await supabase
            .from('users')
            .select('*')
            .eq('id', req.userId)
            .single();

        if (error || !user) {
            return res.status(404).json({
                success: false,
                message: 'User not found',
            });
        }

        if (!user.password) {
            return res.status(400).json({
                success: false,
                message: 'This account uses OTP login. Please set a password first.',
            });
        }

        // Verify current password
        const isPasswordValid = await bcrypt.compare(currentPassword, user.password);

        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: 'Current password is incorrect',
            });
        }

        // Hash and update new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        const { error: updateError } = await supabase
            .from('users')
            .update({ password: hashedPassword })
            .eq('id', req.userId);

        if (updateError) throw updateError;

        res.json({
            success: true,
            message: 'Password updated successfully',
        });
    } catch (error: any) {
        console.error('Update password error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update password',
        });
    }
});

// GET /api/users/:id - Get user by ID (for admin or public profile)
router.get('/:id', async (req, res) => {
    try {
        const { data: user, error } = await supabase
            .from('users')
            .select('id, name, role')
            .eq('id', req.params.id)
            .single();

        if (error) {
            if (error.code === 'PGRST116') {
                return res.status(404).json({
                    success: false,
                    message: 'User not found',
                });
            }
            throw error;
        }

        // Return only public information
        res.json({
            success: true,
            user: {
                id: user.id,
                name: user.name,
                role: user.role,
            },
        });
    } catch (error: any) {
        console.error('Get user by ID error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get user',
        });
    }
});

// GET /api/users - Get all users (admin only - simplified for now)
router.get('/', async (req, res) => {
    try {
        const { data: users, error } = await supabase
            .from('users')
            .select('id, name, mobile, email, role, is_verified, created_at');

        if (error) throw error;

        res.json({
            success: true,
            users: users || [],
        });
    } catch (error: any) {
        console.error('Get all users error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get users',
        });
    }
});

// PUT /api/users/:id - Update user (admin functionality)
router.put('/:id', authenticate, async (req, res) => {
    try {
        const { name, email, role } = req.body;

        const { data: user, error: fetchError } = await supabase
            .from('users')
            .select('*')
            .eq('id', req.params.id)
            .single();

        if (fetchError) {
            if (fetchError.code === 'PGRST116') {
                return res.status(404).json({
                    success: false,
                    message: 'User not found',
                });
            }
            throw fetchError;
        }

        // Build update object
        const updateData: any = {};
        if (name !== undefined) updateData.name = name;
        if (email !== undefined) updateData.email = email;
        if (role !== undefined) updateData.role = role;

        const { data: updatedUser, error: updateError } = await supabase
            .from('users')
            .update(updateData)
            .eq('id', req.params.id)
            .select()
            .single();

        if (updateError) throw updateError;

        res.json({
            success: true,
            message: 'User updated successfully',
            user: {
                id: updatedUser.id,
                mobile: updatedUser.mobile,
                name: updatedUser.name,
                email: updatedUser.email,
                role: updatedUser.role,
                isVerified: updatedUser.is_verified,
            },
        });
    } catch (error: any) {
        console.error('Update user error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update user',
        });
    }
});

export default router;
