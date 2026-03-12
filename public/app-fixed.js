// StockFlow MVP - Production Ready - FIXED VERSION
// Main Application JavaScript

// Global variables
const API_BASE = window.location.origin;
let authToken = null;
let currentUser = null;
let products = [];
let settings = {};

// Initialize app
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 StockFlow initializing...');
    
    // Load auth from localStorage
    authToken = localStorage.getItem('authToken');
    const userStr = localStorage.getItem('currentUser');
    currentUser = userStr ? JSON.parse(userStr) : null;
    
    console.log('📱 Auth status:', { hasToken: !!authToken, hasUser: !!currentUser });
    
    // Hide loading screen after a short delay
    setTimeout(() => {
        const loadingScreen = document.getElementById('loadingScreen');
        const app = document.getElementById('app');
        
        if (loadingScreen) loadingScreen.classList.add('hidden');
        if (app) app.classList.remove('hidden');
        
        console.log('✅ Loading screen hidden, app shown');
        
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
    console.log('🔄 Navigating to page:', pageId);
    
    // Hide all pages
    document.querySelectorAll('.page').forEach(page => {
        page.classList.add('hidden');
    });
    
    // Show requested page
    const targetPage = document.getElementById(pageId + 'Page');
    if (targetPage) {
        targetPage.classList.remove('hidden');
        console.log('✅ Page shown:', pageId);
        
        // Load page-specific data
        if (pageId === 'dashboard' && authToken) {
            loadDashboard();
        } else if (pageId === 'products' && authToken) {
            loadProducts();
        } else if (pageId === 'settings' && authToken) {
            loadSettings();
        }
    } else {
        console.error('❌ Page not found:', pageId + 'Page');
    }
}

// Update user displays
function updateUserDisplays() {
    if (currentUser) {
        // Update user name displays
        document.querySelectorAll('.userName').forEach(el => {
            el.textContent = currentUser.name || 'User';
        });
        
        // Update organization displays
        document.querySelectorAll('.orgName').forEach(el => {
            el.textContent = currentUser.organization?.name || currentUser.organizationName || 'Organization';
        });
        
        console.log('👤 User displays updated');
    }
}

// API call helper
async function apiCall(method, endpoint, data = null) {
    try {
        console.log('🌐 API Call:', { method, endpoint, hasData: !!data });
        
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
        console.log('✅ API Response:', response.data);
        return response.data;
    } catch (error) {
        console.error('❌ API Error:', error);
        if (error.response?.status === 401) {
            logout();
        }
        throw error.response?.data || { error: 'Network error' };
    }
}

// Authentication functions
async function handleSignup(event) {
    event.preventDefault();
    console.log('📝 Signup initiated');
    
    const orgName = document.getElementById('signupOrgName')?.value?.trim();
    const email = document.getElementById('signupEmail')?.value?.trim();
    const password = document.getElementById('signupPassword')?.value;
    const confirmPassword = document.getElementById('signupConfirmPassword')?.value;
    
    if (!orgName || !email || !password || !confirmPassword) {
        showNotification('Please fill in all fields', 'error');
        return;
    }
    
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
    console.log('🔐 Login initiated');
    
    const email = document.getElementById('loginEmail')?.value?.trim();
    const password = document.getElementById('loginPassword')?.value;
    
    if (!email || !password) {
        showNotification('Please fill in all fields', 'error');
        return;
    }
    
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
    console.log('🚪 Logout initiated');
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
        console.log('📊 Loading dashboard...');
        const response = await apiCall('GET', '/dashboard');
        
        // Update summary cards
        const totalProductsEl = document.getElementById('totalProducts');
        const lowStockItemsEl = document.getElementById('lowStockItems');
        const totalQuantityEl = document.getElementById('totalQuantity');
        
        if (totalProductsEl) totalProductsEl.textContent = response.summary?.totalProducts || 0;
        if (lowStockItemsEl) lowStockItemsEl.textContent = response.summary?.lowStockItems || 0;
        if (totalQuantityEl) totalQuantityEl.textContent = response.summary?.totalQuantity || 0;
        
        // Update low stock table
        const lowStockTable = document.getElementById('lowStockTable');
        if (lowStockTable && response.lowStockProducts) {
            lowStockTable.innerHTML = response.lowStockProducts.map(product => `
                <tr>
                    <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">${product.name || 'N/A'}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${product.sku || 'N/A'}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${product.quantity || product.quantity_on_hand || 0}</td>
                    <td class="px-6 py-4 whitespace-nowrap">
                        <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                            Low Stock
                        </span>
                    </td>
                </tr>
            `).join('');
        }
        
        console.log('✅ Dashboard loaded');
    } catch (error) {
        console.error('❌ Dashboard load error:', error);
        showNotification('Failed to load dashboard data', 'error');
    }
}

// Products functions
async function loadProducts() {
    try {
        console.log('📦 Loading products...');
        products = await apiCall('GET', '/products');
        console.log('📦 Products loaded:', products.length);
        displayProducts();
    } catch (error) {
        console.error('❌ Products load error:', error);
        showNotification('Failed to load products', 'error');
    }
}

function displayProducts() {
    const productsTable = document.getElementById('productsTable');
    if (productsTable) {
        if (products.length === 0) {
            productsTable.innerHTML = `
                <tr>
                    <td colspan="6" class="px-6 py-4 text-center text-gray-500">
                        No products found. Click "Add Product" to get started.
                    </td>
                </tr>
            `;
            return;
        }
        
        productsTable.innerHTML = products.map(product => `
            <tr>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">${product.name || 'N/A'}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${product.sku || 'N/A'}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${product.quantity_on_hand || product.quantity || 0}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">$${(product.cost_price || 0).toFixed(2)}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">$${(product.selling_price || 0).toFixed(2)}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button onclick="editProduct(${product.id})" class="text-indigo-600 hover:text-indigo-900 mr-3">Edit</button>
                    <button onclick="deleteProduct(${product.id})" class="text-red-600 hover:text-red-900">Delete</button>
                </td>
            </tr>
        `).join('');
        
        console.log('✅ Products displayed:', products.length);
    } else {
        console.error('❌ Products table not found');
    }
}

function showAddProductModal() {
    console.log('➕ Showing add product modal');
    const modal = document.getElementById('productModal');
    const modalTitle = document.getElementById('modalTitle');
    const productForm = document.getElementById('productForm');
    
    if (modal && modalTitle && productForm) {
        modal.classList.remove('hidden');
        modalTitle.textContent = 'Add Product';
        productForm.reset();
        delete productForm.dataset.productId;
    } else {
        console.error('❌ Modal elements not found');
    }
}

function editProduct(productId) {
    console.log('✏️ Editing product:', productId);
    const product = products.find(p => p.id === productId);
    if (product) {
        const modal = document.getElementById('productModal');
        const modalTitle = document.getElementById('modalTitle');
        const productForm = document.getElementById('productForm');
        
        if (modal && modalTitle && productForm) {
            modal.classList.remove('hidden');
            modalTitle.textContent = 'Edit Product';
            
            // Populate form fields
            const nameEl = document.getElementById('productName');
            const skuEl = document.getElementById('productSku');
            const descEl = document.getElementById('productDescription');
            const qtyEl = document.getElementById('productQuantity');
            const threshEl = document.getElementById('productThreshold');
            const costEl = document.getElementById('productCostPrice');
            const sellEl = document.getElementById('productSellingPrice');
            
            if (nameEl) nameEl.value = product.name || '';
            if (skuEl) skuEl.value = product.sku || '';
            if (descEl) descEl.value = product.description || '';
            if (qtyEl) qtyEl.value = product.quantity_on_hand || product.quantity || 0;
            if (threshEl) threshEl.value = product.low_stock_threshold || product.threshold || 5;
            if (costEl) costEl.value = product.cost_price || 0;
            if (sellEl) sellEl.value = product.selling_price || 0;
            
            productForm.dataset.productId = productId;
        } else {
            console.error('❌ Modal elements not found for editing');
        }
    } else {
        showNotification('Product not found', 'error');
    }
}

function closeProductModal() {
    console.log('❌ Closing product modal');
    const modal = document.getElementById('productModal');
    const productForm = document.getElementById('productForm');
    
    if (modal) {
        modal.classList.add('hidden');
    }
    if (productForm) {
        productForm.reset();
        delete productForm.dataset.productId;
    }
}

async function saveProduct(event) {
    event.preventDefault();
    console.log('💾 Saving product...');
    
    const productForm = document.getElementById('productForm');
    if (!productForm) {
        showNotification('Product form not found', 'error');
        return;
    }
    
    const formData = {
        name: document.getElementById('productName')?.value?.trim(),
        sku: document.getElementById('productSku')?.value?.trim(),
        description: document.getElementById('productDescription')?.value?.trim(),
        quantityOnHand: parseInt(document.getElementById('productQuantity')?.value) || 0,
        lowStockThreshold: parseInt(document.getElementById('productThreshold')?.value) || 5,
        costPrice: parseFloat(document.getElementById('productCostPrice')?.value) || 0,
        sellingPrice: parseFloat(document.getElementById('productSellingPrice')?.value) || 0
    };
    
    if (!formData.name || !formData.sku) {
        showNotification('Product name and SKU are required', 'error');
        return;
    }
    
    try {
        const productId = productForm.dataset.productId;
        
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
        console.error('❌ Save product error:', error);
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
            console.error('❌ Delete product error:', error);
            showNotification(error.error || 'Failed to delete product', 'error');
        }
    }
}

// Settings functions
async function loadSettings() {
    try {
        console.log('⚙️ Loading settings...');
        const response = await apiCall('GET', '/settings');
        settings = response.settings || response;
        
        const lowStockEl = document.getElementById('lowStockThreshold');
        const currencyEl = document.getElementById('currency');
        const timezoneEl = document.getElementById('timezone');
        const emailNotifEl = document.getElementById('emailNotifications');
        const lowStockAlertEl = document.getElementById('lowStockAlerts');
        
        if (lowStockEl) lowStockEl.value = settings.lowStockThreshold || settings.low_stock_threshold || 5;
        if (currencyEl) currencyEl.value = settings.currency || 'USD';
        if (timezoneEl) timezoneEl.value = settings.timezone || 'UTC';
        if (emailNotifEl) emailNotifEl.checked = settings.emailNotifications !== false;
        if (lowStockAlertEl) lowStockAlertEl.checked = settings.lowStockAlerts !== false;
        
        console.log('✅ Settings loaded');
    } catch (error) {
        console.error('❌ Settings load error:', error);
        showNotification('Failed to load settings', 'error');
    }
}

async function saveSettings(event) {
    event.preventDefault();
    console.log('💾 Saving settings...');
    
    const formData = {
        lowStockThreshold: parseInt(document.getElementById('lowStockThreshold')?.value) || 5,
        currency: document.getElementById('currency')?.value?.trim() || 'USD',
        timezone: document.getElementById('timezone')?.value?.trim() || 'UTC',
        emailNotifications: document.getElementById('emailNotifications')?.checked || false,
        lowStockAlerts: document.getElementById('lowStockAlerts')?.checked || false
    };
    
    try {
        await apiCall('PUT', '/settings', formData);
        showNotification('Settings saved successfully!', 'success');
    } catch (error) {
        console.error('❌ Save settings error:', error);
        showNotification(error.error || 'Failed to save settings', 'error');
    }
}

// Utility functions
function showNotification(message, type = 'info') {
    console.log('🔔 Notification:', { message, type });
    
    const notification = document.createElement('div');
    notification.className = `fixed top-4 right-4 p-4 rounded-md shadow-lg z-50 transition-all duration-300 ${
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
    
    // Auto-remove after 3 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.remove();
        }
    }, 3000);
}

// Setup search functionality
document.addEventListener('DOMContentLoaded', function() {
    const searchInput = document.getElementById('productSearch');
    if (searchInput) {
        searchInput.addEventListener('input', filterProducts);
        console.log('🔍 Search functionality initialized');
    }
});

function filterProducts() {
    const searchTerm = document.getElementById('productSearch')?.value?.toLowerCase() || '';
    const filteredProducts = products.filter(product => 
        (product.name || '').toLowerCase().includes(searchTerm) ||
        (product.sku || '').toLowerCase().includes(searchTerm) ||
        (product.description || '').toLowerCase().includes(searchTerm)
    );
    
    const productsTable = document.getElementById('productsTable');
    if (productsTable) {
        if (filteredProducts.length === 0) {
            productsTable.innerHTML = `
                <tr>
                    <td colspan="6" class="px-6 py-4 text-center text-gray-500">
                        No products found matching "${searchTerm}"
                    </td>
                </tr>
            `;
            return;
        }
        
        productsTable.innerHTML = filteredProducts.map(product => `
            <tr>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">${product.name || 'N/A'}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${product.sku || 'N/A'}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${product.quantity_on_hand || product.quantity || 0}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">$${(product.cost_price || 0).toFixed(2)}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">$${(product.selling_price || 0).toFixed(2)}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button onclick="editProduct(${product.id})" class="text-indigo-600 hover:text-indigo-900 mr-3">Edit</button>
                    <button onclick="deleteProduct(${product.id})" class="text-red-600 hover:text-red-900">Delete</button>
                </td>
            </tr>
        `).join('');
    }
}

// Global error handler
window.addEventListener('error', function(event) {
    console.error('❌ Global error:', event.error);
});

// Console log for debugging
console.log('📱 StockFlow app.js loaded successfully');
