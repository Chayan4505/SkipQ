import { Router } from 'express';
import { supabase } from '../config/supabase';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

// POST /api/products - Create a new product
router.post('/', authenticate, async (req, res) => {
    try {
        const {
            shopId,
            name,
            description,
            category,
            price,
            originalPrice,
            unit,
            image,
            isAvailable,
            stock,
        } = req.body;

        // Validate required fields
        if (!shopId || !name || !category || price === undefined || !unit) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields',
            });
        }

        // Verify shop exists and user owns it
        const { data: shop, error: shopError } = await supabase
            .from('shops')
            .select('*')
            .eq('id', shopId)
            .single();

        if (shopError || !shop) {
            return res.status(404).json({
                success: false,
                message: 'Shop not found',
            });
        }

        if (shop.owner_id !== req.userId) {
            return res.status(403).json({
                success: false,
                message: 'You do not have permission to add products to this shop',
            });
        }

        // Create product
        const { data: product, error } = await supabase
            .from('products')
            .insert({
                shop_id: shopId,
                name,
                description: description || null,
                category,
                price,
                original_price: originalPrice || null,
                unit,
                image: image || null,
                is_available: isAvailable !== undefined ? isAvailable : true,
                stock: stock || 0,
            })
            .select()
            .single();

        if (error) throw error;

        res.status(201).json({
            success: true,
            message: 'Product created successfully',
            product,
        });
    } catch (error: any) {
        console.error('Create product error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create product',
        });
    }
});

// GET /api/products/shop/:shopId - Get products by shop
router.get('/shop/:shopId', async (req, res) => {
    try {
        const { category, search, isAvailable } = req.query;

        let query = supabase
            .from('products')
            .select('*')
            .eq('shop_id', req.params.shopId);

        if (category) {
            query = query.eq('category', category);
        }

        if (isAvailable !== undefined) {
            query = query.eq('is_available', isAvailable === 'true');
        }

        if (search) {
            query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`);
        }

        const { data: products, error } = await query.order('created_at', { ascending: false });

        if (error) throw error;

        res.json({
            success: true,
            products: products || [],
        });
    } catch (error: any) {
        console.error('Get products by shop error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get products',
        });
    }
});

// GET /api/products/:id - Get product by ID
router.get('/:id', async (req, res) => {
    try {
        const { data: product, error } = await supabase
            .from('products')
            .select('*')
            .eq('id', req.params.id)
            .single();

        if (error) {
            if (error.code === 'PGRST116') {
                return res.status(404).json({
                    success: false,
                    message: 'Product not found',
                });
            }
            throw error;
        }

        res.json({
            success: true,
            product,
        });
    } catch (error: any) {
        console.error('Get product by ID error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get product',
        });
    }
});

// PUT /api/products/:id - Update product
router.put('/:id', authenticate, async (req, res) => {
    try {
        // Get product first
        const { data: product, error: fetchError } = await supabase
            .from('products')
            .select('*')
            .eq('id', req.params.id)
            .single();

        if (fetchError) {
            if (fetchError.code === 'PGRST116') {
                return res.status(404).json({
                    success: false,
                    message: 'Product not found',
                });
            }
            throw fetchError;
        }

        // Verify shop ownership
        const { data: shop, error: shopError } = await supabase
            .from('shops')
            .select('*')
            .eq('id', product.shop_id)
            .single();

        if (shopError || !shop || shop.owner_id !== req.userId) {
            return res.status(403).json({
                success: false,
                message: 'You do not have permission to update this product',
            });
        }

        const {
            name,
            description,
            category,
            price,
            originalPrice,
            unit,
            image,
            isAvailable,
            stock,
        } = req.body;

        // Build update object
        const updateData: any = {};
        if (name !== undefined) updateData.name = name;
        if (description !== undefined) updateData.description = description;
        if (category !== undefined) updateData.category = category;
        if (price !== undefined) updateData.price = price;
        if (originalPrice !== undefined) updateData.original_price = originalPrice;
        if (unit !== undefined) updateData.unit = unit;
        if (image !== undefined) updateData.image = image;
        if (isAvailable !== undefined) updateData.is_available = isAvailable;
        if (stock !== undefined) updateData.stock = stock;

        const { data: updatedProduct, error: updateError } = await supabase
            .from('products')
            .update(updateData)
            .eq('id', req.params.id)
            .select()
            .single();

        if (updateError) throw updateError;

        res.json({
            success: true,
            message: 'Product updated successfully',
            product: updatedProduct,
        });
    } catch (error: any) {
        console.error('Update product error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update product',
        });
    }
});

// DELETE /api/products/:id - Delete product
router.delete('/:id', authenticate, async (req, res) => {
    try {
        // Get product first
        const { data: product, error: fetchError } = await supabase
            .from('products')
            .select('*')
            .eq('id', req.params.id)
            .single();

        if (fetchError) {
            if (fetchError.code === 'PGRST116') {
                return res.status(404).json({
                    success: false,
                    message: 'Product not found',
                });
            }
            throw fetchError;
        }

        // Verify shop ownership
        const { data: shop, error: shopError } = await supabase
            .from('shops')
            .select('*')
            .eq('id', product.shop_id)
            .single();

        if (shopError || !shop || shop.owner_id !== req.userId) {
            return res.status(403).json({
                success: false,
                message: 'You do not have permission to delete this product',
            });
        }

        const { error: deleteError } = await supabase
            .from('products')
            .delete()
            .eq('id', req.params.id);

        if (deleteError) throw deleteError;

        res.json({
            success: true,
            message: 'Product deleted successfully',
        });
    } catch (error: any) {
        console.error('Delete product error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete product',
        });
    }
});

// GET /api/products - Get all products (admin or search)
router.get('/', async (req, res) => {
    try {
        const { category, search, isAvailable } = req.query;

        let query = supabase.from('products').select('*');

        if (category) {
            query = query.eq('category', category);
        }

        if (isAvailable !== undefined) {
            query = query.eq('is_available', isAvailable === 'true');
        }

        if (search) {
            query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`);
        }

        const { data: products, error } = await query
            .order('created_at', { ascending: false })
            .limit(100);

        if (error) throw error;

        res.json({
            success: true,
            products: products || [],
        });
    } catch (error: any) {
        console.error('Get all products error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get products',
        });
    }
});

export default router;
