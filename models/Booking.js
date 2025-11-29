const mongoose = require('mongoose');
const validator = require('validator');

const bookingSchema = new mongoose.Schema({
    // Guest Information
    firstName: {
        type: String,
        required: [true, 'First name is required'],
        trim: true,
        maxlength: [50, 'First name cannot exceed 50 characters']
    },
    lastName: {
        type: String,
        required: [true, 'Last name is required'],
        trim: true,
        maxlength: [50, 'Last name cannot exceed 50 characters']
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        lowercase: true,
        validate: [validator.isEmail, 'Please provide a valid email']
    },
    phone: {
        type: String,
        trim: true,
        validate: {
            validator: function(v) {
                return !v || validator.isMobilePhone(v, 'any');
            },
            message: 'Please provide a valid phone number'
        }
    },

    // Booking Details
    checkInDate: {
        type: Date,
        required: [true, 'Check-in date is required'],
        validate: {
            validator: function(v) {
                return v >= new Date().setHours(0, 0, 0, 0);
            },
            message: 'Check-in date cannot be in the past'
        }
    },
    checkOutDate: {
        type: Date,
        required: [true, 'Check-out date is required'],
        validate: {
            validator: function(v) {
                return v > this.checkInDate;
            },
            message: 'Check-out date must be after check-in date'
        }
    },
    numberOfNights: {
        type: Number,
        min: [1, 'Minimum stay is 1 night'],
        max: [30, 'Maximum stay is 30 nights']
    },
    roomType: {
        type: String,
        required: [true, 'Room type is required'],
        enum: {
            values: ['ocean-view', 'beachfront-suite', 'presidential-villa'],
            message: 'Invalid room type'
        }
    },
    guestCount: {
        type: Number,
        required: [true, 'Guest count is required'],
        min: [1, 'Minimum 1 guest required'],
        max: [8, 'Maximum 8 guests allowed']
    },
    specialRequests: {
        type: String,
        trim: true,
        maxlength: [500, 'Special requests cannot exceed 500 characters']
    },

    // Pricing
    roomRate: {
        type: Number,
        required: true,
        min: [0, 'Room rate cannot be negative']
    },
    subtotal: {
        type: Number,
        required: true,
        min: [0, 'Subtotal cannot be negative']
    },
    taxes: {
        type: Number,
        required: true,
        min: [0, 'Taxes cannot be negative']
    },
    totalAmount: {
        type: Number,
        required: true,
        min: [0, 'Total amount cannot be negative']
    },

    // Booking Status
    status: {
        type: String,
        enum: ['pending', 'confirmed', 'cancelled', 'completed', 'no-show'],
        default: 'pending'
    },
    confirmationNumber: {
        type: String,
        unique: true
    },

    // Payment Information
    paymentStatus: {
        type: String,
        enum: ['pending', 'paid', 'failed', 'refunded'],
        default: 'pending'
    },
    paymentIntentId: {
        type: String, // Stripe payment intent ID
        sparse: true
    },
    paymentCurrency: {
        type: String,
        default: 'usd'
    },
    convertedAmount: {
        type: Number
    },
    paidAt: {
        type: Date
    },
    paymentMethod: {
        type: String,
        enum: ['card', 'cash', 'bank_transfer'],
        default: 'card'
    },

    // Administrative
    notes: {
        type: String,
        trim: true,
        maxlength: [1000, 'Notes cannot exceed 1000 characters']
    },
    createdBy: {
        type: String,
        enum: ['guest', 'admin', 'system'],
        default: 'guest'
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Indexes for performance
bookingSchema.index({ email: 1 });
bookingSchema.index({ checkInDate: 1, checkOutDate: 1 });
bookingSchema.index({ status: 1 });
bookingSchema.index({ paymentStatus: 1 });

// Virtual for guest full name
bookingSchema.virtual('guestName').get(function() {
    return `${this.firstName} ${this.lastName}`;
});

// Pre-save middleware to calculate numberOfNights
bookingSchema.pre('save', function(next) {
    if (this.checkInDate && this.checkOutDate) {
        const diffTime = this.checkOutDate - this.checkInDate;
        this.numberOfNights = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }
    
    // Generate confirmation number if not exists
    if (!this.confirmationNumber) {
        this.confirmationNumber = 'CC' + Date.now().toString().slice(-8).toUpperCase();
    }
    
    next();
});

// Instance method to check if booking conflicts with another booking
bookingSchema.methods.conflictsWith = function(otherBooking) {
    return this.roomType === otherBooking.roomType &&
           this.checkInDate < otherBooking.checkOutDate &&
           this.checkOutDate > otherBooking.checkInDate;
};

// Static method to find available rooms for date range
bookingSchema.statics.findAvailableRooms = async function(checkIn, checkOut, roomType = null) {
    const query = {
        status: { $in: ['confirmed', 'pending'] },
        $or: [
            {
                checkInDate: { $lt: checkOut },
                checkOutDate: { $gt: checkIn }
            }
        ]
    };
    
    if (roomType) {
        query.roomType = roomType;
    }
    
    const conflictingBookings = await this.find(query);
    
    // Define room inventory
    const roomInventory = {
        'ocean-view': 10,
        'beachfront-suite': 5,
        'presidential-villa': 2
    };
    
    const availability = {};
    
    for (const [type, total] of Object.entries(roomInventory)) {
        if (roomType && roomType !== type) continue;
        
        const booked = conflictingBookings.filter(b => b.roomType === type).length;
        availability[type] = {
            total,
            available: Math.max(0, total - booked),
            booked
        };
    }
    
    return availability;
};

module.exports = mongoose.model('Booking', bookingSchema);