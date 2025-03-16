// Global variables
let currentUser = null;
let token = localStorage.getItem('adminToken');

// Check authentication on page load
document.addEventListener('DOMContentLoaded', async () => {
    if (!token) {
        window.location.href = '/admin/login';
        return;
    }
    
    // Initialize the dashboard
    initializeDashboard();
});

// Initialize dashboard
function initializeDashboard() {
    // Set up navigation
    setupNavigation();
    
    // Load initial data
    loadDashboardData();
    loadUsers();
    loadProducts();
    loadOrders();
    loadSubscriptions();
}

// Set up navigation
function setupNavigation() {
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const section = e.target.closest('.nav-link').dataset.section;
            showSection(section);
        });
    });
}

// Show selected section
function showSection(sectionId) {
    // Update active nav link
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
        if (link.dataset.section === sectionId) {
            link.classList.add('active');
        }
    });

    // Show selected section
    document.querySelectorAll('.section').forEach(section => {
        section.classList.remove('active');
        if (section.id === `${sectionId}-section`) {
            section.classList.add('active');
        }
    });
}

// Helper function to get auth headers
function getAuthHeaders() {
    const token = localStorage.getItem('adminToken');
    return {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
    };
}

// Load dashboard data
async function loadDashboardData() {
    try {
        const response = await fetch('/api/admin/dashboard', {
            headers: getAuthHeaders()
        });
        
        if (!response.ok) {
            if (response.status === 401 || response.status === 403) {
                // Token expired or invalid, redirect to login
                console.error('Authentication error:', await response.text());
                localStorage.removeItem('adminToken');
                window.location.href = '/admin/login.html';
                return;
            }
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to load dashboard data');
        }
        
        const data = await response.json();
        document.getElementById('total-users').textContent = data.totalUsers || 0;
        document.getElementById('total-products').textContent = data.totalProducts || 0;
        document.getElementById('total-orders').textContent = data.totalOrders || 0;
    } catch (error) {
        console.error('Error loading dashboard data:', error);
        showError('Failed to load dashboard data: ' + error.message);
    }
}

// Load users
async function loadUsers() {
    try {
        const response = await fetch('/api/admin/users', {
            headers: getAuthHeaders()
        });
        
        if (!response.ok) {
            if (response.status === 401) {
                window.location.href = '/admin/login.html';
                return;
            }
            throw new Error('Failed to load users');
        }
        
        const users = await response.json();
        const tbody = document.getElementById('users-table-body');
        tbody.innerHTML = users.map(user => `
            <tr>
                <td>${user.id}</td>
                <td>${user.full_name}</td>
                <td>${user.email}</td>
                <td>${user.role}</td>
                <td>
                    <button class="btn btn-sm btn-primary" onclick="editUser('${user.id}')">
                        <i class="bi bi-pencil"></i>
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="deleteUser('${user.id}')">
                        <i class="bi bi-trash"></i>
                    </button>
                </td>
            </tr>
        `).join('');
    } catch (error) {
        console.error('Error loading users:', error);
        showError('Failed to load users');
    }
}

// Load products
async function loadProducts() {
    try {
        const response = await fetch('/api/admin/products', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to load products');
        }
        
        const products = await response.json();
        
        // Ensure products is an array
        if (!Array.isArray(products)) {
            console.error('Invalid products data received:', products);
            throw new Error('Invalid products data received from server');
        }

        const tbody = document.getElementById('products-table-body');
        
        if (products.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="5" class="text-center">No products found</td>
                </tr>
            `;
            return;
        }

        tbody.innerHTML = products.map(product => `
            <tr>
                <td>${product.id || 'N/A'}</td>
                <td>${product.name || 'N/A'}</td>
                <td>$${(product.price || 0).toFixed(2)}</td>
                <td>${product.stock_quantity || 0}</td>
                <td>
                    <button class="btn btn-sm btn-primary" onclick="editProduct('${product.id}')" title="Edit product">
                        <i class="bi bi-pencil"></i>
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="deleteProduct('${product.id}')" title="Delete product">
                        <i class="bi bi-trash"></i>
                    </button>
                </td>
            </tr>
        `).join('');

        // Update products count if dashboard element exists
        const productsCount = document.getElementById('products-count');
        if (productsCount) {
            productsCount.textContent = products.length;
        }
    } catch (error) {
        console.error('Error loading products:', error);
        showError(error.message || 'Failed to load products');
        
        // Show error state in table
        const tbody = document.getElementById('products-table-body');
        tbody.innerHTML = `
            <tr>
                <td colspan="5" class="text-center text-danger">
                    <i class="bi bi-exclamation-triangle"></i> Error loading products
                </td>
            </tr>
        `;
    }
}

// Load orders
async function loadOrders() {
    try {
        const response = await fetch('/api/admin/orders', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (!response.ok) throw new Error('Failed to load orders');
        
        const orders = await response.json();
        const tbody = document.getElementById('orders-table-body');
        tbody.innerHTML = orders.map(order => `
            <tr>
                <td>${order.id}</td>
                <td>${order.profiles?.full_name || 'N/A'}</td>
                <td>₹${order.total_amount.toFixed(2)}</td>
                <td>
                    <span class="badge bg-${getStatusBadgeColor(order.status)}">
                        ${order.status}
                    </span>
                </td>
                <td>
                    <button class="btn btn-sm btn-primary" onclick="viewOrder('${order.id}')">
                        <i class="bi bi-eye"></i>
                    </button>
                    <button class="btn btn-sm btn-success" onclick="updateOrderStatus('${order.id}')">
                        <i class="bi bi-check-circle"></i>
                    </button>
                </td>
            </tr>
        `).join('');
    } catch (error) {
        console.error('Error loading orders:', error);
        showError('Failed to load orders');
    }
}

// View order details
async function viewOrder(orderId) {
    try {
        const response = await fetch(`/api/admin/orders/${orderId}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (!response.ok) throw new Error('Failed to load order details');
        
        const order = await response.json();
        showOrderDetails(order);
    } catch (error) {
        console.error('Error loading order details:', error);
        showError('Failed to load order details');
    }
}

// Show order details in modal
function showOrderDetails(order) {
    const modal = document.getElementById('orderDetailsModal');
    const modalContent = document.getElementById('orderDetailsContent');
    
    // Get the items array, checking both possible property names
    const items = order.order_items || order.items || [];
    
    if (!Array.isArray(items)) {
        console.error('Invalid order items data:', items);
        showError('Invalid order data received');
        return;
    }
    
    modalContent.innerHTML = `
        <div class="modal-header">
            <h5 class="modal-title">Order Details</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
        </div>
        <div class="modal-body">
            <div class="row">
                <div class="col-md-6">
                    <h6>Order Information</h6>
                    <p><strong>Order ID:</strong> ${order.id}</p>
                    <p><strong>Status:</strong> <span class="badge bg-${getStatusBadgeColor(order.status)}">${order.status}</span></p>
                    <p><strong>Total Amount:</strong> ₹${order.total_amount.toFixed(2)}</p>
                    <p><strong>Created At:</strong> ${new Date(order.created_at).toLocaleString()}</p>
                </div>
                <div class="col-md-6">
                    <h6>Shipping Information</h6>
                    <p><strong>Name:</strong> ${order.shipping_address.name}</p>
                    <p><strong>Email:</strong> ${order.shipping_address.email}</p>
                    <p><strong>Address:</strong> ${order.shipping_address.address}</p>
                    <p><strong>City:</strong> ${order.shipping_address.city}</p>
                    <p><strong>ZIP Code:</strong> ${order.shipping_address.zip_code}</p>
                </div>
            </div>
            <div class="mt-4">
                <h6>Order Items</h6>
                <div class="table-responsive">
                    <table class="table table-sm">
                        <thead>
                            <tr>
                                <th>Product</th>
                                <th>Quantity</th>
                                <th>Price</th>
                                <th>Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${items.map(item => `
                                <tr>
                                    <td>
                                        <div class="d-flex align-items-center">
                                            <img src="${item.product?.image_url || ''}" alt="${item.product?.name || 'Product'}" class="me-2" style="width: 40px; height: 40px; object-fit: cover;">
                                            ${item.product?.name || item.name || 'Unknown Product'}
                                        </div>
                                    </td>
                                    <td>${item.quantity} ${item.quantity_unit || ''}</td>
                                    <td>₹${(item.price_at_time || item.price || 0).toFixed(2)}</td>
                                    <td>₹${((item.quantity || 0) * (item.price_at_time || item.price || 0)).toFixed(2)}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                        <tfoot>
                            <tr>
                                <td colspan="3" class="text-end"><strong>Total:</strong></td>
                                <td><strong>₹${order.total_amount.toFixed(2)}</strong></td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
            </div>
        </div>
    `;
    
    new bootstrap.Modal(modal).show();
}

// Update order status
async function updateOrderStatus(orderId) {
    try {
        const status = await showStatusUpdateModal();
        if (!status) return;

        const response = await fetch(`/api/admin/orders/${orderId}/status`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ status })
        });
        
        if (!response.ok) throw new Error('Failed to update order status');
        
        showSuccess('Order status updated successfully');
        loadOrders();
    } catch (error) {
        console.error('Error updating order status:', error);
        showError('Failed to update order status');
    }
}

// Show status update modal
function showStatusUpdateModal() {
    return new Promise((resolve) => {
        const modal = document.getElementById('statusUpdateModal');
        const statusSelect = document.getElementById('statusSelect');
        
        statusSelect.value = '';
        
        const modalInstance = new bootstrap.Modal(modal);
        modalInstance.show();
        
        document.getElementById('updateStatusBtn').onclick = () => {
            const status = statusSelect.value;
            if (status) {
                modalInstance.hide();
                resolve(status);
            }
        };
        
        document.getElementById('cancelStatusUpdate').onclick = () => {
            modalInstance.hide();
            resolve(null);
        };
    });
}

// Helper function to get status badge color
function getStatusBadgeColor(status) {
    const colors = {
        pending: 'warning',
        processing: 'info',
        shipped: 'primary',
        delivered: 'success',
        cancelled: 'danger'
    };
    return colors[status] || 'secondary';
}

// Load subscriptions
async function loadSubscriptions() {
    try {
        const response = await fetch('/api/subscriptions', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        const subscriptions = await response.json();
        
        const tableBody = document.getElementById('subscriptions-table-body');
        tableBody.innerHTML = '';
        
        subscriptions.forEach(subscription => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${subscription.id}</td>
                <td>
                    <div class="d-flex align-items-center">
                        ${subscription.image_url ? 
                            `<img src="${subscription.image_url}" alt="${subscription.name}" class="me-2" style="width: 40px; height: 40px; object-fit: cover; border-radius: 4px;">` : 
                            '<div class="me-2" style="width: 40px; height: 40px; background-color: #e9ecef; border-radius: 4px;"></div>'
                        }
                        <a href="#" class="subscription-name-link" data-subscription-id="${subscription.id}">${subscription.name}</a>
                    </div>
                </td>
                <td>$${subscription.price}</td>
                <td>${subscription.duration_days}</td>
                <td>
                    <span class="badge ${subscription.is_active ? 'bg-success' : 'bg-danger'}">
                        ${subscription.is_active ? 'Active' : 'Inactive'}
                    </span>
                </td>
                <td>
                    <button class="btn btn-sm btn-primary me-1" onclick="editSubscription('${subscription.id}')">
                        <i class="bi bi-pencil"></i>
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="deleteSubscription('${subscription.id}')">
                        <i class="bi bi-trash"></i>
                    </button>
                </td>
            `;
            
            // Add click event for the subscription name
            const nameLink = row.querySelector('.subscription-name-link');
            nameLink.addEventListener('click', (e) => {
                e.preventDefault();
                showSubscriptionDetail(subscription.id);
            });
            
            tableBody.appendChild(row);
        });
    } catch (error) {
        console.error('Error loading subscriptions:', error);
        showMessage('Failed to load subscriptions', 'danger');
    }
}

// Show subscription detail
async function showSubscriptionDetail(subscriptionId) {
    try {
        const response = await fetch(`/api/admin/subscriptions/${subscriptionId}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        const subscription = await response.json();

        // Update modal content
        document.getElementById('subscription-detail-name').textContent = subscription.name;
        document.getElementById('subscription-detail-description').textContent = subscription.description;
        document.getElementById('subscription-detail-price').textContent = subscription.price;
        document.getElementById('subscription-detail-duration').textContent = subscription.duration_days;
        document.getElementById('subscription-detail-status').innerHTML = `
            <span class="badge ${subscription.is_active ? 'bg-success' : 'bg-danger'}">
                ${subscription.is_active ? 'Active' : 'Inactive'}
            </span>
        `;

        // Update image
        const imageElement = document.getElementById('subscription-detail-image');
        if (subscription.image_url) {
            imageElement.src = subscription.image_url;
            imageElement.style.display = 'block';
        } else {
            imageElement.style.display = 'none';
        }

        // Update lists
        const featuresElement = document.getElementById('subscription-detail-features');
        const benefitsElement = document.getElementById('subscription-detail-benefits');
        const restrictionsElement = document.getElementById('subscription-detail-restrictions');

        featuresElement.innerHTML = subscription.features.map(feature => 
            `<li><i class="bi bi-check-circle text-success me-2"></i>${feature}</li>`
        ).join('');

        benefitsElement.innerHTML = subscription.benefits.map(benefit => 
            `<li><i class="bi bi-gift text-primary me-2"></i>${benefit}</li>`
        ).join('');

        restrictionsElement.innerHTML = subscription.restrictions.map(restriction => 
            `<li><i class="bi bi-exclamation-circle text-warning me-2"></i>${restriction}</li>`
        ).join('');

        // Store subscription ID for edit button
        document.getElementById('subscriptionDetailModal').dataset.subscriptionId = subscriptionId;

        // Show modal
        const modal = new bootstrap.Modal(document.getElementById('subscriptionDetailModal'));
        modal.show();
    } catch (error) {
        console.error('Error loading subscription details:', error);
        showMessage('Failed to load subscription details', 'danger');
    }
}

// Edit subscription from detail view
function editSubscriptionFromDetail() {
    const subscriptionId = document.getElementById('subscriptionDetailModal').dataset.subscriptionId;
    const detailModal = bootstrap.Modal.getInstance(document.getElementById('subscriptionDetailModal'));
    detailModal.hide();
    editSubscription(subscriptionId);
}

// Show add user modal
function showAddUserModal() {
    const modal = new bootstrap.Modal(document.getElementById('addUserModal'));
    modal.show();
}

// Show add product modal
function showAddProductModal() {
    const modal = new bootstrap.Modal(document.getElementById('addProductModal'));
    modal.show();
}

// Show add subscription modal
function showAddSubscriptionModal() {
    const modal = new bootstrap.Modal(document.getElementById('addSubscriptionModal'));
    modal.show();
}

// Add new user
async function addUser() {
    const form = document.getElementById('addUserForm');
    const formData = new FormData(form);
    const submitButton = document.querySelector('#addUserModal .modal-footer .btn-primary');
    
    // Basic form validation
    const email = formData.get('email');
    const password = formData.get('password');
    const role = formData.get('role');
    
    if (!email || !password) {
        showMessage('Email and password are required', 'danger');
        return;
    }
    
    if (role && !['admin', 'customer'].includes(role)) {
        showMessage('Invalid role selected', 'danger');
        return;
    }
    
    try {
        // Disable submit button and show loading state
        submitButton.disabled = true;
        submitButton.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Adding...';

        const response = await fetch('/api/admin/users', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(Object.fromEntries(formData))
        });
        
        const result = await response.json();
        
        if (!response.ok) {
            throw new Error(result.error || result.details || 'Failed to add user');
        }
        
        const modal = bootstrap.Modal.getInstance(document.getElementById('addUserModal'));
        modal.hide();
        form.reset();
        loadUsers();
        showMessage('User added successfully', 'success');
    } catch (error) {
        console.error('Error adding user:', error);
        showMessage(error.message || 'Failed to add user', 'danger');
    } finally {
        // Reset button state
        submitButton.disabled = false;
        submitButton.innerHTML = 'Add User';
    }
}

// Edit product function
async function editProduct(productId) {
    try {
        const response = await fetch(`/api/admin/products/${productId}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to fetch product');
        }
        
        const product = await response.json();
        
        // Get the form and verify it exists
        const form = document.getElementById('editProductForm');
        if (!form) {
            throw new Error('Edit product form not found in the DOM');
        }

        // Set form values
        form.querySelector('[name="productId"]').value = productId;
        form.querySelector('[name="name"]').value = product.name || '';
        form.querySelector('[name="description"]').value = product.description || '';
        form.querySelector('[name="price"]').value = product.price || '';
        form.querySelector('[name="stock_quantity"]').value = product.stock_quantity || '';
        form.querySelector('[name="category"]').value = product.category || 'snacks';
        form.querySelector('[name="is_available"]').checked = product.is_available || false;
        form.querySelector('[name="is_pre_order"]').checked = product.is_pre_order || false;

        // Show current image if it exists
        const currentImage = document.getElementById('currentProductImage');
        if (currentImage && product.image_url) {
            currentImage.src = product.image_url;
            currentImage.style.display = 'block';
        }

        // Show modal using Bootstrap's modal system
        const modal = new bootstrap.Modal(document.getElementById('editProductModal'));
        modal.show();
    } catch (error) {
        console.error('Error fetching product:', error);
        showMessage(error.message || 'Failed to fetch product details', 'danger');
    }
}

// Update product function
async function updateProduct(event) {
    if (!event) {
        console.error('Event object is missing');
        return;
    }
    
    event.preventDefault();
    
    const form = event.target;
    const submitButton = document.querySelector('button[form="editProductForm"]');
    if (!submitButton) {
        console.error('Submit button not found');
        return;
    }
    
    const originalText = submitButton.innerHTML;
    
    try {
        const formData = new FormData(form);
        const productId = formData.get('productId');

        if (!productId) {
            throw new Error('Product ID is missing');
        }

        // Show loading state
        submitButton.disabled = true;
        submitButton.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Updating...';

        const response = await fetch(`/api/admin/products/${productId}`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`
            },
            body: formData
        });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to update product');
        }
        
        // Show success message
        showSuccess('Product updated successfully');
        
        // Close modal and reload products
        const modal = bootstrap.Modal.getInstance(document.getElementById('editProductModal'));
        if (modal) {
            modal.hide();
        }
        
        // Reload products list
        await loadProducts();
    } catch (error) {
        console.error('Error updating product:', error);
        showError(error.message || 'Failed to update product');
    } finally {
        // Reset button state
        submitButton.disabled = false;
        submitButton.innerHTML = originalText;
    }
}

// Delete product function
async function deleteProduct(productId) {
    if (!confirm('Are you sure you want to delete this product?')) return;
    
    try {
        const response = await fetch(`/api/admin/products/${productId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to delete product');
        }
        
        loadProducts();
        showSuccess('Product deleted successfully');
    } catch (error) {
        console.error('Error deleting product:', error);
        showError(error.message || 'Failed to delete product');
    }
}

// Show message function
function showMessage(message, type = 'success') {
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type} alert-dismissible fade show position-fixed top-0 end-0 m-3`;
    alertDiv.style.zIndex = '9999';
    alertDiv.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    document.body.appendChild(alertDiv);
    
    // Auto dismiss after 5 seconds
    setTimeout(() => {
        alertDiv.remove();
    }, 5000);
}

// Utility functions
function showSuccess(message) {
    showMessage(message, 'success');
}

function showError(message) {
    showMessage(message, 'danger');
}

// Logout
async function logout() {
    try {
        const supabaseUrl = 'https://topikrqamdglxakppbyg.supabase.co';
        const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRvcGlrcnFhbWRnbHhha3BwYnlnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDE2MDA5ODEsImV4cCI6MjA1NzE3Njk4MX0.rr-cXk_vlf6HKtCkoUzdbuol1tSusvOq2nMyXgYWSCY';
        const supabase = window.supabase.createClient(supabaseUrl, supabaseKey);
        
        await supabase.auth.signOut();
        localStorage.removeItem('adminToken');
        window.location.href = '/admin/login.html';
    } catch (error) {
        console.error('Error during logout:', error);
        // Still redirect to login even if there's an error
        window.location.href = '/admin/login.html';
    }
}

// Edit user function
async function editUser(userId) {
    try {
        const response = await fetch(`/api/admin/users/${userId}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to fetch user');
        }
        
        const user = await response.json();
        
        // Populate edit modal with user data
        document.getElementById('editUserFullName').value = user.full_name || '';
        document.getElementById('editUserEmail').value = user.email || '';
        document.getElementById('editUserRole').value = user.role || 'customer';
        document.getElementById('editUserId').value = userId;
        
        // Show edit modal
        const editUserModal = new bootstrap.Modal(document.getElementById('editUserModal'));
        editUserModal.show();
    } catch (error) {
        console.error('Error fetching user:', error);
        showMessage(error.message || 'Failed to fetch user details', 'danger');
    }
}

// Update user function
async function updateUser() {
    try {
        const userId = document.getElementById('editUserId').value;
        const fullName = document.getElementById('editUserFullName').value;
        const role = document.getElementById('editUserRole').value;
        
        const response = await fetch(`/api/admin/users/${userId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                full_name: fullName,
                role: role
            })
        });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to update user');
        }
        
        // Close modal and reload users
        const editUserModal = bootstrap.Modal.getInstance(document.getElementById('editUserModal'));
        editUserModal.hide();
        loadUsers();
        showMessage('User updated successfully', 'success');
    } catch (error) {
        console.error('Error updating user:', error);
        showMessage(error.message || 'Failed to update user', 'danger');
    }
}

// Delete user function
async function deleteUser(userId) {
    if (!confirm('Are you sure you want to delete this user?')) return;
    
    try {
        const response = await fetch(`/api/admin/users/${userId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (!response.ok) throw new Error('Failed to delete user');
        
        loadUsers();
        showSuccess('User deleted successfully');
    } catch (error) {
        console.error('Error deleting user:', error);
        showError('Failed to delete user');
    }
}

// Edit subscription
async function editSubscription(id) {
    try {
        const response = await fetch(`/api/subscriptions/${id}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (!response.ok) throw new Error('Failed to fetch subscription');
        
        const subscription = await response.json();
        
        // Populate form
        const form = document.getElementById('addSubscriptionForm');
        form.name.value = subscription.name;
        form.description.value = subscription.description;
        form.price.value = subscription.price;
        form.duration_days.value = subscription.duration_days;
        form.features.value = subscription.features.join('\n');
        form.benefits.value = subscription.benefits.join('\n');
        form.restrictions.value = subscription.restrictions.join('\n');
        form.is_active.checked = subscription.is_active;

        // Handle image preview
        const currentImageDiv = document.getElementById('currentImage');
        const currentImageImg = currentImageDiv.querySelector('img');
        if (subscription.image_url) {
            currentImageImg.src = subscription.image_url;
            currentImageDiv.style.display = 'block';
        } else {
            currentImageDiv.style.display = 'none';
        }
        
        // Update modal title and button
        document.querySelector('#addSubscriptionModal .modal-title').textContent = 'Edit Subscription';
        document.querySelector('#addSubscriptionModal .modal-footer .btn-primary').textContent = 'Update Subscription';
        document.querySelector('#addSubscriptionModal .modal-footer .btn-primary').onclick = () => updateSubscription(id);
        
        // Show modal
        const modal = new bootstrap.Modal(document.getElementById('addSubscriptionModal'));
        modal.show();
    } catch (error) {
        console.error('Error fetching subscription:', error);
        showError('Failed to fetch subscription details');
    }
}

// Update subscription
async function updateSubscription(id) {
    const form = document.getElementById('addSubscriptionForm');
    const formData = new FormData(form);
    
    try {
        // Show loading state
        const submitButton = document.querySelector('#addSubscriptionModal .modal-footer .btn-primary');
        submitButton.disabled = true;
        submitButton.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Updating...';

        // Convert features, benefits, and restrictions from newline-separated text to arrays
        const features = formData.get('features').split('\n').filter(f => f.trim());
        const benefits = formData.get('benefits').split('\n').filter(b => b.trim());
        const restrictions = formData.get('restrictions').split('\n').filter(r => r.trim());

        // Create multipart form data with all required fields
        const data = new FormData();
        data.append('name', formData.get('name'));
        data.append('description', formData.get('description'));
        data.append('price', formData.get('price'));
        data.append('duration_days', formData.get('duration_days'));
        data.append('features', JSON.stringify(features));
        data.append('benefits', JSON.stringify(benefits));
        data.append('restrictions', JSON.stringify(restrictions));
        data.append('is_active', formData.get('is_active') === 'true');

        // Append image if selected
        const imageFile = formData.get('image');
        if (imageFile && imageFile.size > 0) {
            data.append('image', imageFile);
        }

        const response = await fetch(`/api/subscriptions/${id}`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`
            },
            body: data
        });
        
        const result = await response.json();
        
        if (!response.ok) {
            throw new Error(result.error || 'Failed to update subscription');
        }
        
        const modal = bootstrap.Modal.getInstance(document.getElementById('addSubscriptionModal'));
        modal.hide();
        form.reset();
        loadSubscriptions();
        showMessage('Subscription updated successfully', 'success');
    } catch (error) {
        console.error('Error updating subscription:', error);
        showMessage(error.message || 'Failed to update subscription', 'danger');
    } finally {
        // Reset button state
        const submitButton = document.querySelector('#addSubscriptionModal .modal-footer .btn-primary');
        submitButton.disabled = false;
        submitButton.textContent = 'Update Subscription';
    }
}

// Remove image from subscription
function removeImage() {
    const currentImageDiv = document.getElementById('currentImage');
    currentImageDiv.style.display = 'none';
    currentImageDiv.querySelector('img').src = '';
    document.getElementById('image').value = '';
}

// Delete subscription
async function deleteSubscription(id) {
    if (!confirm('Are you sure you want to delete this subscription?')) {
        return;
    }
    
    try {
        const response = await fetch(`/api/subscriptions/${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to delete subscription');
        }
        
        loadSubscriptions();
        showSuccess('Subscription deleted successfully');
    } catch (error) {
        console.error('Error deleting subscription:', error);
        showError(error.message || 'Failed to delete subscription');
    }
}

// Add subscription
async function addSubscription() {
    const form = document.getElementById('addSubscriptionForm');
    const formData = new FormData(form);
    
    try {
        // Show loading state
        const submitButton = document.querySelector('#addSubscriptionModal .modal-footer .btn-primary');
        submitButton.disabled = true;
        submitButton.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Adding...';

        // Convert features, benefits, and restrictions from newline-separated text to arrays
        const features = formData.get('features').split('\n').filter(f => f.trim());
        const benefits = formData.get('benefits').split('\n').filter(b => b.trim());
        const restrictions = formData.get('restrictions').split('\n').filter(r => r.trim());

        // Create multipart form data with all required fields
        const data = new FormData();
        data.append('name', formData.get('name'));
        data.append('description', formData.get('description'));
        data.append('price', formData.get('price'));
        data.append('duration_days', formData.get('duration_days'));
        data.append('features', JSON.stringify(features));
        data.append('benefits', JSON.stringify(benefits));
        data.append('restrictions', JSON.stringify(restrictions));
        data.append('is_active', formData.get('is_active') === 'true');

        // Append image if selected
        const imageFile = formData.get('image');
        if (imageFile && imageFile.size > 0) {
            data.append('image', imageFile);
        }

        const response = await fetch('/api/subscriptions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            },
            body: data
        });
        
        const result = await response.json();
        
        if (!response.ok) {
            throw new Error(result.error || 'Failed to add subscription');
        }
        
        const modal = bootstrap.Modal.getInstance(document.getElementById('addSubscriptionModal'));
        modal.hide();
        form.reset();
        loadSubscriptions();
        showMessage('Subscription added successfully', 'success');
    } catch (error) {
        console.error('Error adding subscription:', error);
        showMessage(error.message || 'Failed to add subscription', 'danger');
    } finally {
        // Reset button state
        const submitButton = document.querySelector('#addSubscriptionModal .modal-footer .btn-primary');
        submitButton.disabled = false;
        submitButton.textContent = 'Add Subscription';
    }
}

// Add product
async function addProduct(event) {
    if (event) {
        event.preventDefault();
    }

    try {
        const form = document.getElementById('addProductForm');
        const formData = new FormData(form);

        // Validate required fields
        const requiredFields = ['name', 'description', 'price', 'category', 'image'];
        for (const field of requiredFields) {
            if (!formData.get(field)) {
                throw new Error(`Please provide ${field.replace('_', ' ')}`);
            }
        }

        // Validate price is a positive number
        const price = parseFloat(formData.get('price'));
        if (isNaN(price) || price <= 0) {
            throw new Error('Price must be a positive number');
        }

        // Convert checkbox values to boolean
        formData.set('is_available', formData.get('isAvailable') === 'on');
        formData.set('is_pre_order', formData.get('isPreOrder') === 'on');
        
        // Remove old checkbox fields
        formData.delete('isAvailable');
        formData.delete('isPreOrder');

        const response = await fetch('/api/admin/products', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            },
            body: formData
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to add product');
        }

        // Close modal and refresh products list
        const modal = bootstrap.Modal.getInstance(document.getElementById('addProductModal'));
        modal.hide();
        form.reset();
        loadProducts();
        showSuccess('Product added successfully');
    } catch (error) {
        console.error('Error adding product:', error);
        showError(error.message || 'Failed to add product');
    }
}