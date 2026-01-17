import { Router } from 'express';
import { supabase } from '../config/supabase';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

// Helper function to generate order number
function generateOrderNumber(): string {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 7);
    return `ORD-${timestamp}-${random}`.toUpperCase();
}

// POST /api/orders - Create a new order
router.post('/', authenticate, async (req, res) => {
    try {
        const { shopId, items, totalAmount, paymentMethod, deliveryAddress, notes } = req.body;

        if (!shopId || !items || !totalAmount || !paymentMethod) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields',
            });
        }

        if (!Array.isArray(items) || items.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Order must have at least one item',
            });
        }

        const orderNumber = generateOrderNumber();

        // Create order
        const { data: order, error: orderError } = await supabase
            .from('orders')
            .insert({
                order_number: orderNumber,
                user_id: req.userId,
                shop_id: shopId,
                status: 'pending',
                total_amount: totalAmount,
                payment_method: paymentMethod,
                payment_status: paymentMethod === 'cash' ? 'pending' : 'paid',
                delivery_address: deliveryAddress || null,
                notes: notes || null,
            })
            .select()
            .single();

        if (orderError) throw orderError;

        // Create order items
        const orderItems = items.map((item: any) => ({
            order_id: order.id,
            product_id: item.productId,
            name: item.productName || item.name,
            price: item.price,
            quantity: item.quantity,
            subtotal: item.price * item.quantity,
        }));

        const { error: itemsError } = await supabase
            .from('order_items')
            .insert(orderItems);

        if (itemsError) throw itemsError;

        // Get complete order with items
        const { data: completeOrder } = await supabase
            .from('orders')
            .select(`
                *,
                order_items (
                    id,
                    product_id,
                    name,
                    price,
                    quantity,
                    subtotal
                )
            `)
            .eq('id', order.id)
            .single();

        res.status(201).json({
            success: true,
            message: 'Order created successfully',
            order: completeOrder,
        });
    } catch (error: any) {
        console.error('Create order error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create order',
        });
    }
});

// GET /api/orders/my-orders - Get current user's orders
router.get('/my-orders', authenticate, async (req, res) => {
    try {
        const { data: orders, error } = await supabase
            .from('orders')
            .select(`
                *,
                order_items (
                    id,
                    product_id,
                    name,
                    price,
                    quantity,
                    subtotal
                ),
                shops (
                    id,
                    name
                )
            `)
            .eq('user_id', req.userId)
            .order('created_at', { ascending: false })
            .limit(50);

        if (error) throw error;

        res.json({
            success: true,
            orders: orders || [],
        });
    } catch (error: any) {
        console.error('Get my orders error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get orders',
        });
    }
});

// GET /api/orders/shop-orders - Get orders for a shop
router.get('/shop-orders', authenticate, async (req, res) => {
    try {
        const { shopId, status } = req.query;

        if (!shopId) {
            return res.status(400).json({
                success: false,
                message: 'Shop ID is required',
            });
        }

        let query = supabase
            .from('orders')
            .select(`
                *,
                order_items (
                    id,
                    product_id,
                    name,
                    price,
                    quantity,
                    subtotal
                ),
                users (
                    id,
                    name,
                    mobile
                )
            `)
            .eq('shop_id', shopId);

        if (status) {
            query = query.eq('status', status);
        }

        const { data: orders, error } = await query
            .order('created_at', { ascending: false })
            .limit(100);

        if (error) throw error;

        res.json({
            success: true,
            orders: orders || [],
        });
    } catch (error: any) {
        console.error('Get shop orders error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get shop orders',
        });
    }
});

// GET /api/orders/:id - Get order by ID
router.get('/:id', authenticate, async (req, res) => {
    try {
        const { data: order, error } = await supabase
            .from('orders')
            .select(`
                *,
                order_items (
                    id,
                    product_id,
                    name,
                    price,
                    quantity,
                    subtotal
                ),
                shops (
                    id,
                    name,
                    phone,
                    address
                ),
                users (
                    id,
                    name,
                    mobile
                )
            `)
            .eq('id', req.params.id)
            .single();

        if (error) {
            if (error.code === 'PGRST116') {
                return res.status(404).json({
                    success: false,
                    message: 'Order not found',
                });
            }
            throw error;
        }

        // Check if user has access to this order
        if (order.user_id !== req.userId) {
            // TODO: Also allow shop owner to view their shop's orders
            return res.status(403).json({
                success: false,
                message: 'You do not have permission to view this order',
            });
        }

        res.json({
            success: true,
            order,
        });
    } catch (error: any) {
        console.error('Get order by ID error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get order',
        });
    }
});

// PUT /api/orders/:id/status - Update order status
router.put('/:id/status', authenticate, async (req, res) => {
    try {
        const { status } = req.body;

        if (!status) {
            return res.status(400).json({
                success: false,
                message: 'Status is required',
            });
        }

        const validStatuses = ['pending', 'confirmed', 'preparing', 'ready', 'completed', 'cancelled'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid status',
            });
        }

        const { data: order, error: fetchError } = await supabase
            .from('orders')
            .select('*')
            .eq('id', req.params.id)
            .single();

        if (fetchError) {
            if (fetchError.code === 'PGRST116') {
                return res.status(404).json({
                    success: false,
                    message: 'Order not found',
                });
            }
            throw fetchError;
        }

        // TODO: Add permission check for shop owner

        const { data: updatedOrder, error: updateError } = await supabase
            .from('orders')
            .update({ status })
            .eq('id', req.params.id)
            .select(`
                *,
                order_items (
                    id,
                    product_id,
                    name,
                    price,
                    quantity,
                    subtotal
                )
            `)
            .single();

        if (updateError) throw updateError;

        res.json({
            success: true,
            message: 'Order status updated successfully',
            order: updatedOrder,
        });
    } catch (error: any) {
        console.error('Update order status error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update order status',
        });
    }
});

// PUT /api/orders/:id/cancel - Cancel an order
router.put('/:id/cancel', authenticate, async (req, res) => {
    try {
        const { data: order, error: fetchError } = await supabase
            .from('orders')
            .select('*')
            .eq('id', req.params.id)
            .single();

        if (fetchError) {
            if (fetchError.code === 'PGRST116') {
                return res.status(404).json({
                    success: false,
                    message: 'Order not found',
                });
            }
            throw fetchError;
        }

        // Check if user owns this order
        if (order.user_id !== req.userId) {
            return res.status(403).json({
                success: false,
                message: 'You do not have permission to cancel this order',
            });
        }

        // Check if order can be cancelled
        if (['completed', 'cancelled'].includes(order.status)) {
            return res.status(400).json({
                success: false,
                message: `Cannot cancel order with status: ${order.status}`,
            });
        }

        const updateData: any = { status: 'cancelled' };
        if (order.payment_status === 'paid') {
            updateData.payment_status = 'refunded';
        }

        const { data: updatedOrder, error: updateError } = await supabase
            .from('orders')
            .update(updateData)
            .eq('id', req.params.id)
            .select(`
                *,
                order_items (
                    id,
                    product_id,
                    name,
                    price,
                    quantity,
                    subtotal
                )
            `)
            .single();

        if (updateError) throw updateError;

        res.json({
            success: true,
            message: 'Order cancelled successfully',
            order: updatedOrder,
        });
    } catch (error: any) {
        console.error('Cancel order error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to cancel order',
        });
    }
});

// GET /api/orders - Get all orders (admin functionality)
router.get('/', authenticate, async (req, res) => {
    try {
        const { data: orders, error } = await supabase
            .from('orders')
            .select(`
                *,
                order_items (
                    id,
                    product_id,
                    name,
                    price,
                    quantity,
                    subtotal
                ),
                shops (
                    id,
                    name
                ),
                users (
                    id,
                    name,
                    mobile
                )
            `)
            .order('created_at', { ascending: false })
            .limit(100);

        if (error) throw error;

        res.json({
            success: true,
            orders: orders || [],
        });
    } catch (error: any) {
        console.error('Get all orders error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get orders',
        });
    }
});

export default router;
