const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
    type: {
        type: String,
        required: true,
        enum: ['ocean-view', 'beachfront-suite', 'presidential-villa'],
        unique: true
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true,
        trim: true
    },
    basePrice: {
        type: Number,
        required: true,
        min: [0, 'Price cannot be negative']
    },
    maxGuests: {
        type: Number,
        required: true,
        min: [1, 'Maximum guests must be at least 1'],
        max: [8, 'Maximum guests cannot exceed 8']
    },
    totalRooms: {
        type: Number,
        required: true,
        min: [1, 'Must have at least 1 room'],
        max: [50, 'Cannot exceed 50 rooms']
    },
    amenities: [{
        icon: { type: String, required: true },
        name: { type: String, required: true },
        description: { type: String }
    }],
    images: [{
        url: { type: String, required: true },
        alt: { type: String, required: true },
        isPrimary: { type: Boolean, default: false }
    }],
    isActive: {
        type: Boolean,
        default: true
    },
    seasonalPricing: [{
        name: { type: String, required: true }, // e.g., "High Season", "Holiday Period"
        startDate: { type: Date, required: true },
        endDate: { type: Date, required: true },
        priceMultiplier: { 
            type: Number, 
            required: true,
            min: [0.1, 'Price multiplier must be at least 0.1'],
            max: [5.0, 'Price multiplier cannot exceed 5.0']
        }
    }]
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Virtual for primary image
roomSchema.virtual('primaryImage').get(function() {
    const primary = this.images.find(img => img.isPrimary);
    return primary || this.images[0];
});

// Instance method to get price for specific date range
roomSchema.methods.getPriceForDates = function(checkIn, checkOut) {
    let totalPrice = 0;
    const current = new Date(checkIn);
    const end = new Date(checkOut);
    
    while (current < end) {
        let dailyRate = this.basePrice;
        
        // Check for seasonal pricing
        const applicableSeason = this.seasonalPricing.find(season => {
            return current >= season.startDate && current <= season.endDate;
        });
        
        if (applicableSeason) {
            dailyRate = this.basePrice * applicableSeason.priceMultiplier;
        }
        
        totalPrice += dailyRate;
        current.setDate(current.getDate() + 1);
    }
    
    return Math.round(totalPrice * 100) / 100; // Round to 2 decimal places
};

// Static method to get all active rooms with pricing
roomSchema.statics.getAllWithPricing = async function(checkIn = null, checkOut = null) {
    const rooms = await this.find({ isActive: true }).sort({ basePrice: 1 });
    
    if (checkIn && checkOut) {
        return rooms.map(room => ({
            ...room.toObject(),
            totalPrice: room.getPriceForDates(checkIn, checkOut)
        }));
    }
    
    return rooms;
};

module.exports = mongoose.model('Room', roomSchema);