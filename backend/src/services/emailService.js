import nodemailer from 'nodemailer';

console.log('Initializing email service...');
console.log('Email configuration:', {
  user: process.env.EMAIL_USER,
  hasPassword: !!process.env.EMAIL_PASSWORD,
  adminEmail: process.env.ADMIN_EMAIL
});

// Create a transporter using SMTP
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false, // true for 465, false for other ports like 587
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

// Verify transporter configuration
console.log('Verifying email configuration...');
transporter.verify(function(error, success) {
  if (error) {
    console.error('❌ Email configuration error:', error);
  } else {
    console.log('✅ Email server is ready to send messages');
  }
});

// Function to format currency
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR'
  }).format(amount);
};

// Function to generate order items HTML
const generateOrderItemsHtml = (items) => {
  return items.map(item => `
    <tr>
      <td style="padding: 10px; border-bottom: 1px solid #eee;">
        ${item.product?.name || item.name}
      </td>
      <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">
        ${item.quantity} ${item.quantity_unit || ''}
      </td>
      <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">
        ${formatCurrency(item.price_at_time || item.price)}
      </td>
      <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">
        ${formatCurrency((item.quantity || 0) * (item.price_at_time || item.price))}
      </td>
    </tr>
  `).join('');
};

// Function to send order confirmation email
export const sendOrderConfirmationEmail = async (order, userEmail) => {
  try {
    console.log('\n📧 Attempting to send order confirmation email...');
    console.log('To:', userEmail);
    console.log('From:', process.env.EMAIL_USER);
    console.log('Order ID:', order.id);

    const mailOptions = {
      from: `"Bhukta Foods" <${process.env.EMAIL_USER}>`,
      to: userEmail,
      subject: `Order Confirmation - Order #${order.id}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333; text-align: center;">Order Confirmation</h2>
          <p>Dear ${order.shipping_address.name},</p>
          <p>Thank you for your order! We're excited to confirm that your order has been received and is being processed.</p>
          
          <div style="background-color: #f9f9f9; padding: 20px; border-radius: 5px; margin: 20px 0;">
            <h3 style="color: #333; margin-top: 0;">Order Details</h3>
            <p><strong>Order ID:</strong> ${order.id}</p>
            <p><strong>Order Date:</strong> ${new Date(order.created_at).toLocaleDateString()}</p>
            <p><strong>Status:</strong> ${order.status}</p>
          </div>

          <h3 style="color: #333;">Order Items</h3>
          <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
            <thead>
              <tr style="background-color: #f5f5f5;">
                <th style="padding: 10px; text-align: left;">Product</th>
                <th style="padding: 10px; text-align: center;">Quantity</th>
                <th style="padding: 10px; text-align: right;">Price</th>
                <th style="padding: 10px; text-align: right;">Total</th>
              </tr>
            </thead>
            <tbody>
              ${generateOrderItemsHtml(order.items)}
            </tbody>
            <tfoot>
              <tr>
                <td colspan="3" style="padding: 10px; text-align: right;"><strong>Total Amount:</strong></td>
                <td style="padding: 10px; text-align: right;"><strong>${formatCurrency(order.total_amount)}</strong></td>
              </tr>
            </tfoot>
          </table>

          <div style="background-color: #f9f9f9; padding: 20px; border-radius: 5px; margin: 20px 0;">
            <h3 style="color: #333; margin-top: 0;">Shipping Address</h3>
            <p>${order.shipping_address.name}</p>
            <p>${order.shipping_address.address}</p>
            <p>${order.shipping_address.city} - ${order.shipping_address.zip_code}</p>
          </div>

          <p style="color: #666; font-size: 14px;">
            If you have any questions about your order, please don't hesitate to contact our customer support.
          </p>
        </div>
      `
    };

    console.log('Sending email...');
    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Order confirmation email sent successfully!');
    console.log('Message ID:', info.messageId);
    return info;
  } catch (error) {
    console.error('❌ Error sending order confirmation email:', error);
    console.error('Error details:', {
      code: error.code,
      command: error.command,
      response: error.response,
      responseCode: error.responseCode,
      stack: error.stack
    });
    throw error;
  }
};

// Function to send admin notification email
export const sendAdminNotificationEmail = async (order) => {
  try {
    console.log('\n📧 Attempting to send admin notification email...');
    console.log('To:', process.env.ADMIN_EMAIL);
    console.log('From:', process.env.EMAIL_USER);
    console.log('Order ID:', order.id);

    const mailOptions = {
      from: `"Bhukta Foods" <${process.env.EMAIL_USER}>`,
      to: process.env.ADMIN_EMAIL,
      subject: `New Order Received - Order #${order.id}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333; text-align: center;">New Order Received</h2>
          <p>A new order has been placed and requires your attention.</p>
          
          <div style="background-color: #f9f9f9; padding: 20px; border-radius: 5px; margin: 20px 0;">
            <h3 style="color: #333; margin-top: 0;">Order Details</h3>
            <p><strong>Order ID:</strong> ${order.id}</p>
            <p><strong>Order Date:</strong> ${new Date(order.created_at).toLocaleDateString()}</p>
            <p><strong>Total Amount:</strong> ${formatCurrency(order.total_amount)}</p>
          </div>

          <h3 style="color: #333;">Order Items</h3>
          <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
            <thead>
              <tr style="background-color: #f5f5f5;">
                <th style="padding: 10px; text-align: left;">Product</th>
                <th style="padding: 10px; text-align: center;">Quantity</th>
                <th style="padding: 10px; text-align: right;">Price</th>
                <th style="padding: 10px; text-align: right;">Total</th>
              </tr>
            </thead>
            <tbody>
              ${generateOrderItemsHtml(order.items)}
            </tbody>
            <tfoot>
              <tr>
                <td colspan="3" style="padding: 10px; text-align: right;"><strong>Total Amount:</strong></td>
                <td style="padding: 10px; text-align: right;"><strong>${formatCurrency(order.total_amount)}</strong></td>
              </tr>
            </tfoot>
          </table>

          <div style="background-color: #f9f9f9; padding: 20px; border-radius: 5px; margin: 20px 0;">
            <h3 style="color: #333; margin-top: 0;">Customer Information</h3>
            <p><strong>Name:</strong> ${order.shipping_address.name}</p>
            <p><strong>Email:</strong> ${order.shipping_address.email}</p>
            <p><strong>Address:</strong> ${order.shipping_address.address}</p>
            <p><strong>City:</strong> ${order.shipping_address.city}</p>
            <p><strong>ZIP Code:</strong> ${order.shipping_address.zip_code}</p>
          </div>
        </div>
      `
    };

    console.log('Sending email...');
    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Admin notification email sent successfully!');
    console.log('Message ID:', info.messageId);
    return info;
  } catch (error) {
    console.error('❌ Error sending admin notification email:', error);
    console.error('Error details:', {
      code: error.code,
      command: error.command,
      response: error.response,
      responseCode: error.responseCode,
      stack: error.stack
    });
    throw error;
  }
}; 