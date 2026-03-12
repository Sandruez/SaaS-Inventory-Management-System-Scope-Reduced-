// StockFlow MVP - Production Ready
// Main Application JavaScript

// Global variables
const API_BASE = window.location.origin;
let authToken = null;
let currentUser = null;
let products = [];
let settings = {};

// Initialize app
document.addEventListener('DOMContentLoaded', function() {
    // Load auth from localStorage
    authToken = localStorage.getItem('authToken');
    const userStr = localStorage.getItem('currentUser');
    currentUser = userStr ? JSON.parse(userStr) : null;
    
    // Hide loading screen after a short delay
    setTimeout(() => {
        document.getElementById('loadingScreen').classList.add('hidden');
        document.getElementById('app').classList.remove('hidden');
        
        // Check authentication and show appropriate page
        if (authToken && currentUser) {
            updateUserDisplays();
            showPage('dashboard');
        } else {
            showPage('signup');
        }
    }, 1000);
});

// Page navigation
function showPage(pageId) {
    // Hide all pages
    document.querySelectorAll('.page').forEach(page => {
        page.classList.add('hidden');
    });
    
    // Show requested page
    const targetPage = document.getElementById(pageId + 'Page');
    if (targetPage) {
        targetPage.classList.remove('hidden');
        
        // Load page-specific data
        if (pageId === 'dashboard' && authToken) {
            loadDashboard();
        } else if (pageId === 'products' && authToken) {
            loadProducts();
        } else if (pageId === 'settings' && authToken) {
            loadSettings();
        }
    }
}

// Update user displays
function updateUserDisplays() {
    if (currentUser) {
        // Update user name displays
        document.querySelectorAll('.userName').forEach(el => {
            el.textContent = currentUser.name;
        });
        
        // Update organization displays
        document.querySelectorAll('.orgName').forEach(el => {
            el.textContent = currentUser.organization?.name || 'Organization';
        });
    }
}

// API call helper
async function apiCall(method, endpoint, data = null) {
    try {
        const config = {
            method,
            url: `${API_BASE}/api${endpoint}`,
            headers: {
                'Content-Type': 'application/json',
            }
        };

        if (authToken) {
            config.headers.Authorization = `Bearer ${authToken}`;
        }

        if (data) {
            config.data = data;
        }

        const response = await axios(config);
        return response.data;
    } catch (error) {
        console.error('API Error:', error);
        if (error.response?.status === 401) {
            logout();
        }
        throw error.response?.data || { error: 'Network error' };
    }
}

// Authentication functions
async function handleSignup(event) {
    event.preventDefault();
    
    const orgName = document.getElementById('signupOrgName').value.trim();
    const email = document.getElementById('signupEmail').value.trim();
    const password = document.getElementById('signupPassword').value;
    const confirmPassword = document.getElementById('signupConfirmPassword').value;
    
    if (password !== confirmPassword) {
        showNotification('Passwords do not match', 'error');
        return;
    }
    
    if (password.length < 6) {
        showNotification('Password must be at least 6 characters', 'error');
        return;
    }
    
    try {
        const response = await apiCall('POST', '/auth/signup', {
            orgName,
            email,
            password
        });
        
        authToken = response.token;
        currentUser = response.user;
        
        localStorage.setItem('authToken', authToken);
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        
        updateUserDisplays();
        showNotification('Account created successfully!', 'success');
        showPage('dashboard');
    } catch (error) {
        showNotification(error.error || 'Signup failed', 'error');
    }
}

async function handleLogin(event) {
    event.preventDefault();
    
    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value;
    
    try {
        const response = await apiCall('POST', '/auth/login', {
            email,
            password
        });
        
        authToken = response.token;
        currentUser = response.user;
        
        localStorage.setItem('authToken', authToken);
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        
        updateUserDisplays();
        showNotification('Login successful!', 'success');
        showPage('dashboard');
    } catch (error) {
        showNotification(error.error || 'Login failed', 'error');
    }
}

function logout() {
    authToken = null;
    currentUser = null;
    
    localStorage.removeItem('authToken');
    localStorage.removeItem('currentUser');
    
    showPage('signup');
    showNotification('Logged out successfully', 'info');
}

// Dashboard functions
async function loadDashboard() {
    try {
        const response = await apiCall('GET', '/dashboard');
        
        // Update summary cards
        document.getElementById('totalProducts').textContent = response.summary.totalProducts;
        document.getElementById('lowStockItems').textContent = response.summary.lowStockItems;
        document.getElementById('totalQuantity').textContent = response.summary.totalQuantity;
        
        // Update low stock table
        const lowStockTable = document.getElementById('lowStockTable');
        if (lowStockTable) {
            lowStockTable.innerHTML = response.lowStockProducts.map(product => `
                <tr>
                    <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">${product.name}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${product.sku}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${product.quantity}</td>
                    <td class="px-6 py-4 whitespace-nowrap">
                        <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                            Low Stock
                        </span>
                    </td>
                </tr>
            `).join('');
        }
    } catch (error) {
        showNotification('Failed to load dashboard data', 'error');
    }
}

// Products functions
async function loadProducts() {
    try {
        products = await apiCall('GET', '/products');
        displayProducts();
    } catch (error) {
        showNotification('Failed to load products', 'error');
    }
}

function displayProducts() {
    const productsTable = document.getElementById('productsTable');
    if (productsTable) {
        productsTable.innerHTML = products.map(product => `
            <tr>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">${product.name}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${product.sku}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${product.quantity_on_hand}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">$${product.cost_price}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">$${product.selling_price}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button onclick="editProduct(${product.id})" class="text-indigo-600 hover:text-indigo-900 mr-3">Edit</button>
                    <button onclick="deleteProduct(${product.id})" class="text-red-600 hover:text-red-900">Delete</button>
                </td>
            </tr>
        `).join('');
    }
}

function showAddProductModal() {
    document.getElementById('productModal').classList.remove('hidden');
    document.getElementById('modalTitle').textContent = 'Add Product';
    document.getElementById('productForm').reset();
}

function editProduct(productId) {
    const product = products.find(p => p.id === productId);
    if (product) {
        document.getElementById('productModal').classList.remove('hidden');
        document.getElementById('modalTitle').textContent = 'Edit Product';
        
        document.getElementById('productName').value = product.name;
        document.getElementById('productSku').value = product.sku;
        document.getElementById('productDescription').value = product.description;
        document.getElementById('productQuantity').value = product.quantity_on_hand;
        document.getElementById('productThreshold').value = product.low_stock_threshold;
        document.getElementById('productCostPrice').value = product.cost_price;
        document.getElementById('productSellingPrice').value = product.selling_price;
        
        document.getElementById('productForm').dataset.productId = productId;
    }
}

function closeProductModal() {
    document.getElementById('productModal').classList.add('hidden');
    document.getElementById('productForm').reset();
    delete document.getElementById('productForm').dataset.productId;
}

async function saveProduct(event) {
    event.preventDefault();
    
    const formData = {
        name: document.getElementById('productName').value.trim(),
        sku: document.getElementById('productSku').value.trim(),
        description: document.getElementById('productDescription').value.trim(),
        quantityOnHand: parseInt(document.getElementById('productQuantity').value) || 0,
        lowStockThreshold: parseInt(document.getElementById('productThreshold').value) || 5,
        costPrice: parseFloat(document.getElementById('productCostPrice').value) || 0,
        sellingPrice: parseFloat(document.getElementById('productSellingPrice').value) || 0
    };
    
    try {
        const productId = document.getElementById('productForm').dataset.productId;
        
        if (productId) {
            await apiCall('PUT', `/products/${productId}`, formData);
            showNotification('Product updated successfully!', 'success');
        } else {
            await apiCall('POST', '/products', formData);
            showNotification('Product added successfully!', 'success');
        }
        
        closeProductModal();
        loadProducts();
    } catch (error) {
        showNotification(error.error || 'Failed to save product', 'error');
    }
}

async function deleteProduct(productId) {
    const product = products.find(p => p.id === productId);
    if (product && confirm(`Are you sure you want to delete ${product.name}?`)) {
        try {
            await apiCall('DELETE', `/products/${productId}`);
            loadProducts();
            showNotification('Product deleted successfully!', 'success');
        } catch (error) {
            showNotification(error.error || 'Failed to delete product', 'error');
        }
    }
}

// Settings functions
async function loadSettings() {
    try {
        const response = await apiCall('GET', '/settings');
        settings = response;
        
        document.getElementById('lowStockThreshold').value = settings.lowStockThreshold || 5;
        document.getElementById('currency').value = settings.currency || 'USD';
        document.getElementById('timezone').value = settings.timezone || 'UTC';
    } catch (error) {
        showNotification('Failed to load settings', 'error');
    }
}

async function saveSettings(event) {
    event.preventDefault();
    
    const formData = {
        lowStockThreshold: parseInt(document.getElementById('lowStockThreshold').value) || 5,
        currency: document.getElementById('currency').value.trim(),
        timezone: document.getElementById('timezone').value.trim(),
        emailNotifications: document.getElementById('emailNotifications').checked,
        lowStockAlerts: document.getElementById('lowStockAlerts').checked
    };
    
    try {
        await apiCall('PUT', '/settings', formData);
        showNotification('Settings saved successfully!', 'success');
    } catch (error) {
        showNotification(error.error || 'Failed to save settings', 'error');
    }
}

// Utility functions
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `fixed top-4 right-4 p-4 rounded-md shadow-lg z-50 fade-in ${
        type === 'success' ? 'bg-green-50 border border-green-200 text-green-600' : 
        type === 'error' ? 'bg-red-50 border border-red-200 text-red-600' : 
        'bg-blue-50 border border-blue-200 text-blue-600'
    }`;
    notification.innerHTML = `
        <div class="flex">
            <div class="flex-shrink-0">
                ${type === 'success' ? '✅' : type === 'error' ? '❌' : 'ℹ️'}
            </div>
            <div class="ml-3">
                <p class="text-sm font-medium">${message}</p>
            </div>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// Setup search functionality
document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('productSearch')?.addEventListener('input', filterProducts);
});

function filterProducts() {
    const searchTerm = document.getElementById('productSearch').value.toLowerCase();
    const filteredProducts = products.filter(product => 
        product.name.toLowerCase().includes(searchTerm) ||
        product.sku.toLowerCase().includes(searchTerm) ||
        product.description.toLowerCase().includes(searchTerm)
    );
    
    const productsTable = document.getElementById('productsTable');
    if (productsTable) {
        productsTable.innerHTML = filteredProducts.map(product => `
            <tr>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">${product.name}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${product.sku}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${product.quantity_on_hand}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">$${product.cost_price}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">$${product.selling_price}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button onclick="editProduct(${product.id})" class="text-indigo-600 hover:text-indigo-900 mr-3">Edit</button>
                    <button onclick="deleteProduct(${product.id})" class="text-red-600 hover:text-red-900">Delete</button>
                </td>
            </tr>
        `).join('');
    }
}
