// Global currency management instance
let currencyManager;

// DOM Content Loaded
document.addEventListener('DOMContentLoaded', async function() {
    // Initialize currency system first
    currencyManager = new CurrencyManager();
    await currencyManager.initialize();
    
    // Initialize all functionality
    initNavigation();
    initBookingSystem();
    initScrollEffects();
    initMobileMenu();
    initDateValidation();
    initCurrencySystem();
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
async function handleQuickBooking(e) {
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
    
    try {
        // Check availability for selected dates
        const response = await fetch(`/api/availability?checkIn=${checkin}&checkOut=${checkout}`);
        const result = await response.json();
        
        if (result.success) {
            const availability = result.data.availability;
            const hasAvailability = Object.values(availability).some(room => room.available > 0);
            
            if (!hasAvailability) {
                showNotification('Sorry, no rooms are available for your selected dates. Please try different dates.', 'error');
                return;
            }
            
            // Show availability info
            showNotification(`Great! We have rooms available for your dates. Please complete your booking below.`, 'success');
        }
    } catch (error) {
        console.error('Error checking availability:', error);
        showNotification('Unable to check availability at the moment. Please try booking directly below.', 'error');
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
}

// Handle main booking form submission
async function handleBookingSubmission(e) {
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
    
    try {
        // Make API call to create booking
        const response = await fetch('/api/bookings', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                firstName: bookingData.firstName,
                lastName: bookingData.lastName,
                email: bookingData.email,
                phone: bookingData.phone || '',
                checkInDate: bookingData.checkinDate,
                checkOutDate: bookingData.checkoutDate,
                roomType: bookingData.roomType,
                guestCount: parseInt(bookingData.guestCount),
                specialRequests: bookingData.specialRequests || ''
            })
        });
        
        const result = await response.json();
        
        if (result.success) {
            // Show success message with real booking data
            showBookingConfirmation(result.data.booking, result.data.confirmationNumber);
            
            // Reset form
            e.target.reset();
            updateBookingSummary();
            
            // Update room availability display
            await updateRoomAvailability();
            
        } else {
            throw new Error(result.message || 'Booking failed');
        }
        
    } catch (error) {
        console.error('Booking error:', error);
        showNotification(
            `Booking failed: ${error.message}. Please try again or contact us directly.`, 
            'error'
        );
    } finally {
        // Reset button
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
    }
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

function showBookingConfirmation(bookingData, confirmationNumber) {
    const modal = document.createElement('div');
    modal.className = 'booking-confirmation-modal';
    
    // Get room type display name
    const roomNames = {
        'ocean-view': 'Ocean View Room',
        'beachfront-suite': 'Beachfront Suite', 
        'presidential-villa': 'Presidential Villa'
    };
    
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h2><i class="fas fa-check-circle"></i> Booking Confirmed!</h2>
                <button class="modal-close" onclick="this.parentElement.parentElement.parentElement.remove()">×</button>
            </div>
            <div class="modal-body">
                <p>Thank you, ${bookingData.firstName}! Your reservation has been confirmed.</p>
                <div class="confirmation-details">
                    <p><strong>Confirmation Number:</strong> ${confirmationNumber}</p>
                    <p><strong>Check-in:</strong> ${formatDate(bookingData.checkInDate)}</p>
                    <p><strong>Check-out:</strong> ${formatDate(bookingData.checkOutDate)}</p>
                    <p><strong>Room:</strong> ${roomNames[bookingData.roomType]}</p>
                    <p><strong>Guests:</strong> ${bookingData.guestCount}</p>
                    <p><strong>Nights:</strong> ${bookingData.numberOfNights}</p>
                    <p><strong>Total Amount:</strong> $${bookingData.totalAmount.toFixed(2)}</p>
                </div>
                <p class="confirmation-note">Your booking has been saved successfully! ${bookingData.email ? `A confirmation email will be sent to ${bookingData.email}.` : ''}</p>
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

// Update room availability display
async function updateRoomAvailability() {
    try {
        const checkinDate = document.getElementById('checkinDate');
        const checkoutDate = document.getElementById('checkoutDate');
        
        if (!checkinDate?.value || !checkoutDate?.value) {
            return;
        }
        
        const response = await fetch(`/api/availability?checkIn=${checkinDate.value}&checkOut=${checkoutDate.value}`);
        const result = await response.json();
        
        if (result.success) {
            const availability = result.data.availability;
            
            // Update room cards with availability info
            const roomCards = document.querySelectorAll('.room-card');
            roomCards.forEach(card => {
                const roomTitle = card.querySelector('h3').textContent;
                const roomMapping = {
                    'Ocean View Room': 'ocean-view',
                    'Beachfront Suite': 'beachfront-suite',
                    'Presidential Villa': 'presidential-villa'
                };
                
                const roomType = roomMapping[roomTitle];
                if (roomType && availability[roomType]) {
                    const availabilityInfo = card.querySelector('.availability-info') || 
                                           document.createElement('div');
                    availabilityInfo.className = 'availability-info';
                    
                    const available = availability[roomType].available;
                    if (available > 0) {
                        availabilityInfo.innerHTML = `<span style="color: #2E8B57; font-weight: bold;">✓ ${available} rooms available</span>`;
                    } else {
                        availabilityInfo.innerHTML = `<span style="color: #e74c3c; font-weight: bold;">✗ Fully booked</span>`;
                    }
                    
                    if (!card.querySelector('.availability-info')) {
                        card.querySelector('.room-info').appendChild(availabilityInfo);
                    }
                }
            });
        }
    } catch (error) {
        console.error('Error updating room availability:', error);
    }
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
    
    // Update availability when dates change
    const dateInputs = document.querySelectorAll('#checkinDate, #checkoutDate');
    dateInputs.forEach(input => {
        input.addEventListener('change', () => {
            setTimeout(updateRoomAvailability, 500); // Small delay to ensure both dates are updated
        });
    });
});

// Currency System Functions
function initCurrencySystem() {
    const currencySelect = document.getElementById('currencySelect');
    
    if (currencySelect) {
        // Set initial currency
        currencySelect.value = currencyManager.currentCurrency;
        
        // Handle currency changes
        currencySelect.addEventListener('change', function() {
            const newCurrency = this.value;
            currencyManager.saveCurrency(newCurrency);
            updateAllPrices();
            
            // Show currency change notification
            showNotification(`Currency changed to ${currencyManager.getName(newCurrency)}`, 'success');
        });
        
        // Initial price update
        updateAllPrices();
    }
}

// Update all prices on the page
function updateAllPrices() {
    // Update room prices in the rooms section
    updateRoomPrices();
    
    // Update booking summary if visible
    updateBookingSummary();
    
    // Update any other price displays
    updateMiscPrices();
}

// Update room prices in the rooms section
function updateRoomPrices() {
    const roomPrices = {
        'ocean-view': 180,
        'beachfront-suite': 350,
        'presidential-villa': 650
    };
    
    // Update room cards
    const roomCards = document.querySelectorAll('.room-card');
    roomCards.forEach((card, index) => {
        const priceElement = card.querySelector('.room-price');
        if (priceElement) {
            // Try to get room type from title first
            const roomTitle = card.querySelector('h3');
            let roomType;
            
            if (roomTitle) {
                const titleText = roomTitle.textContent;
                if (titleText.includes('Ocean View')) roomType = 'ocean-view';
                else if (titleText.includes('Beachfront Suite')) roomType = 'beachfront-suite';
                else if (titleText.includes('Presidential Villa')) roomType = 'presidential-villa';
            }
            
            // If no title found, use card index as fallback
            if (!roomType) {
                const roomTypesByIndex = ['ocean-view', 'beachfront-suite', 'presidential-villa'];
                roomType = roomTypesByIndex[index];
            }
            
            if (roomType && roomPrices[roomType]) {
                const formattedPrice = currencyManager.format(roomPrices[roomType]);
                priceElement.innerHTML = `
                    <span class="price-label">From</span>
                    <span class="price-amount">${formattedPrice}</span>
                    <span class="price-period">/night</span>
                `;
            }
        }
    });
}

// Update miscellaneous prices
function updateMiscPrices() {
    // Update any other price elements with data-price attribute
    const priceElements = document.querySelectorAll('[data-price]');
    priceElements.forEach(element => {
        const basePrice = parseFloat(element.dataset.price);
        if (!isNaN(basePrice)) {
            element.textContent = currencyManager.format(basePrice);
        }
    });
}

// Enhanced update booking summary with currency support
function updateBookingSummaryWithCurrency() {
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
    
    // Format prices with current currency
    const formattedPricePerNight = currencyManager.format(pricePerNight);
    const formattedSubtotal = currencyManager.format(subtotal);
    const formattedTax = currencyManager.format(tax);
    const formattedTotal = currencyManager.format(total);
    
    summaryElement.innerHTML = `
        <div class="booking-details">
            <p><strong>Room:</strong> ${roomNames[room]}</p>
            <p><strong>Dates:</strong> ${formatDate(checkin)} - ${formatDate(checkout)}</p>
            <p><strong>Nights:</strong> ${nights}</p>
            <p><strong>Guests:</strong> ${guests}</p>
            <hr style="margin: 15px 0; border: 1px solid #eee;">
            <p><strong>Room Rate:</strong> ${formattedPricePerNight} × ${nights} nights = ${formattedSubtotal}</p>
            <p><strong>Taxes & Fees:</strong> ${formattedTax}</p>
            <p style="font-size: 1.2rem; color: #2E8B57;"><strong>Total: ${formattedTotal}</strong></p>
            <small style="color: #666; font-style: italic;">
                Prices shown in ${currencyManager.getName()}
                ${currencyManager.currentCurrency !== 'COP' ? ' (converted from Colombian Pesos)' : ''}
            </small>
        </div>
    `;
}

// Override the original updateBookingSummary function
const originalUpdateBookingSummary = updateBookingSummary;
updateBookingSummary = updateBookingSummaryWithCurrency;

// Stripe Payment Integration
let stripe;
let elements;
let card;

// Initialize Stripe
function initializeStripe() {
    // Initialize Stripe (you'll need to replace with your publishable key)
    stripe = Stripe('pk_test_your_publishable_key_here'); // Replace with actual key
    elements = stripe.elements();
    
    // Create card element
    card = elements.create('card', {
        style: {
            base: {
                fontSize: '16px',
                color: '#424770',
                '::placeholder': {
                    color: '#aab7c4',
                },
            },
        },
    });
    
    card.mount('#card-element');
    
    // Handle real-time validation errors from the card Element
    card.on('change', ({error}) => {
        const displayError = document.getElementById('card-errors');
        if (error) {
            displayError.textContent = error.message;
        } else {
            displayError.textContent = '';
        }
    });
}

// Show payment modal
function showPaymentModal(bookingData) {
    const modal = document.getElementById('paymentModal');
    const paymentSummary = document.getElementById('paymentSummary');
    const paymentTotal = document.getElementById('paymentTotal');
    const paymentForm = document.getElementById('paymentForm');
    const paymentSuccess = document.getElementById('paymentSuccess');
    
    // Reset modal state
    document.querySelector('.payment-form-container').style.display = 'block';
    paymentSuccess.classList.add('hidden');
    
    // Calculate pricing
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
    
    const checkinDate = new Date(bookingData.checkinDate);
    const checkoutDate = new Date(bookingData.checkoutDate);
    const nights = Math.ceil((checkoutDate - checkinDate) / (1000 * 60 * 60 * 24));
    const pricePerNight = roomPrices[bookingData.roomType] || 0;
    const subtotal = pricePerNight * nights;
    const tax = subtotal * 0.16;
    const total = subtotal + tax;
    
    // Convert to current currency
    const convertedSubtotal = currencyManager.convert(subtotal);
    const convertedTax = currencyManager.convert(tax);
    const convertedTotal = currencyManager.convert(total);
    
    // Update payment summary
    paymentSummary.innerHTML = `
        <h4>Booking Summary</h4>
        <div class="summary-row">
            <span>Guest:</span>
            <span>${bookingData.firstName} ${bookingData.lastName}</span>
        </div>
        <div class="summary-row">
            <span>Room:</span>
            <span>${roomNames[bookingData.roomType]}</span>
        </div>
        <div class="summary-row">
            <span>Check-in:</span>
            <span>${formatDate(bookingData.checkinDate)}</span>
        </div>
        <div class="summary-row">
            <span>Check-out:</span>
            <span>${formatDate(bookingData.checkoutDate)}</span>
        </div>
        <div class="summary-row">
            <span>Nights:</span>
            <span>${nights}</span>
        </div>
        <div class="summary-row">
            <span>Guests:</span>
            <span>${bookingData.guestCount}</span>
        </div>
        <div class="summary-row">
            <span>Room Rate:</span>
            <span>${currencyManager.format(convertedSubtotal)}</span>
        </div>
        <div class="summary-row">
            <span>Taxes & Fees:</span>
            <span>${currencyManager.format(convertedTax)}</span>
        </div>
        <div class="summary-row">
            <span><strong>Total:</strong></span>
            <span><strong>${currencyManager.format(convertedTotal)}</strong></span>
        </div>
    `;
    
    // Update payment total
    paymentTotal.textContent = currencyManager.format(convertedTotal);
    
    // Store booking data for payment processing
    modal.dataset.bookingData = JSON.stringify({
        ...bookingData,
        originalTotal: total,
        convertedTotal: convertedTotal,
        currency: currencyManager.currentCurrency,
        nights: nights
    });
    
    // Show modal
    modal.classList.add('show');
    
    // Initialize Stripe if not already done
    if (!stripe) {
        initializeStripe();
    }
}

// Handle payment form submission
function handlePaymentSubmit(event) {
    event.preventDefault();
    
    const payButton = document.getElementById('payButton');
    const modal = document.getElementById('paymentModal');
    const bookingData = JSON.parse(modal.dataset.bookingData);
    
    // Disable pay button and show loading
    payButton.disabled = true;
    payButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
    
    // Create payment intent
    createPaymentIntent(bookingData)
        .then(clientSecret => {
            return stripe.confirmCardPayment(clientSecret, {
                payment_method: {
                    card: card,
                    billing_details: {
                        name: `${bookingData.firstName} ${bookingData.lastName}`,
                        email: bookingData.email,
                    }
                }
            });
        })
        .then(result => {
            if (result.error) {
                // Show error to customer
                showNotification(result.error.message, 'error');
                payButton.disabled = false;
                payButton.innerHTML = '<i class="fas fa-lock"></i> Pay Now';
            } else {
                // Payment succeeded
                handlePaymentSuccess(result.paymentIntent);
            }
        })
        .catch(error => {
            console.error('Payment error:', error);
            showNotification('Payment failed. Please try again.', 'error');
            payButton.disabled = false;
            payButton.innerHTML = '<i class="fas fa-lock"></i> Pay Now';
        });
}

// Create payment intent
async function createPaymentIntent(bookingData) {
    try {
        const response = await fetch('/api/payments/create-intent', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                bookingId: bookingData.bookingId,
                currency: bookingData.currency,
                convertedAmount: bookingData.convertedTotal
            })
        });
        
        const result = await response.json();
        
        if (!result.success) {
            throw new Error(result.message || 'Failed to create payment intent');
        }
        
        return result.data.clientSecret;
    } catch (error) {
        console.error('Error creating payment intent:', error);
        throw error;
    }
}

// Handle successful payment
function handlePaymentSuccess(paymentIntent) {
    const modal = document.getElementById('paymentModal');
    const bookingData = JSON.parse(modal.dataset.bookingData);
    
    // Confirm payment with backend
    fetch('/api/payments/confirm', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            paymentIntentId: paymentIntent.id
        })
    })
    .then(response => response.json())
    .then(result => {
        if (result.success) {
            // Show success state
            document.querySelector('.payment-form-container').style.display = 'none';
            document.getElementById('paymentSuccess').classList.remove('hidden');
            document.getElementById('confirmationNumberDisplay').textContent = result.data.confirmationNumber;
            
            // Update booking form to prevent resubmission
            const bookingForm = document.getElementById('bookingForm');
            if (bookingForm) {
                bookingForm.reset();
                updateBookingSummary();
            }
            
            showNotification('Payment successful! Your booking is confirmed.', 'success');
        } else {
            showNotification('Payment processing failed. Please contact support.', 'error');
        }
    })
    .catch(error => {
        console.error('Error confirming payment:', error);
        showNotification('Payment confirmation failed. Please contact support.', 'error');
    });
}

// Initialize payment modal event listeners
document.addEventListener('DOMContentLoaded', function() {
    const paymentModal = document.getElementById('paymentModal');
    const paymentForm = document.getElementById('paymentForm');
    const modalCloseButtons = document.querySelectorAll('.modal-close');
    
    // Handle payment form submission
    if (paymentForm) {
        paymentForm.addEventListener('submit', handlePaymentSubmit);
    }
    
    // Handle modal close
    modalCloseButtons.forEach(button => {
        button.addEventListener('click', function() {
            paymentModal.classList.remove('show');
        });
    });
    
    // Close modal when clicking outside
    paymentModal.addEventListener('click', function(e) {
        if (e.target === paymentModal) {
            paymentModal.classList.remove('show');
        }
    });
});

// Update the booking form submission to show payment modal instead of direct booking
function updateBookingFormForPayments() {
    const bookingForm = document.getElementById('bookingForm');
    if (bookingForm) {
        bookingForm.removeEventListener('submit', handleBookingSubmit);
        bookingForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Validate form first
            const formData = new FormData(this);
            const bookingData = Object.fromEntries(formData);
            
            // Basic validation
            const requiredFields = ['firstName', 'lastName', 'email', 'checkinDate', 'checkoutDate', 'roomType', 'guestCount'];
            const missingFields = requiredFields.filter(field => !bookingData[field]);
            
            if (missingFields.length > 0) {
                showNotification(`Please fill in all required fields: ${missingFields.map(getFieldLabel).join(', ')}`, 'error');
                return;
            }
            
            if (!isValidEmail(bookingData.email)) {
                showNotification('Please enter a valid email address', 'error');
                return;
            }
            
            // Create booking first, then show payment modal
            createBookingForPayment(bookingData);
        });
    }
}

// Create booking and show payment modal
async function createBookingForPayment(formData) {
    try {
        const response = await fetch('/api/bookings', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData)
        });
        
        const result = await response.json();
        
        if (result.success) {
            // Show payment modal with booking data
            const bookingData = {
                ...formData,
                bookingId: result.data.booking._id,
                confirmationNumber: result.data.confirmationNumber,
                checkinDate: formData.checkinDate,
                checkoutDate: formData.checkoutDate
            };
            
            showPaymentModal(bookingData);
        } else {
            showNotification(result.message || 'Failed to create booking', 'error');
        }
    } catch (error) {
        console.error('Error creating booking:', error);
        showNotification('Failed to create booking. Please try again.', 'error');
    }
}

// Initialize payment system when page loads
document.addEventListener('DOMContentLoaded', function() {
    // Update booking form to use payment flow
    updateBookingFormForPayments();
});