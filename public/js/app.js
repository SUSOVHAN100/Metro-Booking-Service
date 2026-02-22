// API Base URL
const API_BASE = 'http://localhost:3000/api';

// Global state
let authToken = localStorage.getItem('token');
let currentUser = JSON.parse(localStorage.getItem('user') || 'null');

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    // Check for token in URL (from Google OAuth redirect)
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    const userParam = urlParams.get('user');
    
    if (token && userParam) {
        try {
            const user = JSON.parse(decodeURIComponent(userParam));
            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(user));
            authToken = token;
            currentUser = user;
            
            // Clean URL
            window.history.replaceState({}, document.title, window.location.pathname);
        } catch (error) {
            console.error('Error parsing user data:', error);
        }
    }
    
    // Initialize the app
    loadStops();
    loadRoutes();
    if (currentUser) {
        loadUserBookings();
    }
    updateAuthUI();
    
    // Navigation
    document.querySelectorAll('.nav-links a').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const sectionId = link.getAttribute('href').substring(1);
            showSection(sectionId);
        });
    });
    
    // Booking form
    document.getElementById('findRoute').addEventListener('click', findRouteAndBook);
});

// Update UI based on auth state
function updateAuthUI() {
    const userProfile = document.getElementById('userProfile');
    
    if (currentUser) {
        userProfile.innerHTML = `
            <img src="${currentUser.avatar || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(currentUser.name) + '&background=667eea&color=fff'}" 
                 alt="Profile" class="user-avatar">
            <span>${currentUser.name}</span>
            <div class="user-dropdown">
                <div class="user-info">
                    <div class="name">${currentUser.name}</div>
                    <div class="email">${currentUser.email}</div>
                    <div style="font-size: 11px; color: #667eea; margin-top: 5px;">
                        ${currentUser.authProvider === 'google' ? 'Connected with Google' : 'Email Account'}
                    </div>
                </div>
                <a href="#" onclick="viewProfile()"><i class="fas fa-user"></i> Profile</a>
                <a href="#" onclick="viewMyBookings()"><i class="fas fa-ticket-alt"></i> My Bookings</a>
                ${currentUser.role === 'admin' ? '<a href="#" onclick="showAdminPanel()"><i class="fas fa-cog"></i> Admin Panel</a>' : ''}
                <a href="#" onclick="handleLogout()"><i class="fas fa-sign-out-alt"></i> Logout</a>
            </div>
        `;
        
        // Show admin tab if user is admin
        if (currentUser.role === 'admin') {
            document.querySelector('a[href="#admin"]').style.display = 'block';
        } else {
            document.querySelector('a[href="#admin"]').style.display = 'none';
        }
    } else {
        userProfile.innerHTML = `
            <i class="fas fa-user-circle"></i>
            <span>Guest</span>
            <div class="user-dropdown">
                <a href="#" onclick="showLoginModal()"><i class="fas fa-sign-in-alt"></i> Login</a>
                <a href="#" onclick="showRegisterModal()"><i class="fas fa-user-plus"></i> Register</a>
            </div>
        `;
        
        // Hide admin tab for guests
        document.querySelector('a[href="#admin"]').style.display = 'none';
    }
}

// Google Login
function handleGoogleLogin() {
    window.location.href = `${API_BASE}/auth/google`;
}

// Handle Login
async function handleLogin(event) {
    event.preventDefault();
    
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    
    try {
        const response = await fetch(`${API_BASE}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });
        
        const data = await response.json();
        
        if (data.success) {
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
            
            authToken = data.token;
            currentUser = data.user;
            
            updateAuthUI();
            closeLoginModal();
            
            showNotification('Login successful!', 'success');
            
            // Reload user-specific data
            loadUserBookings();
        } else {
            showNotification(data.error || 'Login failed', 'error');
        }
    } catch (error) {
        console.error('Login error:', error);
        showNotification('Network error. Please try again.', 'error');
    }
}

// Handle Register
async function handleRegister(event) {
    event.preventDefault();
    
    const password = document.getElementById('regPassword').value;
    const confirmPassword = document.getElementById('regConfirmPassword').value;
    
    if (password !== confirmPassword) {
        showNotification('Passwords do not match', 'error');
        return;
    }
    
    const userData = {
        name: document.getElementById('regName').value,
        email: document.getElementById('regEmail').value,
        phone: document.getElementById('regPhone').value,
        password: password
    };
    
    try {
        const response = await fetch(`${API_BASE}/auth/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(userData)
        });
        
        const data = await response.json();
        
        if (data.success) {
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
            
            authToken = data.token;
            currentUser = data.user;
            
            updateAuthUI();
            closeRegisterModal();
            
            showNotification('Registration successful!', 'success');
            loadUserBookings();
        } else {
            showNotification(data.error || 'Registration failed', 'error');
        }
    } catch (error) {
        console.error('Registration error:', error);
        showNotification('Network error. Please try again.', 'error');
    }
}

// Handle Logout
async function handleLogout() {
    try {
        if (authToken) {
            await fetch(`${API_BASE}/auth/logout`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${authToken}`
                }
            });
        }
    } catch (error) {
        console.error('Logout error:', error);
    } finally {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        
        authToken = null;
        currentUser = null;
        
        updateAuthUI();
        
        showNotification('Logged out successfully', 'success');
        
        // Redirect to booking section
        showSection('booking');
    }
}

// Show notification
function showNotification(message, type) {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
        <span>${message}</span>
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// Check if user is authenticated
function requireAuth() {
    if (!currentUser) {
        showNotification('Please login to continue', 'error');
        showLoginModal();
        return false;
    }
    return true;
}

// Helper function for authenticated API calls
async function fetchWithAuth(url, options = {}) {
    const token = localStorage.getItem('token');
    
    const headers = {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
        ...options.headers
    };
    
    const response = await fetch(url, {
        ...options,
        headers
    });
    
    if (response.status === 401) {
        // Token expired or invalid
        handleLogout();
        throw new Error('Session expired. Please login again.');
    }
    
    return response;
}

// Load stops
async function loadStops() {
    try {
        const response = await fetch(`${API_BASE}/stops`);
        const stops = await response.json();
        
        const sourceSelect = document.getElementById('source');
        const destSelect = document.getElementById('destination');
        
        sourceSelect.innerHTML = '<option value="">Select source station</option>';
        destSelect.innerHTML = '<option value="">Select destination station</option>';
        
        stops.forEach(stop => {
            const option = `<option value="${stop.stopId}">${stop.name} ${stop.isInterchange ? '(Interchange)' : ''}</option>`;
            sourceSelect.innerHTML += option;
            destSelect.innerHTML += option;
        });
        
        // Populate stops table in admin
        if (document.getElementById('stopsTableBody')) {
            populateStopsTable(stops);
        }
    } catch (error) {
        console.error('Error loading stops:', error);
    }
}

// Load routes
async function loadRoutes() {
    try {
        const response = await fetch(`${API_BASE}/routes`);
        const routes = await response.json();
        displayRoutes(routes);
        
        if (document.getElementById('routesTableBody')) {
            populateRoutesTable(routes);
        }
    } catch (error) {
        console.error('Error loading routes:', error);
    }
}

// Find route and create booking
async function findRouteAndBook() {
    if (!requireAuth()) return;
    
    const source = document.getElementById('source').value;
    const destination = document.getElementById('destination').value;
    const optimization = document.getElementById('optimization').value;
    
    if (!source || !destination) {
        showNotification('Please select both source and destination stations', 'error');
        return;
    }
    
    if (source === destination) {
        showNotification('Source and destination cannot be the same', 'error');
        return;
    }
    
    showNotification('Finding optimal route...', 'info');
    
    try {
        const response = await fetchWithAuth(`${API_BASE}/bookings`, {
            method: 'POST',
            body: JSON.stringify({
                userId: currentUser.userId,
                sourceStopId: source,
                destinationStopId: destination,
                optimizationStrategy: optimization
            })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            showNotification('Booking created successfully!', 'success');
            displayRouteVisualization(data.booking);
            displayQRCode(data.qrData);
            loadUserBookings();
        } else {
            showNotification(data.error || 'Failed to create booking', 'error');
        }
    } catch (error) {
        console.error('Error creating booking:', error);
        if (error.message.includes('Session expired')) {
            showLoginModal();
        } else {
            showNotification('Network error. Please try again.', 'error');
        }
    }
}

// Load user bookings
async function loadUserBookings() {
    if (!currentUser) return;
    
    try {
        const response = await fetchWithAuth(`${API_BASE}/bookings/user/${currentUser.userId}`);
        const bookings = await response.json();
        displayUserBookings(bookings);
    } catch (error) {
        console.error('Error loading bookings:', error);
    }
}

// Display routes
function displayRoutes(routes) {
    const grid = document.getElementById('routesGrid');
    
    if (!routes || routes.length === 0) {
        grid.innerHTML = '<div class="loading">No routes available</div>';
        return;
    }
    
    grid.innerHTML = routes.map(route => `
        <div class="route-card" onclick="showRouteDetails('${route.routeId}')">
            <div class="route-header">
                <div class="route-color" style="background: ${route.color}"></div>
                <h4>${route.name}</h4>
            </div>
            <div class="route-stops-preview">
                ${route.stops.slice(0, 5).map(stop => 
                    `<span class="stop-preview">${stop.name}</span>`
                ).join('')}
                ${route.stops.length > 5 ? '<span class="stop-preview">...</span>' : ''}
            </div>
        </div>
    `).join('');
}

// Display user bookings
function displayUserBookings(bookings) {
    const listDiv = document.getElementById('bookingsList');
    
    if (!bookings || bookings.length === 0) {
        listDiv.innerHTML = '<div class="loading">No bookings found</div>';
        return;
    }
    
    listDiv.innerHTML = bookings.map(booking => `
        <div class="booking-card">
            <div class="booking-icon">
                <i class="fas fa-subway"></i>
            </div>
            <div class="booking-info">
                <h4>${booking.sourceStop.name} → ${booking.destinationStop.name}</h4>
                <div class="booking-meta">
                    <span><i class="fas fa-clock"></i> ${new Date(booking.createdAt).toLocaleString()}</span>
                    <span><i class="fas fa-exchange-alt"></i> ${booking.totalTransfers} transfers</span>
                    <span><i class="fas fa-clock"></i> ${booking.totalTravelTime} min</span>
                </div>
                <div class="booking-id">Booking ID: ${booking.bookingId}</div>
            </div>
            <div>
                <span class="booking-status-badge ${booking.status}">${booking.status}</span>
                <button class="btn-secondary" onclick="viewBookingDetails('${booking.bookingId}')">
                    <i class="fas fa-eye"></i> View
                </button>
            </div>
        </div>
    `).join('');
}

// Display route visualization
function displayRouteVisualization(booking) {
    const container = document.getElementById('routeVisualization');
    const segmentsDiv = document.getElementById('routeSegments');
    
    document.getElementById('travelTime').textContent = `${booking.totalTravelTime} min`;
    document.getElementById('transfers').textContent = booking.totalTransfers;
    document.getElementById('totalStops').textContent = booking.totalStops;
    
    segmentsDiv.innerHTML = booking.segments.map((segment, index) => `
        <div class="segment" style="border-left-color: ${segment.routeColor}">
            <h4>${segment.routeName}</h4>
            <div class="segment-stops">
                ${segment.stops.map((stop, i) => `
                    <span class="stop-badge">${stop}</span>
                    ${i < segment.stops.length - 1 ? '<i class="fas fa-arrow-right"></i>' : ''}
                `).join('')}
            </div>
            ${index < booking.segments.length - 1 ? 
                '<div class="interchange-badge"><i class="fas fa-exchange-alt"></i> Interchange here</div>' : ''}
        </div>
    `).join('');
    
    container.style.display = 'block';
}

// Display QR code
function displayQRCode(qrData) {
    document.getElementById('qrSection').style.display = 'block';
    document.getElementById('qrString').textContent = qrData.qrString;
}

// View booking details
async function viewBookingDetails(bookingId) {
    try {
        const response = await fetchWithAuth(`${API_BASE}/bookings/${bookingId}`);
        const booking = await response.json();
        displayRouteVisualization(booking);
        showSection('booking');
    } catch (error) {
        console.error('Error loading booking details:', error);
    }
}

// View my bookings
function viewMyBookings() {
    showSection('my-bookings');
}

// Show admin panel
function showAdminPanel() {
    showSection('admin');
}

// Profile view
function viewProfile() {
    showNotification('Profile feature coming soon!', 'info');
}

// Modal functions
function showLoginModal() {
    document.getElementById('loginModal').style.display = 'block';
}

function closeLoginModal() {
    document.getElementById('loginModal').style.display = 'none';
}

function showRegisterModal() {
    closeLoginModal();
    document.getElementById('registerModal').style.display = 'block';
}

function closeRegisterModal() {
    document.getElementById('registerModal').style.display = 'none';
}

function showSection(sectionId) {
    document.querySelectorAll('.section').forEach(section => {
        section.classList.remove('active');
    });
    document.getElementById(sectionId).classList.add('active');
    
    document.querySelectorAll('.nav-links a').forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${sectionId}`) {
            link.classList.add('active');
        }
    });
}

// Close modals when clicking outside
window.onclick = function(event) {
    const loginModal = document.getElementById('loginModal');
    const registerModal = document.getElementById('registerModal');
    const stopModal = document.getElementById('stopModal');
    const routeModal = document.getElementById('routeModal');
    
    if (event.target === loginModal) {
        loginModal.style.display = 'none';
    }
    if (event.target === registerModal) {
        registerModal.style.display = 'none';
    }
    if (event.target === stopModal) {
        stopModal.style.display = 'none';
    }
    if (event.target === routeModal) {
        routeModal.style.display = 'none';
    }
};


// Profile functions
async function loadProfile() {
    if (!requireAuth()) return;
    
    try {
        const response = await fetchWithAuth(`${API_BASE}/auth/profile`);
        const data = await response.json();
        
        if (data.success) {
            displayProfile(data.user);
            loadProfileStats();
            loadActivityTimeline();
        }
    } catch (error) {
        console.error('Error loading profile:', error);
        showNotification('Failed to load profile', 'error');
    }
}

function displayProfile(user) {
    // Update sidebar
    document.getElementById('profileName').textContent = user.name;
    document.getElementById('profileEmail').textContent = user.email;
    document.getElementById('profileAvatar').src = user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=667eea&color=fff`;
    
    // Update badge
    const badge = document.getElementById('profileBadge');
    if (user.role === 'admin') {
        badge.innerHTML = '<i class="fas fa-crown"></i> Admin User';
    } else if (user.authProvider === 'google') {
        badge.innerHTML = '<i class="fab fa-google"></i> Google Account';
    } else {
        badge.innerHTML = '<i class="fas fa-envelope"></i> Email Account';
    }
    
    // Update form fields
    document.getElementById('profileFullName').value = user.name || '';
    document.getElementById('profileEmailInput').value = user.email || '';
    document.getElementById('profilePhone').value = user.phone || '';
    document.getElementById('profileUserId').value = user.userId || '';
    document.getElementById('profileAuthProvider').value = user.authProvider || 'local';
    document.getElementById('profileRole').value = user.role || 'user';
    
    // Update stats
    document.getElementById('memberSince').textContent = user.createdAt ? new Date(user.createdAt).toLocaleDateString() : '-';
    document.getElementById('lastActive').textContent = user.lastLogin ? new Date(user.lastLogin).toLocaleString() : '-';
}

async function loadProfileStats() {
    try {
        const response = await fetchWithAuth(`${API_BASE}/bookings/user/${currentUser.userId}`);
        const bookings = await response.json();
        
        const totalTrips = bookings.length;
        const totalTravelTime = bookings.reduce((sum, b) => sum + (b.totalTravelTime || 0), 0);
        const totalTransfers = bookings.reduce((sum, b) => sum + (b.totalTransfers || 0), 0);
        
        document.getElementById('totalTrips').textContent = totalTrips;
        document.getElementById('totalTravelTime').textContent = `${totalTravelTime} min`;
        document.getElementById('totalTransfers').textContent = totalTransfers;
        document.getElementById('totalBookings').textContent = totalTrips;
    } catch (error) {
        console.error('Error loading stats:', error);
    }
}

async function loadActivityTimeline() {
    try {
        const response = await fetchWithAuth(`${API_BASE}/bookings/user/${currentUser.userId}`);
        const bookings = await response.json();
        
        const timeline = document.getElementById('activityTimeline');
        
        if (!bookings || bookings.length === 0) {
            timeline.innerHTML = '<p class="loading">No activity yet</p>';
            return;
        }
        
        timeline.innerHTML = bookings.slice(0, 10).map(booking => `
            <div class="timeline-item">
                <div class="timeline-time">${new Date(booking.createdAt).toLocaleDateString()}</div>
                <div class="timeline-content">
                    <strong>${booking.sourceStop.name} → ${booking.destinationStop.name}</strong>
                    <p>${booking.totalStops} stops • ${booking.totalTravelTime} min • ${booking.totalTransfers} transfers</p>
                    <span class="booking-status-badge ${booking.status}">${booking.status}</span>
                </div>
            </div>
        `).join('');
    } catch (error) {
        console.error('Error loading timeline:', error);
    }
}

async function updateProfile(event) {
    event.preventDefault();
    
    const userData = {
        name: document.getElementById('profileFullName').value,
        phone: document.getElementById('profilePhone').value
    };
    
    try {
        const response = await fetchWithAuth(`${API_BASE}/auth/profile`, {
            method: 'PUT',
            body: JSON.stringify(userData)
        });
        
        const data = await response.json();
        
        if (data.success) {
            // Update local storage
            currentUser = { ...currentUser, ...data.user };
            localStorage.setItem('user', JSON.stringify(currentUser));
            
            // Update UI
            displayProfile(data.user);
            updateAuthUI();
            
            showNotification('Profile updated successfully!', 'success');
        }
    } catch (error) {
        console.error('Error updating profile:', error);
        showNotification('Failed to update profile', 'error');
    }
}

async function changePassword(event) {
    event.preventDefault();
    
    const currentPass = document.getElementById('currentPassword').value;
    const newPass = document.getElementById('newPassword').value;
    const confirmPass = document.getElementById('confirmPassword').value;
    
    if (newPass !== confirmPass) {
        showNotification('New passwords do not match', 'error');
        return;
    }
    
    if (newPass.length < 6) {
        showNotification('Password must be at least 6 characters', 'error');
        return;
    }
    
    try {
        const response = await fetchWithAuth(`${API_BASE}/auth/change-password`, {
            method: 'POST',
            body: JSON.stringify({
                currentPassword: currentPass,
                newPassword: newPass
            })
        });
        
        const data = await response.json();
        
        if (data.success) {
            showNotification('Password changed successfully!', 'success');
            document.getElementById('passwordForm').reset();
        } else {
            showNotification(data.error || 'Failed to change password', 'error');
        }
    } catch (error) {
        console.error('Error changing password:', error);
        showNotification('Failed to change password', 'error');
    }
}

function showProfileTab(tabId) {
    // Update tab buttons
    document.querySelectorAll('.profile-tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.closest('.profile-tab-btn').classList.add('active');
    
    // Show selected tab
    document.querySelectorAll('.profile-tab-content').forEach(content => {
        content.classList.remove('active');
    });
    document.getElementById(`profile${tabId.charAt(0).toUpperCase() + tabId.slice(1)}`).classList.add('active');
}

function triggerAvatarUpload() {
    document.getElementById('avatarUpload').click();
}

// Add event listener for avatar upload
document.getElementById('avatarUpload')?.addEventListener('change', async (e) => {
    if (!e.target.files[0]) return;
    
    const formData = new FormData();
    formData.append('avatar', e.target.files[0]);
    
    try {
        const response = await fetchWithAuth(`${API_BASE}/auth/avatar`, {
            method: 'POST',
            body: formData,
            headers: {} // Let browser set content-type for FormData
        });
        
        const data = await response.json();
        
        if (data.success) {
            currentUser.avatar = data.avatar;
            localStorage.setItem('user', JSON.stringify(currentUser));
            document.getElementById('profileAvatar').src = data.avatar;
            updateAuthUI();
            showNotification('Avatar updated!', 'success');
        }
    } catch (error) {
        console.error('Error uploading avatar:', error);
        showNotification('Failed to upload avatar', 'error');
    }
});

// Update navigation to include profile
document.querySelector('a[href="#profile"]').addEventListener('click', (e) => {
    e.preventDefault();
    showSection('profile');
    loadProfile();
});

// Add this to your existing showSection function
function showSection(sectionId) {
    document.querySelectorAll('.section').forEach(section => {
        section.classList.remove('active');
    });
    document.getElementById(sectionId).classList.add('active');
    
    document.querySelectorAll('.nav-links a').forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${sectionId}`) {
            link.classList.add('active');
        }
    });
    
    // Load section-specific data
    if (sectionId === 'profile') {
        loadProfile();
    } else if (sectionId === 'my-bookings') {
        loadUserBookings();
    } else if (sectionId === 'routes') {
        loadRoutes();
    }
}

// Enhanced QR display function
function displayQRCode(qrData) {
    document.getElementById('qrSection').style.display = 'block';
    
    const qrDisplay = document.getElementById('qrDisplay');
    qrDisplay.innerHTML = `
        <div class="qr-display">
            <img src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrData.qrString)}" 
                 alt="QR Code" class="qr-code-image">
            <p><strong>Booking ID:</strong> ${qrData.bookingId}</p>
            <p><small>Valid for 24 hours</small></p>
            <div class="qr-actions">
                <button class="btn-secondary" onclick="downloadQR()">
                    <i class="fas fa-download"></i> Download
                </button>
                <button class="btn-secondary" onclick="printQR()">
                    <i class="fas fa-print"></i> Print
                </button>
                <button class="btn-secondary" onclick="shareQR()">
                    <i class="fas fa-share-alt"></i> Share
                </button>
            </div>
        </div>
    `;
}

function downloadQR() {
    const img = document.querySelector('.qr-code-image');
    if (!img) return;
    
    const link = document.createElement('a');
    link.download = `metro-ticket-${currentUser?.userId || 'booking'}.png`;
    link.href = img.src;
    link.click();
}

function printQR() {
    const qrContent = document.querySelector('.qr-display').innerHTML;
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
        <html>
            <head>
                <title>Metro Ticket QR</title>
                <style>
                    body { text-align: center; padding: 20px; }
                    img { max-width: 300px; }
                </style>
            </head>
            <body>
                ${qrContent}
                <script>window.print();</script>
            </body>
        </html>
    `);
}

function shareQR() {
    if (navigator.share) {
        navigator.share({
            title: 'Metro Ticket QR',
            text: `Booking ID: ${currentBookingId}`,
            url: window.location.href
        });
    } else {
        navigator.clipboard.writeText(window.location.href);
        showNotification('Link copied to clipboard!', 'success');
    }
}
