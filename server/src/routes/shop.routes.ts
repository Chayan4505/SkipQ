import { Router } from 'express';
import { supabase } from '../config/supabase';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

// POST /api/shops - Create a new shop
router.post('/', authenticate, async (req, res) => {
    try {
        const {
            name,
            description,
            category,
            image,
            phone,
            address,
            city,
            state,
            pincode,
            coordinates,
            openingTime,
            closingTime,
        } = req.body;

        // Validate required fields
        if (!name || !category || !phone || !address || !city || !state || !pincode) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields',
            });
        }

        // Check if user already has a shop with this name
        const { data: existingShops } = await supabase
            .from('shops')
            .select('*')
            .eq('owner_id', req.userId)
            .eq('name', name)
            .limit(1);

        if (existingShops && existingShops.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'You already have a shop with this name',
            });
        }

        // Create shop
        const { data: shop, error } = await supabase
            .from('shops')
            .insert({
                owner_id: req.userId,
                name,
                description: description || null,
                category,
                image: image || null,
                phone,
                address,
                city,
                state,
                pincode,
                coordinates_lat: coordinates?.lat || null,
                coordinates_lng: coordinates?.lng || null,
                opening_time: openingTime || null,
                closing_time: closingTime || null,
                is_open: true,
            })
            .select()
            .single();

        if (error) throw error;

        res.status(201).json({
            success: true,
            message: 'Shop created successfully',
            shop,
        });
    } catch (error: any) {
        console.error('Create shop error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create shop',
        });
    }
});

// GET /api/shops - Get all shops with filters
router.get('/', async (req, res) => {
    try {
        const { category, search, isOpen, city } = req.query;

        let query = supabase
            .from('shops')
            .select('*');

        if (category) {
            query = query.eq('category', category);
        }

        if (isOpen !== undefined) {
            query = query.eq('is_open', isOpen === 'true');
        }

        if (city) {
            query = query.ilike('city', `%${city}%`);
        }

        if (search) {
            query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`);
        }

        const { data: shops, error } = await query
            .order('rating', { ascending: false })
            .order('created_at', { ascending: false })
            .limit(100);

        if (error) throw error;

        // Transform coordinates for frontend
        const formattedShops = (shops || []).map(shop => ({
            ...shop,
            coordinates: shop.coordinates_lat && shop.coordinates_lng
                ? { lat: parseFloat(shop.coordinates_lat), lng: parseFloat(shop.coordinates_lng) }
                : null
        }));

        res.json({
            success: true,
            shops: formattedShops,
        });
    } catch (error: any) {
        console.error('Get shops error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get shops',
        });
    }
});

// GET /api/shops/owner/my-shops - Get current user's shops
router.get('/owner/my-shops', authenticate, async (req, res) => {
    try {
        const { data: shops, error } = await supabase
            .from('shops')
            .select('*')
            .eq('owner_id', req.userId)
            .order('created_at', { ascending: false });

        if (error) throw error;

        res.json({
            success: true,
            shops: shops || [],
        });
    } catch (error: any) {
        console.error('Get my shops error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get shops',
        });
    }
});

// GET /api/shops/:id - Get shop by ID
router.get('/:id', async (req, res) => {
    try {
        const { data: shop, error } = await supabase
            .from('shops')
            .select('*')
            .eq('id', req.params.id)
            .single();

        if (error) {
            if (error.code === 'PGRST116') {
                return res.status(404).json({
                    success: false,
                    message: 'Shop not found',
                });
            }
            throw error;
        }

        res.json({
            success: true,
            shop,
        });
    } catch (error: any) {
        console.error('Get shop by ID error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get shop',
        });
    }
});

// PUT /api/shops/:id - Update shop
router.put('/:id', authenticate, async (req, res) => {
    try {
        // First, get the shop to check ownership
        const { data: shop, error: fetchError } = await supabase
            .from('shops')
            .select('*')
            .eq('id', req.params.id)
            .single();

        if (fetchError) {
            if (fetchError.code === 'PGRST116') {
                return res.status(404).json({
                    success: false,
                    message: 'Shop not found',
                });
            }
            throw fetchError;
        }

        // Check if user owns this shop
        if (shop.owner_id !== req.userId) {
            return res.status(403).json({
                success: false,
                message: 'You do not have permission to update this shop',
            });
        }

        const {
            name,
            description,
            category,
            image,
            phone,
            address,
            city,
            state,
            pincode,
            coordinates,
            openingTime,
            closingTime,
            isOpen,
        } = req.body;

        // Build update object
        const updateData: any = {};
        if (name !== undefined) updateData.name = name;
        if (description !== undefined) updateData.description = description;
        if (category !== undefined) updateData.category = category;
        if (image !== undefined) updateData.image = image;
        if (phone !== undefined) updateData.phone = phone;
        if (address !== undefined) updateData.address = address;
        if (city !== undefined) updateData.city = city;
        if (state !== undefined) updateData.state = state;
        if (pincode !== undefined) updateData.pincode = pincode;
        if (coordinates?.lat !== undefined) updateData.coordinates_lat = coordinates.lat;
        if (coordinates?.lng !== undefined) updateData.coordinates_lng = coordinates.lng;
        if (openingTime !== undefined) updateData.opening_time = openingTime;
        if (closingTime !== undefined) updateData.closing_time = closingTime;
        if (isOpen !== undefined) updateData.is_open = isOpen;

        const { data: updatedShop, error: updateError } = await supabase
            .from('shops')
            .update(updateData)
            .eq('id', req.params.id)
            .select()
            .single();

        if (updateError) throw updateError;

        res.json({
            success: true,
            message: 'Shop updated successfully',
            shop: updatedShop,
        });
    } catch (error: any) {
        console.error('Update shop error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update shop',
        });
    }
});

// DELETE /api/shops/:id - Delete shop
router.delete('/:id', authenticate, async (req, res) => {
    try {
        // First, get the shop to check ownership
        const { data: shop, error: fetchError } = await supabase
            .from('shops')
            .select('*')
            .eq('id', req.params.id)
            .single();

        if (fetchError) {
            if (fetchError.code === 'PGRST116') {
                return res.status(404).json({
                    success: false,
                    message: 'Shop not found',
                });
            }
            throw fetchError;
        }

        // Check if user owns this shop
        if (shop.owner_id !== req.userId) {
            return res.status(403).json({
                success: false,
                message: 'You do not have permission to delete this shop',
            });
        }

        const { error: deleteError } = await supabase
            .from('shops')
            .delete()
            .eq('id', req.params.id);

        if (deleteError) throw deleteError;

        res.json({
            success: true,
            message: 'Shop deleted successfully',
        });
    } catch (error: any) {
        console.error('Delete shop error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete shop',
        });
    }
});

export default router;
