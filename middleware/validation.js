const validator = require('validator');

/**
 * Validate booking data middleware
 */
function validateBookingData(req, res, next) {
    const {
        firstName,
        lastName,
        email,
        phone,
        checkInDate,
        checkOutDate,
        roomType,
        guestCount
    } = req.body;
    
    const errors = [];
    
    // Validate required fields
    if (!firstName || firstName.trim().length === 0) {
        errors.push('First name is required');
    } else if (firstName.trim().length > 50) {
        errors.push('First name cannot exceed 50 characters');
    }
    
    if (!lastName || lastName.trim().length === 0) {
        errors.push('Last name is required');
    } else if (lastName.trim().length > 50) {
        errors.push('Last name cannot exceed 50 characters');
    }
    
    if (!email || !validator.isEmail(email)) {
        errors.push('Valid email address is required');
    }
    
    if (phone && !validator.isMobilePhone(phone, 'any')) {
        errors.push('Please provide a valid phone number');
    }
    
    if (!checkInDate || !validator.isISO8601(checkInDate)) {
        errors.push('Valid check-in date is required');
    }
    
    if (!checkOutDate || !validator.isISO8601(checkOutDate)) {
        errors.push('Valid check-out date is required');
    }
    
    if (!roomType || !['ocean-view', 'beachfront-suite', 'presidential-villa'].includes(roomType)) {
        errors.push('Valid room type is required');
    }
    
    if (!guestCount || !validator.isInt(guestCount.toString(), { min: 1, max: 8 })) {
        errors.push('Guest count must be between 1 and 8');
    }
    
    // Validate special requests length
    if (req.body.specialRequests && req.body.specialRequests.length > 500) {
        errors.push('Special requests cannot exceed 500 characters');
    }
    
    if (errors.length > 0) {
        return res.status(400).json({
            success: false,
            message: 'Validation errors',
            errors
        });
    }
    
    next();
}

/**
 * Validate email format
 */
function validateEmail(email) {
    return validator.isEmail(email);
}

/**
 * Validate phone number
 */
function validatePhone(phone) {
    return validator.isMobilePhone(phone, 'any');
}

/**
 * Sanitize string input
 */
function sanitizeString(str, maxLength = 100) {
    if (typeof str !== 'string') return '';
    return validator.escape(str.trim()).substring(0, maxLength);
}

/**
 * Validate date range
 */
function validateDateRange(checkIn, checkOut) {
    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const errors = [];
    
    if (checkInDate < today) {
        errors.push('Check-in date cannot be in the past');
    }
    
    if (checkOutDate <= checkInDate) {
        errors.push('Check-out date must be after check-in date');
    }
    
    const nights = Math.ceil((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24));
    if (nights > 30) {
        errors.push('Maximum stay is 30 nights');
    }
    
    return {
        isValid: errors.length === 0,
        errors,
        nights
    };
}

module.exports = {
    validateBookingData,
    validateEmail,
    validatePhone,
    sanitizeString,
    validateDateRange
};