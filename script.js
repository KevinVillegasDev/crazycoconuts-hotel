// DOM Content Loaded
document.addEventListener('DOMContentLoaded', function() {
    // Initialize all functionality
    initNavigation();
    initBookingSystem();
    initScrollEffects();
    initMobileMenu();
    initDateValidation();
});

// Navigation functionality
function initNavigation() {
    const navbar = document.querySelector('.navbar');
    const navLinks = document.querySelectorAll('.nav-link');
    
    // Navbar scroll effect
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });
    
    // Smooth scrolling for navigation links
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('href');
            const targetSection = document.querySelector(targetId);
            
            if (targetSection) {
                const offsetTop = targetSection.offsetTop - 80;
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
            }
        });
    });
}

// Mobile menu functionality
function initMobileMenu() {
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    
    hamburger.addEventListener('click', () => {
        hamburger.classList.toggle('active');
        navMenu.classList.toggle('active');
    });
    
    // Close menu when clicking on a link
    document.querySelectorAll('.nav-link').forEach(n => n.addEventListener('click', () => {
        hamburger.classList.remove('active');
        navMenu.classList.remove('active');
    }));
}

// Booking system functionality
function initBookingSystem() {
    const bookingForm = document.getElementById('bookingForm');
    const quickBookingForm = document.querySelector('.booking-form-quick');
    
    // Room prices
    const roomPrices = {
        'ocean-view': 180,
        'beachfront-suite': 350,
        'presidential-villa': 650
    };
    
    // Quick booking form
    if (quickBookingForm) {
        quickBookingForm.addEventListener('submit', handleQuickBooking);
    }
    
    // Main booking form
    if (bookingForm) {
        bookingForm.addEventListener('submit', handleBookingSubmission);
        
        // Add event listeners for booking calculation
        const checkinDate = document.getElementById('checkinDate');
        const checkoutDate = document.getElementById('checkoutDate');
        const roomType = document.getElementById('roomType');
        const guestCount = document.getElementById('guestCount');
        
        [checkinDate, checkoutDate, roomType, guestCount].forEach(element => {
            if (element) {
                element.addEventListener('change', updateBookingSummary);
            }
        });
    }
}

// Handle quick booking form submission
function handleQuickBooking(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const checkin = formData.get('checkin');
    const checkout = formData.get('checkout');
    const guests = formData.get('guests');
    
    if (!checkin || !checkout) {
        showNotification('Please select both check-in and check-out dates.', 'error');
        return;
    }
    
    if (new Date(checkin) >= new Date(checkout)) {
        showNotification('Check-out date must be after check-in date.', 'error');
        return;
    }
    
    // Scroll to main booking form and pre-fill data
    const mainBookingSection = document.getElementById('booking');
    const mainCheckin = document.getElementById('checkinDate');
    const mainCheckout = document.getElementById('checkoutDate');
    const mainGuests = document.getElementById('guestCount');
    
    if (mainCheckin) mainCheckin.value = checkin;
    if (mainCheckout) mainCheckout.value = checkout;
    if (mainGuests) mainGuests.value = guests;
    
    // Update booking summary
    updateBookingSummary();
    
    // Scroll to booking section
    if (mainBookingSection) {
        const offsetTop = mainBookingSection.offsetTop - 80;
        window.scrollTo({
            top: offsetTop,
            behavior: 'smooth'
        });
    }
    
    showNotification('Please complete your booking details below.', 'success');
}

// Handle main booking form submission
function handleBookingSubmission(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const bookingData = Object.fromEntries(formData);
    
    // Validate form
    if (!validateBookingForm(bookingData)) {
        return;
    }
    
    // Show loading state
    const submitBtn = e.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Processing...';
    submitBtn.disabled = true;
    
    // Simulate booking process
    setTimeout(() => {
        // Reset button
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
        
        // Show success message
        showBookingConfirmation(bookingData);
        
        // Reset form
        e.target.reset();
        updateBookingSummary();
        
    }, 2000);
}

// Validate booking form
function validateBookingForm(data) {
    const errors = [];
    
    // Required fields
    const requiredFields = ['firstName', 'lastName', 'email', 'checkinDate', 'checkoutDate', 'roomType', 'guestCount'];
    requiredFields.forEach(field => {
        if (!data[field] || data[field].trim() === '') {
            errors.push(`${getFieldLabel(field)} is required.`);
        }
    });
    
    // Email validation
    if (data.email && !isValidEmail(data.email)) {
        errors.push('Please enter a valid email address.');
    }
    
    // Date validation
    if (data.checkinDate && data.checkoutDate) {
        const checkin = new Date(data.checkinDate);
        const checkout = new Date(data.checkoutDate);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        if (checkin < today) {
            errors.push('Check-in date cannot be in the past.');
        }
        
        if (checkout <= checkin) {
            errors.push('Check-out date must be after check-in date.');
        }
        
        const daysDiff = (checkout - checkin) / (1000 * 60 * 60 * 24);
        if (daysDiff > 30) {
            errors.push('Maximum stay is 30 nights.');
        }
    }
    
    // Display errors
    if (errors.length > 0) {
        showNotification(errors.join('<br>'), 'error');
        return false;
    }
    
    return true;
}

// Update booking summary
function updateBookingSummary() {
    const checkinDate = document.getElementById('checkinDate');
    const checkoutDate = document.getElementById('checkoutDate');
    const roomType = document.getElementById('roomType');
    const guestCount = document.getElementById('guestCount');
    const summaryElement = document.getElementById('bookingSummary');
    
    if (!checkinDate || !checkoutDate || !roomType || !summaryElement) {
        return;
    }
    
    const checkin = checkinDate.value;
    const checkout = checkoutDate.value;
    const room = roomType.value;
    const guests = guestCount ? guestCount.value : '2';
    
    if (!checkin || !checkout || !room) {
        summaryElement.innerHTML = '<p>Please select your dates and room type to see pricing</p>';
        return;
    }
    
    const checkinDateObj = new Date(checkin);
    const checkoutDateObj = new Date(checkout);
    const nights = Math.ceil((checkoutDateObj - checkinDateObj) / (1000 * 60 * 60 * 24));
    
    if (nights <= 0) {
        summaryElement.innerHTML = '<p>Please select valid dates</p>';
        return;
    }
    
    const roomPrices = {
        'ocean-view': 180,
        'beachfront-suite': 350,
        'presidential-villa': 650
    };
    
    const roomNames = {
        'ocean-view': 'Ocean View Room',
        'beachfront-suite': 'Beachfront Suite',
        'presidential-villa': 'Presidential Villa'
    };
    
    const pricePerNight = roomPrices[room] || 0;
    const subtotal = pricePerNight * nights;
    const tax = subtotal * 0.16; // 16% tax (typical for Colombia)
    const total = subtotal + tax;
    
    summaryElement.innerHTML = `
        <div class="booking-details">
            <p><strong>Room:</strong> ${roomNames[room]}</p>
            <p><strong>Dates:</strong> ${formatDate(checkin)} - ${formatDate(checkout)}</p>
            <p><strong>Nights:</strong> ${nights}</p>
            <p><strong>Guests:</strong> ${guests}</p>
            <hr style="margin: 15px 0; border: 1px solid #eee;">
            <p><strong>Room Rate:</strong> $${pricePerNight} × ${nights} nights = $${subtotal.toFixed(2)}</p>
            <p><strong>Taxes & Fees:</strong> $${tax.toFixed(2)}</p>
            <p style="font-size: 1.2rem; color: #ff6b35;"><strong>Total: $${total.toFixed(2)}</strong></p>
        </div>
    `;
}

// Date validation
function initDateValidation() {
    const checkinInputs = document.querySelectorAll('input[type="date"]');
    const today = new Date().toISOString().split('T')[0];
    
    checkinInputs.forEach(input => {
        input.setAttribute('min', today);
    });
}

// Scroll effects
function initScrollEffects() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);
    
    // Observe elements for scroll animations
    const animateElements = document.querySelectorAll('.room-card, .amenity, .restaurant, .feature');
    animateElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });
}

// Utility functions
function getFieldLabel(fieldName) {
    const labels = {
        firstName: 'First Name',
        lastName: 'Last Name',
        email: 'Email Address',
        checkinDate: 'Check-in Date',
        checkoutDate: 'Check-out Date',
        roomType: 'Room Type',
        guestCount: 'Number of Guests'
    };
    return labels[fieldName] || fieldName;
}

function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

function showNotification(message, type = 'info') {
    // Remove existing notifications
    const existingNotifications = document.querySelectorAll('.notification');
    existingNotifications.forEach(notification => notification.remove());
    
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <span class="notification-message">${message}</span>
            <button class="notification-close" onclick="this.parentElement.parentElement.remove()">×</button>
        </div>
    `;
    
    // Add styles
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: ${type === 'error' ? '#e74c3c' : type === 'success' ? '#2E8B57' : '#4682B4'};
        color: white;
        padding: 15px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 10000;
        max-width: 400px;
        animation: slideInRight 0.3s ease;
    `;
    
    // Add animation styles if not exist
    if (!document.querySelector('#notification-styles')) {
        const style = document.createElement('style');
        style.id = 'notification-styles';
        style.textContent = `
            @keyframes slideInRight {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
            .notification-content {
                display: flex;
                justify-content: space-between;
                align-items: center;
                gap: 15px;
            }
            .notification-close {
                background: none;
                border: none;
                color: white;
                font-size: 20px;
                font-weight: bold;
                cursor: pointer;
                padding: 0;
                width: 20px;
                height: 20px;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            .notification-close:hover {
                opacity: 0.7;
            }
        `;
        document.head.appendChild(style);
    }
    
    document.body.appendChild(notification);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (notification.parentElement) {
            notification.remove();
        }
    }, 5000);
}

function showBookingConfirmation(bookingData) {
    const modal = document.createElement('div');
    modal.className = 'booking-confirmation-modal';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h2><i class="fas fa-check-circle"></i> Booking Confirmed!</h2>
                <button class="modal-close" onclick="this.parentElement.parentElement.parentElement.remove()">×</button>
            </div>
            <div class="modal-body">
                <p>Thank you, ${bookingData.firstName}! Your reservation has been confirmed.</p>
                <div class="confirmation-details">
                    <p><strong>Confirmation Number:</strong> CC${Date.now().toString().slice(-6)}</p>
                    <p><strong>Check-in:</strong> ${formatDate(bookingData.checkinDate)}</p>
                    <p><strong>Check-out:</strong> ${formatDate(bookingData.checkoutDate)}</p>
                    <p><strong>Room:</strong> ${document.getElementById('roomType').options[document.getElementById('roomType').selectedIndex].text}</p>
                    <p><strong>Guests:</strong> ${bookingData.guestCount}</p>
                </div>
                <p class="confirmation-note">A confirmation email has been sent to ${bookingData.email}. Please check your email for detailed information about your stay.</p>
                <div class="modal-actions">
                    <button class="btn btn-primary" onclick="this.parentElement.parentElement.parentElement.parentElement.remove()">Continue</button>
                </div>
            </div>
        </div>
    `;
    
    // Add modal styles
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.8);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10001;
        animation: fadeIn 0.3s ease;
    `;
    
    // Add modal styles if not exist
    if (!document.querySelector('#modal-styles')) {
        const style = document.createElement('style');
        style.id = 'modal-styles';
        style.textContent = `
            @keyframes fadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
            }
            .modal-content {
                background: white;
                border-radius: 15px;
                max-width: 500px;
                width: 90%;
                max-height: 80vh;
                overflow-y: auto;
                animation: slideUp 0.3s ease;
            }
            @keyframes slideUp {
                from { transform: translateY(50px); opacity: 0; }
                to { transform: translateY(0); opacity: 1; }
            }
            .modal-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 20px 30px;
                background: #f8f9fa;
                border-radius: 15px 15px 0 0;
                border-bottom: 1px solid #eee;
            }
            .modal-header h2 {
                margin: 0;
                color: #2E8B57;
                display: flex;
                align-items: center;
                gap: 10px;
            }
            .modal-close {
                background: none;
                border: none;
                font-size: 24px;
                font-weight: bold;
                cursor: pointer;
                color: #666;
                width: 30px;
                height: 30px;
                display: flex;
                align-items: center;
                justify-content: center;
                border-radius: 50%;
                transition: background 0.3s ease;
            }
            .modal-close:hover {
                background: #f0f0f0;
            }
            .modal-body {
                padding: 30px;
            }
            .confirmation-details {
                background: #f8f9fa;
                padding: 20px;
                border-radius: 8px;
                margin: 20px 0;
            }
            .confirmation-details p {
                margin-bottom: 10px;
            }
            .confirmation-note {
                color: #666;
                font-style: italic;
                margin-top: 20px;
            }
            .modal-actions {
                text-align: center;
                margin-top: 30px;
            }
        `;
        document.head.appendChild(style);
    }
    
    document.body.appendChild(modal);
}

// Initialize room booking buttons
document.addEventListener('DOMContentLoaded', function() {
    const roomBookingButtons = document.querySelectorAll('.room-card .btn');
    
    roomBookingButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Get room type from the card
            const roomCard = this.closest('.room-card');
            const roomTitle = roomCard.querySelector('h3').textContent;
            const roomTypeSelect = document.getElementById('roomType');
            
            // Map room titles to select values
            const roomMapping = {
                'Ocean View Room': 'ocean-view',
                'Beachfront Suite': 'beachfront-suite',
                'Presidential Villa': 'presidential-villa'
            };
            
            if (roomTypeSelect && roomMapping[roomTitle]) {
                roomTypeSelect.value = roomMapping[roomTitle];
                updateBookingSummary();
            }
            
            // Scroll to booking section
            const bookingSection = document.getElementById('booking');
            if (bookingSection) {
                const offsetTop = bookingSection.offsetTop - 80;
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
            }
        });
    });
});