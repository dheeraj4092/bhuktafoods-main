// Global variables
let currentUser = null;
let token = localStorage.getItem('adminToken');

// Check authentication on page load
document.addEventListener('DOMContentLoaded', () => {
    if (!token) {
        window.location.href = '/admin/login.html';
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

// Load dashboard data
async function loadDashboardData() {
    try {
        const response = await fetch('/api/admin/dashboard', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (!response.ok) throw new Error('Failed to load dashboard data');
        
        const data = await response.json();
        document.getElementById('total-users').textContent = data.totalUsers;
        document.getElementById('total-products').textContent = data.totalProducts;
        document.getElementById('total-orders').textContent = data.totalOrders;
    } catch (error) {
        console.error('Error loading dashboard data:', error);
        showError('Failed to load dashboard data');
    }
}

// Load users
async function loadUsers() {
    try {
        const response = await fetch('/api/admin/users', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (!response.ok) throw new Error('Failed to load users');
        
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
                <td>${order.customer_name}</td>
                <td>$${order.total.toFixed(2)}</td>
                <td>${order.status}</td>
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
        const response = await fetch(`/api/subscriptions/${subscriptionId}`, {
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

// Add new product
async function addProduct(event) {
    event.preventDefault();
    
    const form = event.target;
    const formData = new FormData(form);
    
    try {
        // Show loading state
        const submitButton = form.querySelector('button[type="submit"]');
        const originalText = submitButton.innerHTML;
        submitButton.disabled = true;
        submitButton.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Uploading...';

        const response = await fetch('/api/admin/products', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            },
            body: formData
        });

        if (!response.ok) {
            const result = await response.json();
            throw new Error(result.error || result.message || 'Failed to add product');
        }

        const result = await response.json();
        console.log('Product added successfully:', result);
        
        // Reset form
        form.reset();
        
        // Close modal
        const modal = bootstrap.Modal.getInstance(document.getElementById('addProductModal'));
        modal.hide();
        
        // Show success message
        showMessage('Product added successfully!', 'success');
        
        // Reload products table
        loadProducts();
    } catch (error) {
        console.error('Error adding product:', error);
        showMessage(error.message || 'Failed to add product', 'danger');
    } finally {
        // Reset button state
        const submitButton = form.querySelector('button[type="submit"]');
        submitButton.disabled = false;
        submitButton.innerHTML = 'Add Product';
    }
}

// Add new subscription
async function addSubscription() {
    const form = document.getElementById('addSubscriptionForm');
    const formData = new FormData(form);
    
    try {
        // Show loading state
        const submitButton = document.querySelector('#addSubscriptionModal .modal-footer .btn-primary');
        const originalText = submitButton.textContent;
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

        // Create the request body as JSON
        const requestBody = {
            name: formData.get('name'),
            description: formData.get('description'),
            price: parseFloat(formData.get('price')),
            duration_days: parseInt(formData.get('duration_days')),
            features: features,
            benefits: benefits,
            restrictions: restrictions,
            is_active: formData.get('is_active') === 'true'
        };

        // Handle image separately if present
        const imageFile = formData.get('image');
        if (imageFile && imageFile.size > 0) {
            const imageData = new FormData();
            imageData.append('image', imageFile);
            
            // First upload the image
            const imageResponse = await fetch(`/api/subscriptions/${id}/image`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: imageData
            });
            
            if (!imageResponse.ok) {
                const imageError = await imageResponse.json();
                throw new Error(imageError.message || 'Failed to upload image');
            }
            
            const imageResult = await imageResponse.json();
            requestBody.image_url = imageResult.image_url;
        }

        // First verify the subscription exists
        const checkResponse = await fetch(`/api/subscriptions/${id}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!checkResponse.ok) {
            throw new Error('Subscription not found');
        }

        // Update the subscription
        const response = await fetch(`/api/subscriptions/${id}`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestBody)
        });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to update subscription');
        }

        const result = await response.json();
        
        const modal = bootstrap.Modal.getInstance(document.getElementById('addSubscriptionModal'));
        modal.hide();
        form.reset();
        
        // Reset modal title and button
        document.querySelector('#addSubscriptionModal .modal-title').textContent = 'Add New Subscription';
        document.querySelector('#addSubscriptionModal .modal-footer .btn-primary').textContent = 'Add Subscription';
        document.querySelector('#addSubscriptionModal .modal-footer .btn-primary').onclick = addSubscription;
        
        loadSubscriptions();
        showSuccess('Subscription updated successfully');
    } catch (error) {
        console.error('Error updating subscription:', error);
        showError(error.message || 'Failed to update subscription');
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
        
        if (!response.ok) throw new Error('Failed to delete subscription');
        
        loadSubscriptions();
        showSuccess('Subscription deleted successfully');
    } catch (error) {
        console.error('Error deleting subscription:', error);
        showError('Failed to delete subscription');
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
function logout() {
    localStorage.removeItem('adminToken');
    window.location.href = '/admin/login.html';
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

// Edit product function
async function editProduct(productId) {
    try {
        const response = await fetch(`/api/admin/product/${productId}`, {
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

        // Safely set form values with null checks
        const setFormValue = (name, value) => {
            const element = form.querySelector(`[name="${name}"]`);
            if (element) {
                if (element.type === 'checkbox') {
                    element.checked = value || false;
                } else {
                    element.value = value || '';
                }
            }
        };

        // Set all form values
        setFormValue('productId', productId);
        setFormValue('name', product.name);
        setFormValue('description', product.description);
        setFormValue('price', product.price);
        setFormValue('stock', product.stock_quantity);
        setFormValue('category', product.category || 'snacks');
        setFormValue('isAvailable', product.is_available);
        setFormValue('isPreOrder', product.is_pre_order);

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
    event.preventDefault();
    
    try {
        const form = event.target;
        const formData = new FormData(form);
        const productId = formData.get('productId');

        if (!productId) {
            throw new Error('Product ID is missing');
        }

        // Show loading state
        const submitButton = form.querySelector('button[type="submit"]');
        const originalText = submitButton.innerHTML;
        submitButton.disabled = true;
        submitButton.innerHTML = 'Updating...';

        const response = await fetch(`/api/admin/products/${productId}`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`
            },
            body: formData // Using FormData to handle file uploads properly
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
        const submitButton = form.querySelector('button[type="submit"]');
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
        
        if (!response.ok) throw new Error('Failed to delete product');
        
        loadProducts();
        showSuccess('Product deleted successfully');
    } catch (error) {
        console.error('Error deleting product:', error);
        showError('Failed to delete product');
    }
} 