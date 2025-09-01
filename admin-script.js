// Admin Dashboard JavaScript
let currentPage = 1;
let bookingsPerPage = 10;
let allBookings = [];
let filteredBookings = [];

// DOM Elements
const loginModal = document.getElementById('loginModal');
const dashboard = document.getElementById('dashboard');
const loginForm = document.getElementById('loginForm');
const logoutBtn = document.getElementById('logoutBtn');
const navButtons = document.querySelectorAll('.nav-btn');
const sections = document.querySelectorAll('.dashboard-section');

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    checkAuthStatus();
    initializeEventListeners();
});

// Check if admin is already authenticated
function checkAuthStatus() {
    const isAuthenticated = sessionStorage.getItem('adminAuthenticated');
    if (isAuthenticated === 'true') {
        showDashboard();
    } else {
        showLoginModal();
    }
}

// Show login modal
function showLoginModal() {
    loginModal.style.display = 'flex';
    dashboard.classList.add('hidden');
}

// Show dashboard
function showDashboard() {
    loginModal.style.display = 'none';
    dashboard.classList.remove('hidden');
    loadInitialData();
}

// Initialize event listeners
function initializeEventListeners() {
    // Login form
    loginForm.addEventListener('submit', handleLogin);
    
    // Password toggle
    const passwordToggle = document.getElementById('passwordToggle');
    const passwordInput = document.getElementById('adminPassword');
    const toggleIcon = document.getElementById('toggleIcon');
    
    if (passwordToggle && passwordInput && toggleIcon) {
        passwordToggle.addEventListener('click', function() {
            if (passwordInput.type === 'password') {
                passwordInput.type = 'text';
                toggleIcon.classList.remove('fa-eye');
                toggleIcon.classList.add('fa-eye-slash');
            } else {
                passwordInput.type = 'password';
                toggleIcon.classList.remove('fa-eye-slash');
                toggleIcon.classList.add('fa-eye');
            }
        });
    }
    
    // Logout button
    logoutBtn.addEventListener('click', handleLogout);
    
    // Navigation buttons
    navButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const section = btn.dataset.section;
            switchSection(section);
            
            // Update active nav button
            navButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
        });
    });
    
    // Search and filters
    const searchInput = document.getElementById('searchBookings');
    const statusFilter = document.getElementById('statusFilter');
    const dateFilter = document.getElementById('dateFilter');
    
    if (searchInput) searchInput.addEventListener('input', filterBookings);
    if (statusFilter) statusFilter.addEventListener('change', filterBookings);
    if (dateFilter) dateFilter.addEventListener('change', filterBookings);
    
    // Pagination
    const prevBtn = document.getElementById('prevPage');
    const nextBtn = document.getElementById('nextPage');
    
    if (prevBtn) prevBtn.addEventListener('click', () => changePage(-1));
    if (nextBtn) nextBtn.addEventListener('click', () => changePage(1));
    
    // Modal close buttons
    document.querySelectorAll('.modal-close').forEach(btn => {
        btn.addEventListener('click', closeModal);
    });
    
    // Update status button
    const updateStatusBtn = document.getElementById('updateStatus');
    if (updateStatusBtn) {
        updateStatusBtn.addEventListener('click', updateBookingStatus);
    }
}

// Handle login
async function handleLogin(e) {
    e.preventDefault();
    
    const password = document.getElementById('adminPassword').value;
    
    try {
        const response = await fetch('/api/admin/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ password })
        });
        
        const result = await response.json();
        
        if (result.success) {
            sessionStorage.setItem('adminAuthenticated', 'true');
            sessionStorage.setItem('adminToken', result.token);
            showDashboard();
        } else {
            showAlert('Invalid password. Please try again.', 'error');
        }
    } catch (error) {
        console.error('Login error:', error);
        showAlert('Login failed. Please try again.', 'error');
    }
}

// Handle logout
function handleLogout() {
    sessionStorage.removeItem('adminAuthenticated');
    sessionStorage.removeItem('adminToken');
    showLoginModal();
}

// Switch dashboard section
function switchSection(sectionName) {
    sections.forEach(section => {
        section.classList.remove('active');
    });
    
    const targetSection = document.getElementById(sectionName);
    if (targetSection) {
        targetSection.classList.add('active');
        
        // Load section-specific data
        switch(sectionName) {
            case 'overview':
                loadOverviewData();
                break;
            case 'reservations':
                loadReservationsData();
                break;
            case 'rooms':
                loadRoomData();
                break;
            case 'reports':
                loadReportsData();
                break;
        }
    }
}

// Load initial dashboard data
async function loadInitialData() {
    try {
        await Promise.all([
            loadOverviewData(),
            loadReservationsData()
        ]);
    } catch (error) {
        console.error('Error loading initial data:', error);
        showAlert('Failed to load dashboard data', 'error');
    }
}

// Load overview data
async function loadOverviewData() {
    try {
        const response = await fetch('/api/bookings', {
            headers: getAuthHeaders()
        });
        
        const result = await response.json();
        
        if (result.success) {
            const bookings = result.data.bookings;
            updateOverviewStats(bookings);
            displayRecentBookings(bookings.slice(0, 5));
        }
    } catch (error) {
        console.error('Error loading overview data:', error);
    }
}

// Update overview statistics
function updateOverviewStats(bookings) {
    const totalBookings = bookings.length;
    const pendingBookings = bookings.filter(b => b.status === 'pending').length;
    const confirmedBookings = bookings.filter(b => b.status === 'confirmed').length;
    const totalRevenue = bookings
        .filter(b => b.status !== 'cancelled')
        .reduce((sum, booking) => sum + (booking.totalAmount || 0), 0);
    
    document.getElementById('totalBookings').textContent = totalBookings;
    document.getElementById('pendingBookings').textContent = pendingBookings;
    document.getElementById('confirmedBookings').textContent = confirmedBookings;
    document.getElementById('totalRevenue').textContent = `$${totalRevenue.toFixed(2)}`;
}

// Display recent bookings
function displayRecentBookings(bookings) {
    const container = document.getElementById('recentBookingsList');
    
    if (!bookings || bookings.length === 0) {
        container.innerHTML = '<p>No recent bookings found.</p>';
        return;
    }
    
    container.innerHTML = bookings.map(booking => `
        <div class="recent-booking-item" style="
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 15px;
            border-bottom: 1px solid #f1f3f4;
            transition: background 0.3s ease;
        " onmouseover="this.style.background='#f8f9fa'" onmouseout="this.style.background='white'">
            <div>
                <strong>${booking.firstName} ${booking.lastName}</strong>
                <div style="color: #666; font-size: 14px; margin-top: 4px;">
                    ${formatDate(booking.checkInDate)} - ${formatDate(booking.checkOutDate)}
                </div>
            </div>
            <div style="text-align: right;">
                <div style="font-weight: 600; color: #2E8B57;">$${booking.totalAmount.toFixed(2)}</div>
                <div class="status-badge status-${booking.status}" style="margin-top: 4px;">
                    ${booking.status}
                </div>
            </div>
        </div>
    `).join('');
}

// Load reservations data
async function loadReservationsData() {
    try {
        const response = await fetch('/api/bookings', {
            headers: getAuthHeaders()
        });
        
        const result = await response.json();
        
        if (result.success) {
            allBookings = result.data.bookings;
            filteredBookings = [...allBookings];
            currentPage = 1;
            displayBookingsTable();
            updatePagination();
        }
    } catch (error) {
        console.error('Error loading reservations:', error);
        showAlert('Failed to load reservations', 'error');
    }
}

// Filter bookings
function filterBookings() {
    const searchTerm = document.getElementById('searchBookings').value.toLowerCase();
    const statusFilter = document.getElementById('statusFilter').value;
    const dateFilter = document.getElementById('dateFilter').value;
    
    filteredBookings = allBookings.filter(booking => {
        const matchesSearch = !searchTerm || 
            booking.firstName.toLowerCase().includes(searchTerm) ||
            booking.lastName.toLowerCase().includes(searchTerm) ||
            booking.email.toLowerCase().includes(searchTerm) ||
            booking.confirmationNumber.toLowerCase().includes(searchTerm);
        
        const matchesStatus = !statusFilter || booking.status === statusFilter;
        
        const matchesDate = !dateFilter || 
            new Date(booking.checkInDate).toDateString() === new Date(dateFilter).toDateString();
        
        return matchesSearch && matchesStatus && matchesDate;
    });
    
    currentPage = 1;
    displayBookingsTable();
    updatePagination();
}

// Display bookings table
function displayBookingsTable() {
    const tbody = document.getElementById('bookingsTableBody');
    
    if (!filteredBookings || filteredBookings.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="10" style="text-align: center; padding: 40px; color: #666;">
                    No bookings found matching your criteria.
                </td>
            </tr>
        `;
        return;
    }
    
    const startIndex = (currentPage - 1) * bookingsPerPage;
    const endIndex = startIndex + bookingsPerPage;
    const pageBookings = filteredBookings.slice(startIndex, endIndex);
    
    tbody.innerHTML = pageBookings.map(booking => `
        <tr>
            <td><strong>${booking.confirmationNumber}</strong></td>
            <td>${booking.firstName} ${booking.lastName}</td>
            <td>${booking.email}</td>
            <td>${formatDate(booking.checkInDate)}</td>
            <td>${formatDate(booking.checkOutDate)}</td>
            <td>${formatRoomType(booking.roomType)}</td>
            <td>${booking.guestCount}</td>
            <td>$${booking.totalAmount.toFixed(2)}</td>
            <td>
                <span class="status-badge status-${booking.status}">
                    ${booking.status}
                </span>
            </td>
            <td>
                <div class="action-buttons">
                    <button class="btn-sm btn-view" onclick="viewBooking('${booking._id}')">
                        <i class="fas fa-eye"></i> View
                    </button>
                    <button class="btn-sm btn-edit" onclick="editBooking('${booking._id}')">
                        <i class="fas fa-edit"></i> Edit
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

// Update pagination
function updatePagination() {
    const totalPages = Math.ceil(filteredBookings.length / bookingsPerPage);
    const pageInfo = document.getElementById('pageInfo');
    const prevBtn = document.getElementById('prevPage');
    const nextBtn = document.getElementById('nextPage');
    
    pageInfo.textContent = `Page ${currentPage} of ${totalPages}`;
    prevBtn.disabled = currentPage === 1;
    nextBtn.disabled = currentPage === totalPages;
}

// Change page
function changePage(direction) {
    const totalPages = Math.ceil(filteredBookings.length / bookingsPerPage);
    const newPage = currentPage + direction;
    
    if (newPage >= 1 && newPage <= totalPages) {
        currentPage = newPage;
        displayBookingsTable();
        updatePagination();
    }
}

// View booking details
async function viewBooking(bookingId) {
    try {
        const response = await fetch(`/api/bookings/${bookingId}`, {
            headers: getAuthHeaders()
        });
        
        const result = await response.json();
        
        if (result.success) {
            showBookingModal(result.data);
        }
    } catch (error) {
        console.error('Error loading booking details:', error);
        showAlert('Failed to load booking details', 'error');
    }
}

// Edit booking
function editBooking(bookingId) {
    // For now, just view the booking
    viewBooking(bookingId);
}

// Show booking modal
function showBookingModal(booking) {
    const modal = document.getElementById('bookingModal');
    const detailsContainer = document.getElementById('bookingDetails');
    const statusSelect = document.getElementById('statusUpdate');
    
    detailsContainer.innerHTML = `
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 20px;">
            <div>
                <strong>Confirmation Number:</strong><br>
                ${booking.confirmationNumber}
            </div>
            <div>
                <strong>Guest Name:</strong><br>
                ${booking.firstName} ${booking.lastName}
            </div>
            <div>
                <strong>Email:</strong><br>
                ${booking.email}
            </div>
            <div>
                <strong>Phone:</strong><br>
                ${booking.phone || 'Not provided'}
            </div>
        </div>
        
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 20px;">
            <div>
                <strong>Check-in Date:</strong><br>
                ${formatDate(booking.checkInDate)}
            </div>
            <div>
                <strong>Check-out Date:</strong><br>
                ${formatDate(booking.checkOutDate)}
            </div>
            <div>
                <strong>Number of Nights:</strong><br>
                ${booking.numberOfNights}
            </div>
            <div>
                <strong>Number of Guests:</strong><br>
                ${booking.guestCount}
            </div>
        </div>
        
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 20px;">
            <div>
                <strong>Room Type:</strong><br>
                ${formatRoomType(booking.roomType)}
            </div>
            <div>
                <strong>Room Rate:</strong><br>
                $${booking.roomRate.toFixed(2)} per night
            </div>
            <div>
                <strong>Subtotal:</strong><br>
                $${booking.subtotal.toFixed(2)}
            </div>
            <div>
                <strong>Taxes:</strong><br>
                $${booking.taxes.toFixed(2)}
            </div>
        </div>
        
        <div style="margin-bottom: 20px;">
            <strong>Total Amount:</strong><br>
            <span style="font-size: 24px; color: #2E8B57; font-weight: 700;">
                $${booking.totalAmount.toFixed(2)}
            </span>
        </div>
        
        ${booking.specialRequests ? `
            <div style="margin-bottom: 20px;">
                <strong>Special Requests:</strong><br>
                <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin-top: 8px;">
                    ${booking.specialRequests}
                </div>
            </div>
        ` : ''}
        
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px;">
            <div>
                <strong>Booking Date:</strong><br>
                ${formatDate(booking.createdAt)}
            </div>
            <div>
                <strong>Current Status:</strong><br>
                <span class="status-badge status-${booking.status}">
                    ${booking.status}
                </span>
            </div>
        </div>
    `;
    
    // Set current status in select
    statusSelect.value = booking.status;
    
    // Store booking ID for updates
    modal.dataset.bookingId = booking._id;
    
    modal.classList.add('show');
}

// Update booking status
async function updateBookingStatus() {
    const modal = document.getElementById('bookingModal');
    const bookingId = modal.dataset.bookingId;
    const newStatus = document.getElementById('statusUpdate').value;
    
    try {
        const response = await fetch(`/api/bookings/${bookingId}`, {
            method: 'PUT',
            headers: {
                ...getAuthHeaders(),
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ status: newStatus })
        });
        
        const result = await response.json();
        
        if (result.success) {
            showAlert('Booking status updated successfully!', 'success');
            closeModal();
            loadReservationsData(); // Refresh the table
            loadOverviewData(); // Refresh overview stats
        } else {
            showAlert('Failed to update booking status', 'error');
        }
    } catch (error) {
        console.error('Error updating booking status:', error);
        showAlert('Failed to update booking status', 'error');
    }
}

// Load room data
async function loadRoomData() {
    try {
        const response = await fetch('/api/availability', {
            headers: getAuthHeaders()
        });
        
        const result = await response.json();
        
        if (result.success) {
            displayRoomAvailability(result.data.availability);
        }
    } catch (error) {
        console.error('Error loading room data:', error);
    }
}

// Display room availability
function displayRoomAvailability(availability) {
    const container = document.getElementById('roomAvailability');
    
    const roomTypes = [
        { key: 'ocean-view', name: 'Ocean View Room' },
        { key: 'beachfront-suite', name: 'Beachfront Suite' },
        { key: 'presidential-villa', name: 'Presidential Villa' }
    ];
    
    container.innerHTML = roomTypes.map(room => {
        const roomData = availability[room.key];
        const occupancyRate = ((roomData.total - roomData.available) / roomData.total * 100).toFixed(1);
        
        return `
            <div class="room-availability-card">
                <h4>${room.name}</h4>
                <div class="availability-stats">
                    <span>Available: ${roomData.available}</span>
                    <span>Total: ${roomData.total}</span>
                    <span>Occupancy: ${occupancyRate}%</span>
                </div>
                <div class="availability-bar">
                    <div class="availability-fill" style="width: ${occupancyRate}%"></div>
                </div>
            </div>
        `;
    }).join('');
}

// Load reports data
function loadReportsData() {
    // Placeholder for reports functionality
    const monthlyRevenue = document.getElementById('monthlyRevenue');
    const occupancyRate = document.getElementById('occupancyRate');
    
    monthlyRevenue.innerHTML = '<p>Monthly revenue chart will be implemented here.</p>';
    occupancyRate.innerHTML = '<p>Occupancy rate analytics will be implemented here.</p>';
}

// Utility functions
function getAuthHeaders() {
    const token = sessionStorage.getItem('adminToken');
    return {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
    };
}

function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

function formatRoomType(roomType) {
    const roomTypes = {
        'ocean-view': 'Ocean View Room',
        'beachfront-suite': 'Beachfront Suite',
        'presidential-villa': 'Presidential Villa'
    };
    return roomTypes[roomType] || roomType;
}

function closeModal() {
    document.querySelectorAll('.modal').forEach(modal => {
        modal.classList.remove('show');
    });
}

function showAlert(message, type) {
    // Remove existing alerts
    document.querySelectorAll('.alert').forEach(alert => alert.remove());
    
    // Create new alert
    const alert = document.createElement('div');
    alert.className = `alert alert-${type}`;
    alert.textContent = message;
    
    // Insert at appropriate location based on current view
    const main = document.querySelector('.dashboard-main');
    const loginContent = document.querySelector('.login-content');
    
    if (main && !main.closest('.hidden')) {
        // Dashboard is visible, insert in dashboard
        main.insertBefore(alert, main.firstChild);
    } else if (loginContent) {
        // Login modal is visible, insert in login modal
        loginContent.insertBefore(alert, loginContent.firstChild);
    }
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        alert.remove();
    }, 5000);
}