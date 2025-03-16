import express from 'express';
import { Pool } from 'pg';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

interface OrderItem {
  product_id: string;
  quantity: number;
  quantity_unit: '250g' | '500g' | '1Kg';
  unit_price: number;
  name: string;
}

interface OrderPayload {
  total_amount: number;
  items: OrderItem[];
  shipping_address: {
    name: string;
    email: string;
    address: string;
    city: string;
    zip_code: string;
  };
}

router.post('/', authenticateToken, async (req, res) => {
  try {
    const orderData: OrderPayload = req.body;
    const userId = req.user.id;

    // Start a transaction
    await pool.query('BEGIN');

    try {
      // Create the order
      const orderResult = await pool.query(
        `INSERT INTO orders (user_id, total_amount, status, shipping_address)
         VALUES ($1, $2, $3, $4)
         RETURNING id`,
        [userId, orderData.total_amount, 'pending', orderData.shipping_address]
      );
      const orderId = orderResult.rows[0].id;

      // Insert order details
      for (const item of orderData.items) {
        await pool.query(
          `INSERT INTO order_details 
           (order_id, product_id, quantity, quantity_unit, unit_price, name)
           VALUES ($1, $2, $3, $4, $5, $6)`,
          [
            orderId,
            item.product_id,
            item.quantity,
            item.quantity_unit,
            item.unit_price,
            item.name
          ]
        );
      }

      // Commit the transaction
      await pool.query('COMMIT');

      // Fetch the complete order with details
      const completeOrderResult = await pool.query(
        `SELECT o.*, 
         json_agg(json_build_object(
           'id', od.id,
           'product_id', od.product_id,
           'quantity', od.quantity,
           'quantity_unit', od.quantity_unit,
           'unit_price', od.unit_price,
           'name', od.name
         )) as items
         FROM orders o
         LEFT JOIN order_details od ON o.id = od.order_id
         WHERE o.id = $1
         GROUP BY o.id`,
        [orderId]
      );

      res.status(201).json({
        message: 'Order created successfully',
        order: completeOrderResult.rows[0]
      });
    } catch (error) {
      // Rollback the transaction on error
      await pool.query('ROLLBACK');
      throw error;
    }
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ error: 'Failed to create order' });
  }
});

export default router; 