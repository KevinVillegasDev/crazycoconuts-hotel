const express = require('express');
const router = express.Router();
const Booking = require('../models/Booking');
const { sendBookingConfirmation } = require('../utils/emailService');
const { calculatePricing } = require('../utils/pricing');
const { validateBookingData } = require('../middleware/validation');

// GET /api/bookings - Get all bookings (admin only - will implement auth later)
router.get('/', async (req, res) => {
    try {
        const { status, checkIn, checkOut, email, page = 1, limit = 10 } = req.query;
        
        // Build query
        const query = {};
        if (status) query.status = status;
        if (email) query.email = new RegExp(email, 'i');
        if (checkIn && checkOut) {
            query.$or = [
                { checkInDate: { $gte: new Date(checkIn), $lte: new Date(checkOut) } },
                { checkOutDate: { $gte: new Date(checkIn), $lte: new Date(checkOut) } }
            ];
        }
        
        // Pagination
        const skip = (page - 1) * limit;
        const total = await Booking.countDocuments(query);
        
        const bookings = await Booking.find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));
        
        res.json({
            success: true,
            data: {
                bookings,
                pagination: {
                    current: parseInt(page),
                    total: Math.ceil(total / limit),
                    count: bookings.length,
                    totalRecords: total
                }
            }
        });
    } catch (error) {
        console.error('Error fetching bookings:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch bookings'
        });
    }
});

// GET /api/bookings/:confirmationNumber - Get booking by confirmation number
router.get('/:confirmationNumber', async (req, res) => {
    try {
        const booking = await Booking.findOne({ 
            confirmationNumber: req.params.confirmationNumber.toUpperCase() 
        });
        
        if (!booking) {
            return res.status(404).json({
                success: false,
                message: 'Booking not found'
            });
        }
        
        res.json({
            success: true,
            data: booking
        });
    } catch (error) {
        console.error('Error fetching booking:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch booking'
        });
    }
});

// POST /api/bookings - Create new booking
router.post('/', validateBookingData, async (req, res) => {
    try {
        const {
            firstName,
            lastName,
            email,
            phone,
            checkInDate,
            checkOutDate,
            roomType,
            guestCount,
            specialRequests
        } = req.body;
        
        // Validate dates
        const checkIn = new Date(checkInDate);
        const checkOut = new Date(checkOutDate);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        if (checkIn < today) {
            return res.status(400).json({
                success: false,
                message: 'Check-in date cannot be in the past'
            });
        }
        
        if (checkOut <= checkIn) {
            return res.status(400).json({
                success: false,
                message: 'Check-out date must be after check-in date'
            });
        }
        
        const nights = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));
        if (nights > 30) {
            return res.status(400).json({
                success: false,
                message: 'Maximum stay is 30 nights'
            });
        }
        
        // Check room availability
        const availability = await Booking.findAvailableRooms(checkIn, checkOut, roomType);
        if (availability[roomType].available === 0) {
            return res.status(400).json({
                success: false,
                message: 'No rooms available for selected dates'
            });
        }
        
        // Calculate pricing
        const pricing = calculatePricing(roomType, nights);
        
        // Create booking
        const booking = new Booking({
            firstName,
            lastName,
            email,
            phone,
            checkInDate: checkIn,
            checkOutDate: checkOut,
            roomType,
            guestCount,
            specialRequests,
            roomRate: pricing.roomRate,
            subtotal: pricing.subtotal,
            taxes: pricing.taxes,
            totalAmount: pricing.total,
            status: 'pending'
        });
        
        await booking.save();
        
        // Send confirmation email (don't wait for it to complete)
        sendBookingConfirmation(booking).catch(error => {
            console.error('Failed to send booking confirmation:', error);
        });
        
        res.status(201).json({
            success: true,
            message: 'Booking created successfully',
            data: {
                confirmationNumber: booking.confirmationNumber,
                booking: booking
            }
        });
        
    } catch (error) {
        console.error('Error creating booking:', error);
        
        if (error.name === 'ValidationError') {
            return res.status(400).json({
                success: false,
                message: 'Validation error',
                errors: Object.values(error.errors).map(e => e.message)
            });
        }
        
        res.status(500).json({
            success: false,
            message: 'Failed to create booking'
        });
    }
});

// PUT /api/bookings/:id - Update booking
router.put('/:id', async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id);
        
        if (!booking) {
            return res.status(404).json({
                success: false,
                message: 'Booking not found'
            });
        }
        
        // Only allow certain fields to be updated
        const allowedUpdates = [
            'firstName', 'lastName', 'email', 'phone', 
            'specialRequests', 'status', 'notes'
        ];
        
        const updates = {};
        allowedUpdates.forEach(field => {
            if (req.body[field] !== undefined) {
                updates[field] = req.body[field];
            }
        });
        
        Object.assign(booking, updates);
        await booking.save();
        
        res.json({
            success: true,
            message: 'Booking updated successfully',
            data: booking
        });
        
    } catch (error) {
        console.error('Error updating booking:', error);
        
        if (error.name === 'ValidationError') {
            return res.status(400).json({
                success: false,
                message: 'Validation error',
                errors: Object.values(error.errors).map(e => e.message)
            });
        }
        
        res.status(500).json({
            success: false,
            message: 'Failed to update booking'
        });
    }
});

// DELETE /api/bookings/:id - Cancel booking
router.delete('/:id', async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id);
        
        if (!booking) {
            return res.status(404).json({
                success: false,
                message: 'Booking not found'
            });
        }
        
        // Don't allow cancellation of completed bookings
        if (booking.status === 'completed') {
            return res.status(400).json({
                success: false,
                message: 'Cannot cancel completed bookings'
            });
        }
        
        booking.status = 'cancelled';
        await booking.save();
        
        res.json({
            success: true,
            message: 'Booking cancelled successfully',
            data: booking
        });
        
    } catch (error) {
        console.error('Error cancelling booking:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to cancel booking'
        });
    }
});

module.exports = router;