// StockFlow MVP - DEBUG VERSION
// Simple, working version for Railway deployment

console.log('🚀 StockFlow DEBUG version loading...');

// Global variables
const API_BASE = window.location.origin;
let authToken = null;
let currentUser = null;
let products = [];

// Initialize app
document.addEventListener('DOMContentLoaded', function() {
    console.log('📱 DOM Content Loaded');
    
    // Load auth from localStorage
    authToken = localStorage.getItem('authToken');
    const userStr = localStorage.getItem('currentUser');
    currentUser = userStr ? JSON.parse(userStr) : null;
    
    console.log('🔐 Auth loaded:', { hasToken: !!authToken, hasUser: !!currentUser });
    
    // Hide loading screen
    setTimeout(() => {
        const loadingScreen = document.getElementById('loadingScreen');
        const app = document.getElementById('app');
        
        if (loadingScreen) {
            loadingScreen.style.display = 'none';
            console.log('✅ Loading screen hidden');
        }
        
        if (app) {
            app.style.display = 'block';
            console.log('✅ App shown');
        }
        
        // Show appropriate page
        if (authToken && currentUser) {
            showPage('dashboard');
        } else {
            showPage('signup');
        }
    }, 500);
});

// Page navigation
function showPage(pageId) {
    console.log('🔄 Showing page:', pageId);
    
    // Hide all pages
    const pages = document.querySelectorAll('.page');
    pages.forEach(page => {
        page.style.display = 'none';
    });
    
    // Show requested page
    const targetPage = document.getElementById(pageId + 'Page');
    if (targetPage) {
        targetPage.style.display = 'block';
        console.log('✅ Page displayed:', pageId);
        
        // Load page data
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
        const userNameEls = document.querySelectorAll('.userName');
        const orgNameEls = document.querySelectorAll('.orgName');
        
        userNameEls.forEach(el => {
            el.textContent = currentUser.name || 'User';
        });
        
        orgNameEls.forEach(el => {
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

// Authentication
async function handleSignup(event) {
    event.preventDefault();
    console.log('📝 Signup started');
    
    const orgName = document.getElementById('signupOrgName')?.value?.trim();
    const email = document.getElementById('signupEmail')?.value?.trim();
    const password = document.getElementById('signupPassword')?.value;
    const confirmPassword = document.getElementById('signupConfirmPassword')?.value;
    
    if (!orgName || !email || !password || !confirmPassword) {
        alert('Please fill in all fields');
        return;
    }
    
    if (password !== confirmPassword) {
        alert('Passwords do not match');
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
        alert('Account created successfully!');
        showPage('dashboard');
    } catch (error) {
        alert(error.error || 'Signup failed');
    }
}

async function handleLogin(event) {
    event.preventDefault();
    console.log('🔐 Login started');
    
    const email = document.getElementById('loginEmail')?.value?.trim();
    const password = document.getElementById('loginPassword')?.value;
    
    if (!email || !password) {
        alert('Please fill in all fields');
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
        alert('Login successful!');
        showPage('dashboard');
    } catch (error) {
        alert(error.error || 'Login failed');
    }
}

function logout() {
    console.log('🚪 Logout');
    authToken = null;
    currentUser = null;
    
    localStorage.removeItem('authToken');
    localStorage.removeItem('currentUser');
    
    showPage('signup');
    alert('Logged out successfully');
}

// Dashboard
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
        console.error('❌ Dashboard error:', error);
        alert('Failed to load dashboard data');
    }
}

// Products
async function loadProducts() {
    try {
        console.log('📦 Loading products...');
        products = await apiCall('GET', '/products');
        console.log('📦 Products loaded:', products.length);
        displayProducts();
    } catch (error) {
        console.error('❌ Products error:', error);
        alert('Failed to load products');
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
    }
}

function showAddProductModal() {
    console.log('➕ Add product modal');
    const modal = document.getElementById('productModal');
    const modalTitle = document.getElementById('modalTitle');
    const productForm = document.getElementById('productForm');
    
    if (modal && modalTitle && productForm) {
        modal.style.display = 'block';
        modalTitle.textContent = 'Add Product';
        productForm.reset();
        delete productForm.dataset.productId;
    }
}

function editProduct(productId) {
    console.log('✏️ Edit product:', productId);
    const product = products.find(p => p.id === productId);
    if (product) {
        const modal = document.getElementById('productModal');
        const modalTitle = document.getElementById('modalTitle');
        const productForm = document.getElementById('productForm');
        
        if (modal && modalTitle && productForm) {
            modal.style.display = 'block';
            modalTitle.textContent = 'Edit Product';
            
            // Populate form
            document.getElementById('productName').value = product.name || '';
            document.getElementById('productSku').value = product.sku || '';
            document.getElementById('productDescription').value = product.description || '';
            document.getElementById('productQuantity').value = product.quantity_on_hand || product.quantity || 0;
            document.getElementById('productThreshold').value = product.low_stock_threshold || product.threshold || 5;
            document.getElementById('productCostPrice').value = product.cost_price || 0;
            document.getElementById('productSellingPrice').value = product.selling_price || 0;
            
            productForm.dataset.productId = productId;
        }
    } else {
        alert('Product not found');
    }
}

function closeProductModal() {
    console.log('❌ Close modal');
    const modal = document.getElementById('productModal');
    const productForm = document.getElementById('productForm');
    
    if (modal) {
        modal.style.display = 'none';
    }
    if (productForm) {
        productForm.reset();
        delete productForm.dataset.productId;
    }
}

async function saveProduct(event) {
    event.preventDefault();
    console.log('💾 Save product');
    
    const productForm = document.getElementById('productForm');
    if (!productForm) return;
    
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
        alert('Product name and SKU are required');
        return;
    }
    
    try {
        const productId = productForm.dataset.productId;
        
        if (productId) {
            await apiCall('PUT', `/products/${productId}`, formData);
            alert('Product updated successfully!');
        } else {
            await apiCall('POST', '/products', formData);
            alert('Product added successfully!');
        }
        
        closeProductModal();
        loadProducts();
    } catch (error) {
        console.error('❌ Save error:', error);
        alert(error.error || 'Failed to save product');
    }
}

async function deleteProduct(productId) {
    const product = products.find(p => p.id === productId);
    if (product && confirm(`Are you sure you want to delete ${product.name}?`)) {
        try {
            await apiCall('DELETE', `/products/${productId}`);
            loadProducts();
            alert('Product deleted successfully!');
        } catch (error) {
            alert(error.error || 'Failed to delete product');
        }
    }
}

// Settings
async function loadSettings() {
    try {
        console.log('⚙️ Loading settings...');
        const response = await apiCall('GET', '/settings');
        
        document.getElementById('lowStockThreshold').value = response.lowStockThreshold || response.low_stock_threshold || 5;
        document.getElementById('currency').value = response.currency || 'USD';
        document.getElementById('timezone').value = response.timezone || 'UTC';
        document.getElementById('emailNotifications').checked = response.emailNotifications !== false;
        document.getElementById('lowStockAlerts').checked = response.lowStockAlerts !== false;
        
        console.log('✅ Settings loaded');
    } catch (error) {
        console.error('❌ Settings error:', error);
        alert('Failed to load settings');
    }
}

async function saveSettings(event) {
    event.preventDefault();
    console.log('💾 Save settings');
    
    const formData = {
        lowStockThreshold: parseInt(document.getElementById('lowStockThreshold')?.value) || 5,
        currency: document.getElementById('currency')?.value?.trim() || 'USD',
        timezone: document.getElementById('timezone')?.value?.trim() || 'UTC',
        emailNotifications: document.getElementById('emailNotifications')?.checked || false,
        lowStockAlerts: document.getElementById('lowStockAlerts')?.checked || false
    };
    
    try {
        await apiCall('PUT', '/settings', formData);
        alert('Settings saved successfully!');
    } catch (error) {
        console.error('❌ Save settings error:', error);
        alert(error.error || 'Failed to save settings');
    }
}

// Search
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

// Setup search
document.addEventListener('DOMContentLoaded', function() {
    const searchInput = document.getElementById('productSearch');
    if (searchInput) {
        searchInput.addEventListener('input', filterProducts);
        console.log('🔍 Search setup complete');
    }
});

// Global error handler
window.addEventListener('error', function(event) {
    console.error('❌ Global error:', event.error);
});

console.log('📱 StockFlow DEBUG version loaded successfully');
