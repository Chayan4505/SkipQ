import { Router } from 'express';
import { supabase } from '../config/supabase';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

// GET /api/cart - Get user's cart
router.get('/', authenticate, async (req, res) => {
    try {
        // Get or create cart
        const { data: carts, error: fetchError } = await supabase
            .from('carts')
            .select(`
                *,
                cart_items (
                    id,
                    product_id,
                    quantity,
                    products (
                        id,
                        name,
                        price,
                        image,
                        unit,
                        shop_id,
                        shops (
                            id,
                            name
                        )
                    )
                )
            `)
            .eq('user_id', req.userId);

        if (fetchError) throw fetchError;

        let cart = carts && carts.length > 0 ? carts[0] : null;

        if (!cart) {
            // Return empty cart if it doesn't exist
            return res.json({
                success: true,
                items: [],
            });
        }

        // Transform cart items to match old format
        const items = cart.cart_items?.map((item: any) => ({
            productId: item.product_id,
            productName: item.products?.name,
            price: item.products?.price,
            quantity: item.quantity,
            shopId: item.products?.shop_id,
            shopName: item.products?.shops?.name,
            image: item.products?.image,
            unit: item.products?.unit,
        })) || [];

        res.json({
            success: true,
            items,
        });
    } catch (error: any) {
        console.error('Get cart error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get cart',
        });
    }
});

// POST /api/cart/add - Add item to cart
router.post('/add', authenticate, async (req, res) => {
    try {
        const { product, shopId, shopName, quantity = 1 } = req.body;

        if (!product || !shopId || !shopName) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields',
            });
        }

        // Get or create cart for this shop
        let { data: cart } = await supabase
            .from('carts')
            .select('*')
            .eq('user_id', req.userId)
            .eq('shop_id', shopId)
            .single();

        if (!cart) {
            const { data: newCart, error: createError } = await supabase
                .from('carts')
                .insert({
                    user_id: req.userId,
                    shop_id: shopId,
                })
                .select()
                .single();

            if (createError) throw createError;
            cart = newCart;
        }

        // Check if product already exists in cart
        const { data: existingItem } = await supabase
            .from('cart_items')
            .select('*')
            .eq('cart_id', cart.id)
            .eq('product_id', product.id)
            .single();

        if (existingItem) {
            // Update quantity if product exists
            const { error: updateError } = await supabase
                .from('cart_items')
                .update({ quantity: existingItem.quantity + quantity })
                .eq('id', existingItem.id);

            if (updateError) throw updateError;
        } else {
            // Add new item to cart
            const { error: insertError } = await supabase
                .from('cart_items')
                .insert({
                    cart_id: cart.id,
                    product_id: product.id,
                    quantity,
                });

            if (insertError) throw insertError;
        }

        // Get updated cart items
        const { data: cartItems } = await supabase
            .from('cart_items')
            .select(`
                *,
                products (
                    id,
                    name,
                    price,
                    image,
                    unit
                )
            `)
            .eq('cart_id', cart.id);

        const items = cartItems?.map((item: any) => ({
            productId: item.product_id,
            productName: item.products?.name,
            price: item.products?.price,
            quantity: item.quantity,
            shopId,
            shopName,
            image: item.products?.image,
            unit: item.products?.unit,
        })) || [];

        res.json({
            success: true,
            message: 'Item added to cart',
            items,
        });
    } catch (error: any) {
        console.error('Add to cart error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to add item to cart',
        });
    }
});

// PUT /api/cart/update - Update item quantity in cart
router.put('/update', authenticate, async (req, res) => {
    try {
        const { productId, quantity } = req.body;

        if (!productId || quantity === undefined) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields',
            });
        }

        if (quantity < 0) {
            return res.status(400).json({
                success: false,
                message: 'Quantity cannot be negative',
            });
        }

        // Get user's cart
        const { data: cart } = await supabase
            .from('carts')
            .select('*')
            .eq('user_id', req.userId)
            .single();

        if (!cart) {
            return res.status(404).json({
                success: false,
                message: 'Cart not found',
            });
        }

        // Find cart item
        const { data: cartItem } = await supabase
            .from('cart_items')
            .select('*')
            .eq('cart_id', cart.id)
            .eq('product_id', productId)
            .single();

        if (!cartItem) {
            return res.status(404).json({
                success: false,
                message: 'Item not found in cart',
            });
        }

        if (quantity === 0) {
            // Remove item if quantity is 0
            const { error: deleteError } = await supabase
                .from('cart_items')
                .delete()
                .eq('id', cartItem.id);

            if (deleteError) throw deleteError;
        } else {
            // Update quantity
            const { error: updateError } = await supabase
                .from('cart_items')
                .update({ quantity })
                .eq('id', cartItem.id);

            if (updateError) throw updateError;
        }

        // Get updated cart items
        const { data: cartItems } = await supabase
            .from('cart_items')
            .select(`
                *,
                products (
                    id,
                    name,
                    price,
                    image,
                    unit,
                    shop_id,
                    shops (
                        name
                    )
                )
            `)
            .eq('cart_id', cart.id);

        const items = cartItems?.map((item: any) => ({
            productId: item.product_id,
            productName: item.products?.name,
            price: item.products?.price,
            quantity: item.quantity,
            shopId: item.products?.shop_id,
            shopName: item.products?.shops?.name,
            image: item.products?.image,
            unit: item.products?.unit,
        })) || [];

        res.json({
            success: true,
            message: 'Cart updated',
            items,
        });
    } catch (error: any) {
        console.error('Update cart error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update cart',
        });
    }
});

// DELETE /api/cart/remove/:productId - Remove item from cart
router.delete('/remove/:productId', authenticate, async (req, res) => {
    try {
        const { productId } = req.params;

        // Get user's cart
        const { data: cart } = await supabase
            .from('carts')
            .select('*')
            .eq('user_id', req.userId)
            .single();

        if (!cart) {
            return res.status(404).json({
                success: false,
                message: 'Cart not found',
            });
        }

        // Delete cart item
        const { error: deleteError } = await supabase
            .from('cart_items')
            .delete()
            .eq('cart_id', cart.id)
            .eq('product_id', productId);

        if (deleteError) throw deleteError;

        // Get updated cart items
        const { data: cartItems } = await supabase
            .from('cart_items')
            .select(`
                *,
                products (
                    id,
                    name,
                    price,
                    image,
                    unit,
                    shop_id,
                    shops (
                        name
                    )
                )
            `)
            .eq('cart_id', cart.id);

        const items = cartItems?.map((item: any) => ({
            productId: item.product_id,
            productName: item.products?.name,
            price: item.products?.price,
            quantity: item.quantity,
            shopId: item.products?.shop_id,
            shopName: item.products?.shops?.name,
            image: item.products?.image,
            unit: item.products?.unit,
        })) || [];

        res.json({
            success: true,
            message: 'Item removed from cart',
            items,
        });
    } catch (error: any) {
        console.error('Remove from cart error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to remove item from cart',
        });
    }
});

// DELETE /api/cart/clear - Clear entire cart
router.delete('/clear', authenticate, async (req, res) => {
    try {
        // Get user's cart
        const { data: cart } = await supabase
            .from('carts')
            .select('*')
            .eq('user_id', req.userId)
            .single();

        if (!cart) {
            return res.status(404).json({
                success: false,
                message: 'Cart not found',
            });
        }

        // Delete all cart items
        const { error: deleteError } = await supabase
            .from('cart_items')
            .delete()
            .eq('cart_id', cart.id);

        if (deleteError) throw deleteError;

        res.json({
            success: true,
            message: 'Cart cleared',
            items: [],
        });
    } catch (error: any) {
        console.error('Clear cart error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to clear cart',
        });
    }
});

export default router;
