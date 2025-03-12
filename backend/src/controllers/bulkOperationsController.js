import { supabase } from '../config/supabase.js';

// Bulk update stock for products in a category
export const bulkUpdateStock = async (req, res) => {
    try {
        const { category, operation, amount } = req.body;

        if (!['increment', 'decrement', 'set'].includes(operation)) {
            return res.status(400).json({ error: 'Invalid operation' });
        }

        if (typeof amount !== 'number' || amount < 0) {
            return res.status(400).json({ error: 'Invalid amount' });
        }

        let query = supabase.from('products');

        if (category) {
            query = query.eq('category', category);
        }

        let updateData = {};
        switch (operation) {
            case 'increment':
                updateData = { stock: supabase.raw('stock + ?', [amount]) };
                break;
            case 'decrement':
                updateData = { stock: supabase.raw('GREATEST(0, stock - ?)', [amount]) };
                break;
            case 'set':
                updateData = { stock: amount };
                break;
        }

        const { data, error } = await query
            .update(updateData)
            .select();

        if (error) throw error;

        // Check for low stock after update
        const lowStockProducts = data.filter(product => 
            product.stock <= product.low_stock_threshold && product.stock > 0
        );

        if (lowStockProducts.length > 0) {
            // TODO: Implement notification system
            console.log('Low stock alerts:', lowStockProducts.map(p => ({
                name: p.name,
                stock: p.stock,
                threshold: p.low_stock_threshold
            })));
        }

        res.json({
            message: 'Stock updated successfully',
            updatedProducts: data,
            lowStockAlerts: lowStockProducts
        });
    } catch (error) {
        console.error('Bulk stock update error:', error);
        res.status(500).json({ error: 'Failed to update stock' });
    }
};

// Bulk delete products
export const bulkDeleteProducts = async (req, res) => {
    try {
        const { productIds } = req.body;

        if (!Array.isArray(productIds) || productIds.length === 0) {
            return res.status(400).json({ error: 'Invalid product IDs' });
        }

        const { data, error } = await supabase
            .from('products')
            .delete()
            .in('id', productIds)
            .select();

        if (error) throw error;

        res.json({
            message: 'Products deleted successfully',
            deletedProducts: data
        });
    } catch (error) {
        console.error('Bulk delete error:', error);
        res.status(500).json({ error: 'Failed to delete products' });
    }
};

// Bulk update product status
export const bulkUpdateStatus = async (req, res) => {
    try {
        const { productIds, isAvailable } = req.body;

        if (!Array.isArray(productIds) || productIds.length === 0) {
            return res.status(400).json({ error: 'Invalid product IDs' });
        }

        if (typeof isAvailable !== 'boolean') {
            return res.status(400).json({ error: 'Invalid availability status' });
        }

        const { data, error } = await supabase
            .from('products')
            .update({ is_available: isAvailable })
            .in('id', productIds)
            .select();

        if (error) throw error;

        res.json({
            message: 'Product status updated successfully',
            updatedProducts: data
        });
    } catch (error) {
        console.error('Bulk status update error:', error);
        res.status(500).json({ error: 'Failed to update product status' });
    }
};

// Bulk update featured status
export const bulkUpdateFeatured = async (req, res) => {
    try {
        const { productIds, featured } = req.body;

        if (!Array.isArray(productIds) || productIds.length === 0) {
            return res.status(400).json({ error: 'Invalid product IDs' });
        }

        if (typeof featured !== 'boolean') {
            return res.status(400).json({ error: 'Invalid featured status' });
        }

        const { data, error } = await supabase
            .from('products')
            .update({ featured })
            .in('id', productIds)
            .select();

        if (error) throw error;

        res.json({
            message: 'Featured status updated successfully',
            updatedProducts: data
        });
    } catch (error) {
        console.error('Bulk featured update error:', error);
        res.status(500).json({ error: 'Failed to update featured status' });
    }
}; 